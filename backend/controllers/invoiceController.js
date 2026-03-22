const Invoice = require('../models/invoiceModel');

// @desc    Get all invoices for a specific student
// @route   GET /api/invoices/student/:email
const getStudentInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ studentEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get all invoices for a specific room (Admin)
// @route   GET /api/invoices/room/:roomNumber
const getRoomInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ roomNumber: req.params.roomNumber }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get ALL invoices (Admin general view)
// @route   GET /api/invoices
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({}).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get Financial Stats for Admin Dashboard
// @route   GET /api/invoices/stats
const getFinancialStats = async (req, res) => {
  try {
    const paidInvoices = await Invoice.find({ status: 'Paid' });
    const unpaidInvoices = await Invoice.find({ status: 'Unpaid' });

    const totalRevenue = paidInvoices.reduce((acc, curr) => acc + curr.amount, 0);
    const pendingDues = unpaidInvoices.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      totalRevenue,
      pendingDues,
      paidCount: paidInvoices.length,
      unpaidCount: unpaidInvoices.length
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getStudentInvoices, getRoomInvoices, getAllInvoices, getFinancialStats };