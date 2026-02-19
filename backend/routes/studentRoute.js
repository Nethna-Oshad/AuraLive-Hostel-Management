const express = require('express');
// Notice the capital 'R' here
const router = express.Router(); 
const { registerStudent, loginStudent } = require('../controllers/studentController');

router.post('/register', registerStudent);
router.post('/login', loginStudent);

module.exports = router;