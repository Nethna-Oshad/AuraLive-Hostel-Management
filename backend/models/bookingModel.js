const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  studentEmail: { type: String, required: true },
  studentName: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  roomNumber: { type: String, required: true },
  
  agreedToTerms: { type: Boolean, required: true },

  nicNumber: { type: String, required: true },
  emergencyContactName: { type: String, required: true },
  emergencyContactPhone: { type: String, required: true },
  expectedMoveInDate: { type: Date, required: true },
  specialRequests: { type: String, default: '' },
  profileImage: { type: String },
  status: { type: String, default: 'Pending Approval' },

  // INITIAL DEPOSIT TRACKING
  paymentStatus: { type: String, default: 'Unpaid' },
  stripeSessionId: { type: String },

  // NEW: MONTHLY RENT TRACKING
  monthlyRentStatus: { type: String, default: 'Paid' }, // Defaults to Paid because the first month is covered by the deposit!
  monthlyStripeSessionId: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);