const express = require('express');
const router = express.Router();
const { createCheckoutSession, verifyPayment } = require('../controllers/paymentController');

router.post('/create-checkout-session', createCheckoutSession);
router.post('/verify', verifyPayment);

module.exports = router;