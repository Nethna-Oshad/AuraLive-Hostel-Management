const Review = require('../models/reviewModel');

// Get all reviews, sorted by newest first
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

// Add a new review
const addReview = async (req, res) => {
  try {
    const { studentId, studentName, profileImage, rating, comment } = req.body;
    const newReview = new Review({ studentId, studentName, profileImage, rating, comment });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add review', error: error.message });
  }
};

module.exports = { getReviews, addReview };