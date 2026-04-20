const express = require('express');
const router = express.Router();
const { getStudentInvoices, getRoomInvoices, getAllInvoices, getFinancialStats } = require('../controllers/invoiceController');

// Define the routes (Stats must go above /:email so it doesn't confuse the URL)
router.get('/stats', getFinancialStats);
router.get('/', getAllInvoices);
router.get('/student/:email', getStudentInvoices);
router.get('/room/:roomNumber', getRoomInvoices);

module.exports = router;