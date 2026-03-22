const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  verifyPayment,
  createMealCheckoutSession,
  verifyMealPayment,
} = require('../controllers/paymentController');

router.post('/create-checkout-session', createCheckoutSession);
router.post('/verify', verifyPayment);
router.post('/create-meal-checkout-session', createMealCheckoutSession);
router.post('/verify-meal', verifyMealPayment);

module.exports = router;