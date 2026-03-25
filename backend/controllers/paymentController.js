const Booking = require('../models/bookingModel');
const Room = require('../models/roomModel');
const Invoice = require('../models/invoiceModel');
const Student = require('../models/studentModel'); 

const createCheckoutSession = async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    const room = await Room.findById(booking.roomId);

    if (!booking || !room) return res.status(404).json({ message: 'Booking or Room not found' });

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

    // ==========================================
    // 🛡️ THE FIX: PREVENT DUPLICATE INITIAL PAYMENTS
    // ==========================================
    if (booking.paymentStatus === 'Paid') {
      return res.json({ success: true, message: 'Payment was already verified. No duplicate invoice created.' });
    }

    booking.paymentStatus = 'Paid';
    booking.status = 'Confirmed';
    
    const startDate = booking.expectedMoveInDate ? new Date(booking.expectedMoveInDate) : new Date();
    booking.paidUntil = startDate; 
    
    await booking.save();

    const room = await Room.findById(booking.roomId);
    if (room) {
      room.currentOccupancy = (room.currentOccupancy || 0) + 1; 
      if (room.currentOccupancy >= room.maxCapacity) room.status = 'Full';
      await room.save();
    }

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
// MONTHLY RENT STRIPE FUNCTIONS
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
            product_data: { 
              name: `Rent for ${monthName}`,
              description: `Room ${room.roomNumber} - Recurring monthly hostel fee.` 
            },
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
    const room = await Room.findById(booking.roomId);
    const student = await Student.findOne({ email: booking.studentEmail });

    // ==========================================
    // 🛡️ THE FIX: PREVENT DUPLICATE MONTHLY PAYMENTS
    // ==========================================
    if (booking.monthlyRentStatus === 'Paid') {
      return res.json({ success: true, message: 'Monthly rent is already paid. No duplicate invoice created.' });
    }

    const currentDate = booking.paidUntil ? new Date(booking.paidUntil) : new Date(booking.createdAt);
    currentDate.setMonth(currentDate.getMonth() + 1);
    const paidMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    booking.paidUntil = currentDate;
    booking.monthlyRentStatus = 'Paid';
    await booking.save();

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

    res.json({ success: true, message: 'Monthly Rent Paid!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCheckoutSession, verifyPayment, createMonthlyCheckout, verifyMonthlyPayment };