const Booking = require('../models/bookingModel');
const MealBooking = require('../models/mealBookingModel');
const Room = require('../models/roomModel');
const Invoice = require('../models/invoiceModel');
const Student = require('../models/studentModel'); 

// Stripe requires card charges to be at least ~USD 0.50 equivalent.
// For LKR, keep a safe floor to avoid conversion-edge rejections.
const MIN_STRIPE_LKR_AMOUNT = 160;

// ==========================================
// 1. INITIAL DEPOSIT & FIRST MONTH RENT
// ==========================================
const createCheckoutSession = async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe secret key is missing.");
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    const room = await Room.findById(booking.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        { price_data: { currency: 'lkr', product_data: { name: `Key Money (Deposit) for Room ${room.roomNumber}` }, unit_amount: room.keyMoney * 100 }, quantity: 1 },
        { price_data: { currency: 'lkr', product_data: { name: `First Month Rent for Room ${room.roomNumber}` }, unit_amount: room.monthlyRent * 100 }, quantity: 1 },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/payment-success/${booking._id}`,
      cancel_url: `http://localhost:5173/profile`,
    });

    booking.stripeSessionId = session.id;
    await booking.save();
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.paymentStatus === 'Paid') {
      return res.json({ success: true, message: 'Payment was already verified. No duplicate invoice created.' });
    }

    const room = await Room.findById(booking.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Mark as paid
    booking.paymentStatus = 'Paid';
    booking.status = 'Confirmed';
    
    const startDate = booking.expectedMoveInDate ? new Date(booking.expectedMoveInDate) : new Date();
    booking.paidUntil = startDate; 
    await booking.save();

    // Add to room occupancy
    room.currentOccupancy = (room.currentOccupancy || 0) + 1; 
    if (room.currentOccupancy >= room.maxCapacity) room.status = 'Full';
    await room.save();

    const student = await Student.findOne({ email: booking.studentEmail });
    const firstMonthName = startDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    await Invoice.create({
      studentId: student ? student._id : booking._id,
      studentEmail: booking.studentEmail,
      studentName: booking.studentName,
      roomNumber: booking.roomNumber,
      description: `First Month Rent & Key Money (Room ${booking.roomNumber})`,
      monthName: firstMonthName, 
      amount: (room.monthlyRent || 0) + (room.keyMoney || 0),
      status: 'Paid',
      stripeSessionId: booking.stripeSessionId || 'Manual/Test',
      paidAt: new Date()
    });

    res.json({ success: true, message: 'Payment verified!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 2. RECURRING MONTHLY RENT
// ==========================================
const createMonthlyCheckout = async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    const room = await Room.findById(booking.roomId);

    const lastPaidDate = booking.paidUntil ? new Date(booking.paidUntil) : new Date(booking.createdAt);
    const nextMonthDate = new Date(lastPaidDate);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    
    const monthName = nextMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: { name: `Rent for ${monthName}`, description: `Room ${room.roomNumber} - Recurring monthly hostel fee.` },
            unit_amount: room.monthlyRent * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/monthly-success/${booking._id}`,
      cancel_url: `http://localhost:5173/profile`,
    });

    booking.monthlyStripeSessionId = session.id;
    await booking.save();

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyMonthlyPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    
    if (booking.monthlyRentStatus === 'Paid') {
      return res.json({ success: true, message: 'Monthly rent is already paid. No duplicate invoice created.' });
    }

    const room = await Room.findById(booking.roomId);
    
    // Update booking paid status
    const currentDate = booking.paidUntil ? new Date(booking.paidUntil) : new Date(booking.createdAt);
    currentDate.setMonth(currentDate.getMonth() + 1);
    const paidMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    booking.paidUntil = currentDate;
    booking.monthlyRentStatus = 'Paid';
    await booking.save();

    // Create Invoice
    const student = await Student.findOne({ email: booking.studentEmail });
    await Invoice.create({
      studentId: student ? student._id : booking._id,
      studentEmail: booking.studentEmail,
      studentName: booking.studentName,
      roomNumber: booking.roomNumber,
      description: `Monthly Rent (Room ${booking.roomNumber})`,
      monthName: paidMonthName,
      amount: room.monthlyRent,
      status: 'Paid',
      stripeSessionId: booking.monthlyStripeSessionId || 'Manual',
      paidAt: new Date()
    });

    res.json({ success: true, message: 'Monthly Rent Paid and Invoice created!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 3. EXTERNAL MEAL PAYMENTS
// ==========================================
const createMealCheckoutSession = async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { mealBookingId } = req.body;

    const mealBooking = await MealBooking.findById(mealBookingId);
    if (!mealBooking || mealBooking.type !== 'External') return res.status(404).json({ message: 'External meal order not found.' });
    if (mealBooking.paymentStatus === 'Paid') return res.status(400).json({ message: 'This meal order is already paid.' });

    const checkoutAmount = Number(mealBooking.externalAmount);
    if (!Number.isFinite(checkoutAmount) || checkoutAmount <= 0) {
      return res.status(400).json({ message: 'Invalid meal order amount for checkout.' });
    }
    if (checkoutAmount < MIN_STRIPE_LKR_AMOUNT) {
      return res.status(400).json({
        message: `This order amount (Rs. ${checkoutAmount}) is below Stripe's minimum charge for LKR. Please set at least Rs. ${MIN_STRIPE_LKR_AMOUNT}.`,
      });
    }
    const lineItems =
      Array.isArray(mealBooking.externalItems) && mealBooking.externalItems.length > 0
        ? mealBooking.externalItems.map((item) => ({
            price_data: {
              currency: 'lkr',
              product_data: {
                name: `${item.itemName} - ${item.supplierName}`,
                description: `External meal (${mealBooking.slotLabel})`,
              },
              unit_amount: Math.round((Number(item.unitPrice) || 0) * 100),
            },
            quantity: Number(item.quantity) || 1,
          }))
        : [
            {
              price_data: {
                currency: 'lkr',
                product_data: { name: `External Meal Order - ${mealBooking.externalShopName}`, description: `${mealBooking.externalMenuItem} (${mealBooking.slotLabel})` },
                unit_amount: Math.round(checkoutAmount * 100),
              },
              quantity: 1,
            },
          ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `http://localhost:5173/meal-payment-success/${mealBooking._id}`,
      cancel_url: `http://localhost:5173/student/meals`,
    });

    mealBooking.stripeSessionId = session.id;
    await mealBooking.save();
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyMealPayment = async (req, res) => {
  try {
    const { mealBookingId } = req.body;
    const mealBooking = await MealBooking.findById(mealBookingId);
    if (!mealBooking) return res.status(404).json({ message: 'Meal order not found.' });
    if (mealBooking.paymentStatus === 'Paid') {
      return res.json({ success: true, message: 'Meal payment already verified.' });
    }

    mealBooking.paymentStatus = 'Paid';
    mealBooking.paidAt = new Date();
    await mealBooking.save();

    const student = await Student.findOne({ email: mealBooking.studentEmail });
    await Invoice.create({
      studentId: student ? student._id : mealBooking._id,
      studentEmail: mealBooking.studentEmail,
      studentName: mealBooking.studentName,
      roomNumber: 'Meal Order',
      description: `External Meal: ${mealBooking.externalMenuItem} (${mealBooking.externalShopName})`,
      amount: Number(mealBooking.externalAmount) || 0,
      status: 'Paid',
      stripeSessionId: mealBooking.stripeSessionId || 'Manual/Test',
      paidAt: new Date(),
    });

    res.json({ success: true, message: 'Meal payment verified and invoice created.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export ALL functions cleanly in one block
module.exports = {
  createCheckoutSession,
  verifyPayment,
  createMonthlyCheckout, 
  verifyMonthlyPayment,
  createMealCheckoutSession,
  verifyMealPayment,
};