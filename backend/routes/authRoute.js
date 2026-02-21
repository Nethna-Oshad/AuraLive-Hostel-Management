const express = require('express');
const router = express.Router();
const { loginUser, registerStudent, registerAdmin, registerLaundry, registerMaintainer, registerMealSupplier } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/register', registerStudent); 
router.post('/register-admin', registerAdmin); 
router.post('/register-laundry', registerLaundry);
router.post('/register-maintainer', registerMaintainer);
router.post('/register-meal-supplier', registerMealSupplier);

module.exports = router;