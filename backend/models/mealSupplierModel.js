const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mealSupplierSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'MealSupplier' },
  status: { type: String, default: 'Inactive' }, // Added Status
}, { timestamps: true });

mealSupplierSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
mealSupplierSchema.methods.matchPassword = async function (enteredPassword) { return await bcrypt.compare(enteredPassword, this.password); };
module.exports = mongoose.model('MealSupplier', mealSupplierSchema);