const mongoose = require('mongoose');

const laundryOrderSchema = mongoose.Schema({
  // 1. Reference to the Student
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'Student' 
  },

  
  weightInKg: { 
    type: Number, 
    required: true 
  },
  expectedDate: { 
    type: Date, 
    required: true 
  },
  serviceType: {
    type: String,
    enum: ['Wash & Fold', 'Wash & Iron', 'Dry Clean Only'],
    default: 'Wash & Fold'
  },
  photo: { 
    type: String, 
    default: null 
  },

  // --- Assignment Data ---
  assignedPartner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Laundry', 
    default: null 
  },
  finalPrice: { 
    type: Number, 
    default: 0 
  },

  // --- Tracking ---
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Washing', 'Ready for Pickup', 'Completed', 'Cancelled'],
    default: 'Pending'
  },

  // ✅ CRITICAL FOR DASHBOARD ALERT: 
  // Student select kale Premium partner kenek nam, meka 'true' widiyata save wenna oni.
  isPremiumOrder: { 
    type: Boolean, 
    default: false 
  },

  // --- Rating & Review Fields ---
  rating: { 
    type: Number, 
    default: 0 
  },
  reviewComment: { 
    type: String, 
    default: "" 
  },
  isRated: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('LaundryOrder', laundryOrderSchema);