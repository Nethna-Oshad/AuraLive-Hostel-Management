const mongoose = require('mongoose');

const mealMenuItemSchema = mongoose.Schema(
  {
    supplierName: { type: String, required: true, index: true },
    supplierEmail: { type: String, required: true, index: true },
    itemName: { type: String, required: true },
    category: { type: String, default: 'Main' },
    price: { type: Number, required: true, min: 0 },
    prepTimeMinutes: { type: Number, default: 30, min: 1 },
    description: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MealMenuItem', mealMenuItemSchema);
