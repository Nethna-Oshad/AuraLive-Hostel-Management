const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // NEW: File System module

const { createBooking, getStudentBooking, updateBookingInfo } = require('../controllers/bookingController');

// 1. SAFELY RESOLVE THE FOLDER PATH (No more guessing with ../)
const uploadDir = path.join(__dirname, '../../frontend/public/Studentprofile');

// 2. AUTO-CREATE THE FOLDER IF IT DOESN'T EXIST (Prevents silent failures!)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ==========================================
// MULTER CONFIGURATION FOR PROFILE PICS
// ==========================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ROUTES
router.post('/', createBooking); 
router.get('/:email', getStudentBooking); 
router.put('/:id', upload.single('profileImage'), updateBookingInfo); 

module.exports = router;