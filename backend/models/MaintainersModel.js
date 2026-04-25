const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const maintainerSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Maintainer' },
  status: { type: String, default: 'Inactive' }, 
  specialization: { type: String, enum: ['Plumbing', 'Electrical', 'Furniture', 'Cleaning', 'General', 'Other'], default: 'General' },
  availability: { type: String, enum: ['Available', 'On Job', 'Off Duty'], default: 'Available' },
  experience: { type: String, default: '1 Year' },
  bio: { type: String, default: 'Maintenance Professional at AuraFix' },
  profileImage: { type: String, default: '' },
  jobsCompleted: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0.0 }
}, { timestamps: true });

maintainerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

maintainerSchema.methods.matchPassword = async function (enteredPassword) { 
  return await bcrypt.compare(enteredPassword, this.password); 
};

module.exports = mongoose.model('Maintainer', maintainerSchema);