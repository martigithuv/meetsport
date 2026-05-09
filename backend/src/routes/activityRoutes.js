const express = require('express');
const router = express.Router();
const { 
  getActivities, 
  createActivity, 
  toggleFavorite, 
  getFavorites,
  getMyActivities,
  deleteActivity,
  getActivityById,
  joinActivity
} = require('../controllers/activityController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getActivities)
  .post(protect, createActivity);

router.get('/my', protect, getMyActivities);
router.get('/favorites', protect, getFavorites);
router.post('/favorite/:id', protect, toggleFavorite);
router.get('/:id', getActivityById);
router.post('/join/:id', protect, joinActivity);
router.delete('/:id', protect, deleteActivity);

module.exports = router;
