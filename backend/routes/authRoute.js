const express = require('express');
const router = express.Router();
const { 
  loginUser, registerStudent, registerAdmin, registerLaundry, registerMaintainer, registerMealSupplier,
  getAllStudents, getAllLaundry, getAllMaintainers, getAllMeals, updateUserStatus 
} = require('../controllers/authController');

// Auth Routes
router.post('/login', loginUser);
router.post('/register', registerStudent); 
router.post('/register-admin', registerAdmin); 
router.post('/register-laundry', registerLaundry);
router.post('/register-maintainer', registerMaintainer);
router.post('/register-meal-supplier', registerMealSupplier);

// Admin Data Routes
router.get('/students', getAllStudents);
router.get('/laundry', getAllLaundry);
router.get('/maintainers', getAllMaintainers);
router.get('/meals', getAllMeals);
router.put('/update-status', updateUserStatus);

module.exports = router;