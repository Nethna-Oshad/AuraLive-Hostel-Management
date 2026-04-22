const mongoose = require('mongoose');

const mealBookingSchema = mongoose.Schema(
  {
    studentEmail: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    bookingDate: { type: String, required: true }, // YYYY-MM-DD
    type: { type: String, enum: ['Kitchen', 'External'], required: true },
    slotId: { type: String, required: true },
    slotLabel: { type: String, required: true },
    notes: { type: String, default: '' },
    status: { type: String, default: 'Confirmed' },
    externalShopName: { type: String, default: '' },
    externalMenuItem: { type: String, default: '' },
    externalAmount: { type: Number, default: 0 },
    externalItems: [
      {
        supplierName: { type: String, required: true },
        menuItemId: { type: String, default: '' },
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        lineTotal: { type: Number, required: true, min: 0 },
      },
    ],
    paymentStatus: {
      type: String,
      enum: ['NotRequired', 'Unpaid', 'Paid', 'Refunded'],
      default: 'NotRequired',
    },
    deliveryStatus: {
      type: String,
      enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    stripeSessionId: { type: String, default: '' },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

mealBookingSchema.index({ bookingDate: 1, slotId: 1 });

module.exports = mongoose.model('MealBooking', mealBookingSchema);
