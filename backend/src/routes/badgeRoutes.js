const express = require('express');
const router = express.Router();
const {
  createBadge,
  getAllBadges,
  getUserBadges,
  awardBadge,
  initializeBadges
} = require('../controllers/badgeController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getAllBadges)
  .post(protect, createBadge);

router.post('/init', protect, initializeBadges);
router.get('/user/:userId', getUserBadges);
router.post('/:badgeId/award/:userId', protect, awardBadge);

module.exports = router;
