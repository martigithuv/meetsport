const express = require('express');
const router = express.Router();
const {
  createRating,
  getUserRatings,
  getActivityRatings
} = require('../controllers/ratingController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createRating);

router.get('/user/:userId', getUserRatings);
router.get('/activity/:activityId', getActivityRatings);

module.exports = router;
