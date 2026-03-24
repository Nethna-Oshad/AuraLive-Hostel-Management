const express = require('express');
const router = express.Router();
const { 
  createCheckoutSession, 
  verifyPayment, 
  createMonthlyCheckout, 
  verifyMonthlyPayment 
} = require('../controllers/paymentController');

// Initial Deposit Routes
router.post('/create-checkout-session', createCheckoutSession);
router.post('/verify', verifyPayment);

// ==========================================
// NEW: MONTHLY RENT ROUTES
// ==========================================
router.post('/monthly/create', createMonthlyCheckout);
router.post('/monthly/verify', verifyMonthlyPayment);

module.exports = router;