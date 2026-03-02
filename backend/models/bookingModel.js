const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  // Auto-fetched data (Not editable by student)
  studentEmail: { type: String, required: true },
  studentName: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  roomNumber: { type: String, required: true },
  
  // Agreement State
  agreedToTerms: { type: Boolean, required: true },

  // Student More Information
  nicNumber: { type: String, required: true },
  emergencyContactName: { type: String, required: true },
  emergencyContactPhone: { type: String, required: true },
  expectedMoveInDate: { type: Date, required: true },
  specialRequests: { type: String, default: '' },

  // Admin Control Status
  status: { type: String, default: 'Pending Approval' } 
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);