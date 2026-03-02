const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
  // 1. Basic Identification
  roomNumber: { type: String, required: true, unique: true },
  floorLevel: { type: String, required: true },
  roomType: { type: String, required: true },
  designatedGender: { type: String, required: true },

  // 2. Features & Amenities
  airConditioning: { type: String, required: true },
  bathroomType: { type: String, required: true },
  furnishing: [{ type: String }], // Array of strings (e.g., ["Bed", "Desk"])
  hasBalcony: { type: Boolean, default: false },

  // 3. Pricing & Booking Rules
  monthlyRent: { type: Number, required: true },
  keyMoney: { type: Number, required: true },
  maxCapacity: { type: Number, required: true },

  // 4. Visuals & Extras
  description: { type: String },
  image: { type: String }, // Will store the file path like '/roomImage/photo.jpg'
  status: { type: String, default: 'Available' },
  display: { type: Boolean, default: true }, // Show or hide from students
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);