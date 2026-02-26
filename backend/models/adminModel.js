const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Admin' },
  status: { type: String, default: 'Active' }, // Admins are active by default
}, { timestamps: true });

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
adminSchema.methods.matchPassword = async function (enteredPassword) { return await bcrypt.compare(enteredPassword, this.password); };
module.exports = mongoose.model('Admin', adminSchema);