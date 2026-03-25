const mongoose = require('mongoose');

const maintenanceSchema = mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Student' },
  roomNumber: { type: String, required: true },
  issueType: { type: String, required: true, enum: ['Plumbing', 'Electrical', 'Furniture', 'Cleaning', 'Other'] },
  description: { type: String, required: true },
  photo: { type: String, default: null },
  priority: { type: String, required: true, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, required: true, enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'], default: 'Pending' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Maintainer', default: null },
  costEstimate: { type: Number, default: 0 },
  isCostApproved: { type: Boolean, default: false },
  studentRating: { type: Number, min: 1, max: 5, default: null }
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceTicket', maintenanceSchema);