const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const laundrySchema = mongoose.Schema({
  // --- Basic Auth Details ---
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Laundry' },
  status: { type: String, default: 'Active' }, 

  // --- Dynamic Pricing & Partner Features ---
  
  // Base Price (Per Kg)
  pricePerKg: { type: Number, default: 200 },
  
  // Service Extra Costs (Additional prices)
  washFoldPrice: { type: Number, default: 0 }, 
  washIronPrice: { type: Number, default: 50 },
  dryCleanPrice: { type: Number, default: 150 },

  // Urgency Fee
  oneDayDeliveryFee: { type: Number, default: 100 },

  // Partner Features
  isPremium: { type: Boolean, default: false },
  rating: { type: Number, default: 0.0 },
  completedOrders: { type: Number, default: 0 }

}, { timestamps: true });

// --- Password Hashing ---
laundrySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

laundrySchema.methods.matchPassword = async function (enteredPassword) { 
  return await bcrypt.compare(enteredPassword, this.password); 
};

module.exports = mongoose.model('Laundry', laundrySchema);