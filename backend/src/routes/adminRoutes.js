const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  deleteUser, 
  toggleBlockUser, 
  getAllActivities, 
  deleteActivity, 
  toggleHideActivity,
  getAdminStats
} = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Totes les rutes d'admin requereixen estar loguejat i ser ADMIN
router.use(protect);
router.use(admin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/block/:id', toggleBlockUser);

router.get('/activities', getAllActivities);
router.delete('/activities/:id', deleteActivity);
router.put('/activities/hide/:id', toggleHideActivity);

router.get('/stats', getAdminStats);

module.exports = router;
