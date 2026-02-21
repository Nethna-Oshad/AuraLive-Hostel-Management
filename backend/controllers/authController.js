const Admin = require('../models/adminModel');
const Student = require('../models/studentModel');
const Laundry = require('../models/laundryModel');
const Maintainer = require('../models/MaintainersModel');
const MealSupplier = require('../models/mealSupplierModel');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '1d' });
};

// @desc    Auth ALL users & get token
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check all collections sequentially to find the user
    let user = await Admin.findOne({ email });
    if (!user) user = await Student.findOne({ email });
    if (!user) user = await Laundry.findOne({ email });
    if (!user) user = await Maintainer.findOne({ email });
    if (!user) user = await MealSupplier.findOne({ email });

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    if (await user.matchPassword(password)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Register a new student
// @route   POST /api/auth/register
const registerStudent = async (req, res) => {
  try {
    const { name, email, phone, gender, password } = req.body;

    const studentExists = await Student.findOne({ email });
    if (studentExists) return res.status(400).json({ message: 'Student already exists' });

    const student = await Student.create({ name, email, phone, gender, password });

    if (student) {
      res.status(201).json({
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role, // Will return 'Student'
        token: generateToken(student._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid student data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new admin (Hidden route for Postman)
// @route   POST /api/auth/register-admin
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) return res.status(400).json({ message: 'Admin already exists' });

    const admin = await Admin.create({ name, email, password, role: 'Admin' });

    if (admin) {
      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid admin data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW: Partner Registration Functions
const registerLaundry = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (await Laundry.findOne({ email })) return res.status(400).json({ message: 'User already exists' });
    const user = await Laundry.create({ name, email, phone, password });
    if (user) res.status(201).json({ _id: user._id, name: user.name, role: user.role, token: generateToken(user._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const registerMaintainer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (await Maintainer.findOne({ email })) return res.status(400).json({ message: 'User already exists' });
    const user = await Maintainer.create({ name, email, phone, password });
    if (user) res.status(201).json({ _id: user._id, name: user.name, role: user.role, token: generateToken(user._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const registerMealSupplier = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (await MealSupplier.findOne({ email })) return res.status(400).json({ message: 'User already exists' });
    const user = await MealSupplier.create({ name, email, phone, password });
    if (user) res.status(201).json({ _id: user._id, name: user.name, role: user.role, token: generateToken(user._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { loginUser, registerStudent, registerAdmin, registerLaundry, registerMaintainer, registerMealSupplier };