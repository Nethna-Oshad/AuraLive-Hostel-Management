const Booking = require('../models/bookingModel');

// @desc    Create new booking & save student info
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { 
      studentEmail, studentName, roomId, roomNumber, agreedToTerms, 
      nicNumber, emergencyContactName, emergencyContactPhone, expectedMoveInDate, specialRequests 
    } = req.body;

    // Optional: Prevent a student from double-booking if they already have a pending/active room
    const existingBooking = await Booking.findOne({ studentEmail, status: { $ne: 'Cancelled' } });
    if (existingBooking) {
      return res.status(400).json({ message: 'You already have an active or pending room booking.' });
    }

    const booking = await Booking.create({
      studentEmail, studentName, roomId, roomNumber, agreedToTerms,
      nicNumber, emergencyContactName, emergencyContactPhone, expectedMoveInDate, specialRequests
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking/profile info by Student Email (READ)
// @route   GET /api/bookings/:email
const getStudentBooking = async (req, res) => {
  try {
    // Finds the booking associated with the logged-in student's email
    const booking = await Booking.findOne({ studentEmail: req.params.email }).sort({ createdAt: -1 });
    if (!booking) return res.status(404).json({ message: 'No booking found for this student.' });
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student extra information (UPDATE)
// @route   PUT /api/bookings/:id
const updateBookingInfo = async (req, res) => {
  try {
    // Allows student to update their emergency contact, NIC, etc.
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );
    
    if (!updatedBooking) return res.status(404).json({ message: 'Booking not found' });
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getStudentBooking, updateBookingInfo };