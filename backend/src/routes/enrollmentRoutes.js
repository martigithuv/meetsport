const express = require('express');
const router = express.Router();
const {
  getMyEnrollments,
  enrollInActivity,
  cancelEnrollment,
  checkEnrollment
} = require('../controllers/enrollmentController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/my', protect, getMyEnrollments);
router.get('/check/:activityId', protect, checkEnrollment);
router.post('/:activityId', protect, enrollInActivity);
router.delete('/:activityId', protect, cancelEnrollment);

module.exports = router;
