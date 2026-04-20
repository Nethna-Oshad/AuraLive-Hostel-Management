const Booking = require('../models/bookingModel');

const createBooking = async (req, res) => {
  try {
    const { 
      studentEmail, studentName, roomId, roomNumber, agreedToTerms, 
      nicNumber, emergencyContactName, emergencyContactPhone, expectedMoveInDate, specialRequests 
    } = req.body;

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

const getStudentBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ studentEmail: req.params.email }).sort({ createdAt: -1 });
    if (!booking) return res.status(404).json({ message: 'No booking found for this student.' });
    
    // NEW: FIND ROOMMATES! 
    // Find all confirmed bookings in the same room, EXCLUDING the current student
    const roommates = await Booking.find({
      roomNumber: booking.roomNumber,
      status: 'Confirmed',
      studentEmail: { $ne: booking.studentEmail } // $ne means "Not Equal"
    }).select('studentName emergencyContactPhone profileImage studentEmail');

    // Return BOTH the booking and the roommates array
    res.json({ booking, roommates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBookingInfo = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.profileImage = `/Studentprofile/${req.file.filename}`;
    }
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { returnDocument: 'after' } 
    );
    
    if (!updatedBooking) return res.status(404).json({ message: 'Booking not found' });
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getStudentBooking, updateBookingInfo };