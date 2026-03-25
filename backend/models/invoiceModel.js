const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
  // Who is paying?
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentEmail: { type: String, required: true },
  studentName: { type: String, required: true },
  
  // What are they paying for?
  roomNumber: { type: String, required: true },
  description: { type: String, required: true },
  
  // NEW: Store the exact month this payment is for (e.g., "March 2026")
  monthName: { type: String }, 
  
  amount: { type: Number, required: true },
  
  // Payment Status
  status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
  stripeSessionId: { type: String }, 
  paidAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);