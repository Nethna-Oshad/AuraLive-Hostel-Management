const express = require('express');
const router = express.Router();

// Combine ALL imports from paymentController into one single list
const {
  createCheckoutSession,
  verifyPayment,
  createMealCheckoutSession,
  verifyMealPayment,
  createMonthlyCheckout, 
  verifyMonthlyPayment 
} = require('../controllers/paymentController');

// Initial Deposit Routes
router.post('/create-checkout-session', createCheckoutSession);
router.post('/verify', verifyPayment);

// Meal Payment Routes
router.post('/create-meal-checkout-session', createMealCheckoutSession);
router.post('/verify-meal', verifyMealPayment);

// ==========================================
// NEW: MONTHLY RENT ROUTES
// ==========================================
router.post('/monthly/create', createMonthlyCheckout);
router.post('/monthly/verify', verifyMonthlyPayment);

module.exports = router;