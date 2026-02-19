const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '30d' });
};

// @desc    Register new admin (Usually hidden/restricted in production)
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const adminExists = await Admin.findOne({ email });

    if (adminExists) return res.status(400).json({ message: 'Admin already exists' });

    const admin = await Admin.create({ name, email, password });

    if (admin) {
      res.status(201).json({ _id: admin._id, name: admin.name, email: admin.email, token: generateToken(admin._id) });
    } else {
      res.status(400).json({ message: 'Invalid admin data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth admin & get token
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({ _id: admin._id, name: admin.name, email: admin.email, role: admin.role, token: generateToken(admin._id) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerAdmin, loginAdmin };