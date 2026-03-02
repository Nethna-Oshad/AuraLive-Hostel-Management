const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getRooms, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');

// Multer Configuration: Save directly to Frontend's public/roomImage folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Navigates up from backend/routes to the root, then into frontend
    cb(null, path.join(__dirname, '../../frontend/public/roomImage'));
  },
  filename: function (req, file, cb) {
    // Creates a unique filename so photos don't overwrite each other
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const upload = multer({ storage: storage });

// Routes
router.get('/', getRooms);
// 'image' is the name of the file field in our frontend form
router.post('/', upload.single('image'), createRoom);
router.put('/:id', upload.single('image'), updateRoom);
router.delete('/:id', deleteRoom);

module.exports = router;