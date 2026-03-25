const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import all controller functions cleanly
const { 
  getEstimates, 
  createOrder, 
  getStudentOrders,
  updatePartnerByAdmin, // This will handle both Admin and Partner settings updates
  getPartnerOrders,
  updateOrderStatus,
  rateOrder
} = require('../controllers/laundryController');

// Ensure upload directory exists for laundry photos
const uploadDir = path.join(__dirname, '../../frontend/public/laundryImages');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'laundry-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- API ROUTES ---

// 1. Get estimates based on weight, date, and service type
router.post('/estimate', getEstimates);

// 2. Submit a new laundry order with photo upload
router.post('/create', upload.single('photo'), createOrder);

// 3. Get all orders placed by a specific student
router.get('/student/:studentId', getStudentOrders);

// 4. Update partner pricing settings (Used by both Admin and Partner Settings Page)
// This matches your frontend call: /api/laundry/update-prices/:id
router.put('/update-prices/:id', updatePartnerByAdmin);

// 5. Admin specific partner update (Optional, kept for backward compatibility)
router.put('/admin/partner/:id', updatePartnerByAdmin);

// 6. Get all orders assigned to a specific partner (Partner Dashboard Data)
router.get('/partner/:partnerId', getPartnerOrders);

// 7. Update order progress (Accepted, Washing, Completed, etc.)
router.put('/order-status/:orderId', updateOrderStatus);

// 8. Submit student rating and review for a completed order
router.post('/rate-order/:orderId', rateOrder);

module.exports = router;