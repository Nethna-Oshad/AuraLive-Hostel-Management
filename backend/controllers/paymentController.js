const Booking = require('../models/bookingModel');
const Room = require('../models/roomModel');

// @desc    Create Stripe Checkout Session
// @route   POST /api/payment/create-checkout-session
const createCheckoutSession = async (req, res) => {
  try {
    // FIX: Initialize Stripe INSIDE the function so .env is fully loaded!
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key is missing from the .env file.");
    }
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const { bookingId } = req.body;
    
    // Find the booking and the associated room
    const booking = await Booking.findById(bookingId).populate('roomId');
    const room = await Room.findById(booking.roomId);

    if (!booking || !room) {
      return res.status(404).json({ message: 'Booking or Room not found' });
    }

    // Create the secure checkout session (Prices must be in cents)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr', // Sri Lankan Rupee
            product_data: {
              name: `Key Money (Deposit) for Room ${room.roomNumber}`,
              description: 'Refundable deposit as per hostel agreement.',
            },
            unit_amount: room.keyMoney * 100, // Convert to cents
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
      // Send them to a success page, passing the booking ID in the URL
      success_url: `http://localhost:5173/payment-success/${booking._id}`,
      cancel_url: `http://localhost:5173/profile`,
    });

    // Save the Stripe session ID to the database
    booking.stripeSessionId = session.id;
    await booking.save();

    // Send the Stripe URL to the frontend
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

    // Mark as Paid
    booking.paymentStatus = 'Paid';
    booking.status = 'Confirmed';
    await booking.save();

    // Mark the Room as Full so no one else books it
    await Room.findByIdAndUpdate(booking.roomId, { status: 'Full' });

    res.json({ success: true, message: 'Payment verified and room secured!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCheckoutSession, verifyPayment };