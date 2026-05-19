const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
  searchUsers, 
  followUser, 
  unfollowUser, 
  updateProfile, 
  changePassword,
  getUserStats,
  registerProfileView,
  toggleFavorite,
  getFavorites,
  getMe,
  getUserProfile,
  upgradeToPremium,
  cancelPremium,
  triggerBadgeNotification
} = require('../controllers/userController');

router.get('/me', protect, getMe);
router.get('/:id/profile', protect, getUserProfile);
router.post('/upgrade', protect, upgradeToPremium);
router.post('/cancel-premium', protect, cancelPremium);
router.get('/search', protect, searchUsers);
router.get('/stats', protect, getUserStats);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/follow/:id', protect, followUser);
router.post('/unfollow/:id', protect, unfollowUser);
router.post('/view/:id', protect, registerProfileView);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:activityId', protect, toggleFavorite);
router.post('/badge-notification', protect, triggerBadgeNotification);


module.exports = router;
