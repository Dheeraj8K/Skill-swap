const express = require('express');
const router = express.Router();
const store = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Get reviews for a user
router.get('/:userId', (req, res) => {
  try {
    const reviews = store.getReviews(req.params.userId);
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Post a review
router.post('/', authMiddleware, (req, res) => {
  try {
    const { recipientId, rating, skill, comment } = req.body;

    if (!recipientId || !rating || !comment) {
      return res.status(400).json({ error: 'Recipient, rating, and feedback are required' });
    }

    if (recipientId === req.user.id) {
      return res.status(400).json({ error: 'Cannot review yourself' });
    }

    const newReview = store.createReview({
      reviewerId: req.user.id,
      reviewerName: `${req.user.firstName} ${req.user.lastName}`,
      reviewerAvatar: req.user.avatar,
      recipientId,
      rating: Number(rating),
      skill: skill || 'General Exchange',
      comment
    });

    res.status(201).json({
      message: 'Review submitted successfully',
      review: newReview
    });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

module.exports = router;
