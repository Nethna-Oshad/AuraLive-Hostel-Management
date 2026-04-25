const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getMaintainerById,
  updateMaintainerProfile,
  deleteMaintainerAccount,
} = require('../controllers/maintainerController');

const uploadDir = path.join(__dirname, '../../frontend/public/profileImages');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'maintainer-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/:id', getMaintainerById);
router.put('/update/:id', upload.single('profileImage'), updateMaintainerProfile);
router.delete('/:id', deleteMaintainerAccount);

module.exports = router;