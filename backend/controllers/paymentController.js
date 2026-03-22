const Booking = require('../models/bookingModel');
const MealBooking = require('../models/mealBookingModel');
const Room = require('../models/roomModel');
const Invoice = require('../models/invoiceModel'); // REQUIRED for Admin Dashboard
const Student = require('../models/studentModel'); 

// @desc    Create Stripe Checkout Session
// @route   POST /api/payment/create-checkout-session
const createCheckoutSession = async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key is missing from the .env file.");
    }
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const { bookingId } = req.body;
    
    const booking = await Booking.findById(bookingId).populate('roomId');
    const room = await Room.findById(booking.roomId);

    if (!booking || !room) {
      return res.status(404).json({ message: 'Booking or Room not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr', 
            product_data: {
              name: `Key Money (Deposit) for Room ${room.roomNumber}`,
              description: 'Refundable deposit as per hostel agreement.',
            },
            unit_amount: room.keyMoney * 100, 
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: `First Month Rent for Room ${room.roomNumber}`,
            },
            unit_amount: room.monthlyRent * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/payment-success/${booking._id}`,
      cancel_url: `http://localhost:5173/profile`,
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    res.json({ id: session.id, url: session.url });

  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Payment and Update DB
// @route   POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // 1. Mark Booking as Paid
    booking.paymentStatus = 'Paid';
    booking.status = 'Confirmed';
    await booking.save();

    // 2. Update occupancy & Check if full
    const room = await Room.findById(booking.roomId);
    if (room) {
      room.currentOccupancy = (room.currentOccupancy || 0) + 1; // Add 1 student
      
      // Only mark as full if we hit the max capacity!
      if (room.currentOccupancy >= room.maxCapacity) {
        room.status = 'Full';
      }
      await room.save();
    }

    // 3. GENERATE THE RECEIPT FOR THE ADMIN DASHBOARD
    const student = await Student.findOne({ email: booking.studentEmail });
    
    await Invoice.create({
      studentId: student ? student._id : booking._id,
      studentEmail: booking.studentEmail,
      studentName: booking.studentName,
      roomNumber: booking.roomNumber,
      description: `First Month Rent & Key Money (Room ${booking.roomNumber})`,
      amount: (room.monthlyRent || 0) + (room.keyMoney || 0),
      status: 'Paid',
      stripeSessionId: booking.stripeSessionId || 'Manual/Test',
      paidAt: new Date()
    });

    res.json({ success: true, message: 'Payment verified and Invoice created!' });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const createMealCheckoutSession = async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key is missing from the .env file.");
    }
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { mealBookingId } = req.body;

    const mealBooking = await MealBooking.findById(mealBookingId);
    if (!mealBooking || mealBooking.type !== 'External') {
      return res.status(404).json({ message: 'External meal order not found.' });
    }

    if (mealBooking.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'This meal order is already paid.' });
    }

    const amount = mealBooking.externalAmount || 1200;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: `External Meal Order - ${mealBooking.externalShopName}`,
              description: `${mealBooking.externalMenuItem} (${mealBooking.slotLabel})`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/meal-payment-success/${mealBooking._id}`,
      cancel_url: `http://localhost:5173/student/meals`,
    });

    mealBooking.stripeSessionId = session.id;
    await mealBooking.save();

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Meal Stripe Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const verifyMealPayment = async (req, res) => {
  try {
    const { mealBookingId } = req.body;
    const mealBooking = await MealBooking.findById(mealBookingId);
    if (!mealBooking) {
      return res.status(404).json({ message: 'Meal order not found.' });
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
      amount: mealBooking.externalAmount || 1200,
      status: 'Paid',
      stripeSessionId: mealBooking.stripeSessionId || 'Manual/Test',
      paidAt: new Date(),
    });

    res.json({ success: true, message: 'Meal payment verified and invoice created.' });
  } catch (error) {
    console.error('Meal Verification Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCheckoutSession,
  verifyPayment,
  createMealCheckoutSession,
  verifyMealPayment,
};