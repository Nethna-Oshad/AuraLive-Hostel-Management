const express = require('express');
const router = express.Router();
const { getReviews, addReview } = require('../controllers/reviewController');

router.get('/', getReviews);
router.post('/', addReview); // You can use this later to let students add reviews from their profile!

module.exports = router;