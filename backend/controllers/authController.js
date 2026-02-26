const Admin = require('../models/adminModel');
const Student = require('../models/studentModel');
const Laundry = require('../models/laundryModel');
const Maintainer = require('../models/MaintainersModel');
const MealSupplier = require('../models/mealSupplierModel');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '1d' });

// ========================
// AUTHENTICATION LOGIC
// ========================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Admin.findOne({ email });
    if (!user) user = await Student.findOne({ email });
    if (!user) user = await Laundry.findOne({ email });
    if (!user) user = await Maintainer.findOne({ email });
    if (!user) user = await MealSupplier.findOne({ email });

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    // CHECK IF ACCOUNT IS APPROVED
    if (user.status === 'Inactive') {
      return res.status(403).json({ message: 'Account is pending Admin approval. Please wait.' });
    }

    if (await user.matchPassword(password)) {
      res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const registerStudent = async (req, res) => {
  try {
    const { name, email, phone, gender, password } = req.body;
    if (await Student.findOne({ email })) return res.status(400).json({ message: 'Student already exists' });
    const user = await Student.create({ name, email, phone, gender, password });
    if (user) res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, token: generateToken(user._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await Admin.findOne({ email })) return res.status(400).json({ message: 'Admin already exists' });
    const user = await Admin.create({ name, email, password });
    if (user) res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const registerLaundry = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (await Laundry.findOne({ email })) return res.status(400).json({ message: 'User exists' });
    const user = await Laundry.create({ name, email, phone, password });
    if (user) res.status(201).json({ _id: user._id, name: user.name, role: user.role, status: user.status, token: generateToken(user._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const registerMaintainer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (await Maintainer.findOne({ email })) return res.status(400).json({ message: 'User exists' });
    const user = await Maintainer.create({ name, email, phone, password });
    if (user) res.status(201).json({ _id: user._id, name: user.name, role: user.role, status: user.status, token: generateToken(user._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const registerMealSupplier = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (await MealSupplier.findOne({ email })) return res.status(400).json({ message: 'User exists' });
    const user = await MealSupplier.create({ name, email, phone, password });
    if (user) res.status(201).json({ _id: user._id, name: user.name, role: user.role, status: user.status, token: generateToken(user._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ========================
// ADMIN GET & UPDATE LOGIC
// ========================
const getAllStudents = async (req, res) => { res.json(await Student.find({}).select('-password')); };
const getAllLaundry = async (req, res) => { res.json(await Laundry.find({}).select('-password')); };
const getAllMaintainers = async (req, res) => { res.json(await Maintainer.find({}).select('-password')); };
const getAllMeals = async (req, res) => { res.json(await MealSupplier.find({}).select('-password')); };

const updateUserStatus = async (req, res) => {
  try {
    const { id, role, status } = req.body;
    let updatedUser;

    if (role === 'Student') updatedUser = await Student.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
    else if (role === 'Laundry') updatedUser = await Laundry.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
    else if (role === 'Maintainer') updatedUser = await Maintainer.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
    else if (role === 'MealSupplier') updatedUser = await MealSupplier.findByIdAndUpdate(id, { status }, { new: true }).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  loginUser, registerStudent, registerAdmin, registerLaundry, registerMaintainer, registerMealSupplier,
  getAllStudents, getAllLaundry, getAllMaintainers, getAllMeals, updateUserStatus
};