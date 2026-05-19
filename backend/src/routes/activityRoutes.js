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
  joinActivity,
  finalizeActivity,
  getActivityParticipants
} = require('../controllers/activityController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getActivities)
  .post(protect, createActivity);

router.get('/my', protect, getMyActivities);
router.get('/favorites', protect, getFavorites);
router.post('/favorite/:id', protect, toggleFavorite);
router.get('/:id', getActivityById);
router.get('/:id/participants', getActivityParticipants);
router.put('/:id/finalize', protect, finalizeActivity);
// DEPRECADO: Usar POST /api/enrollments/:id en su lugar
// Mantenido por compatibilidad, pero nuevas implementaciones deben usar enrollments
router.post('/join/:id', protect, joinActivity);
router.delete('/:id', protect, deleteActivity);

module.exports = router;
