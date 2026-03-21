const Booking = require('../models/bookingModel');
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

    // 2. Mark the Room as Full
    const room = await Room.findByIdAndUpdate(booking.roomId, { status: 'Full' });

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

module.exports = { createCheckoutSession, verifyPayment };