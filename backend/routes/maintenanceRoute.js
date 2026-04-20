const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  createTicket, 
  getStudentTickets, 
  getAllTickets, 
  getPartnerTickets, // ✅ ALUTH: Partner ge tickets ganna
  updateTicket, 
  rateTicket,
  deleteTicket 
} = require('../controllers/maintenanceController');

const uploadDir = path.join(__dirname, '../../frontend/public/maintenanceImages');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const upload = multer({ storage: storage });

// 🚀 API Routes

router.post('/create', upload.single('photo'), createTicket);
router.get('/student/:studentId', getStudentTickets);

// ✅ FIX: Maintainer ge ID eka anuwa tickets fetch karana route eka (404 fix)
router.get('/partner/:partnerId', getPartnerTickets); 

router.get('/all', getAllTickets);
router.put('/update/:id', updateTicket);
router.put('/rate/:id', rateTicket);
router.delete('/delete/:id', deleteTicket);

module.exports = router;