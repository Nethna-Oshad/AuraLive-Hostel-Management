const mongoose = require('mongoose');

const mealSlotSchema = mongoose.Schema(
  {
    label: { type: String, required: true },
    timeRange: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MealSlot', mealSlotSchema);
