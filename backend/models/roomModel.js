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
  furnishing: [{ type: String }], 
  hasBalcony: { type: Boolean, default: false },

  // 3. Pricing & Booking Rules
  monthlyRent: { type: Number, required: true },
  keyMoney: { type: Number, required: true },
  maxCapacity: { type: Number, required: true },
  
  // NEW: Track how many students are actually in the room!
  currentOccupancy: { type: Number, default: 0 },

  // 4. Visuals & Extras
  description: { type: String },
  image: { type: String }, 
  status: { type: String, default: 'Available' },
  display: { type: Boolean, default: true }, 
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);