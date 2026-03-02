const express = require('express');
const router = express.Router();
const { createBooking, getStudentBooking, updateBookingInfo } = require('../controllers/bookingController');

router.post('/', createBooking); // Create booking
router.get('/:email', getStudentBooking); // Fetch profile by email
router.put('/:id', updateBookingInfo); // Update profile

module.exports = router;