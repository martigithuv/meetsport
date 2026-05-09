const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getConversations, getMessagesWithUser, sendMessage, markAsRead } = require('../controllers/messageController');

router.get('/conversations', protect, getConversations);
router.get('/:otherUserId', protect, getMessagesWithUser);
router.post('/send/:recipientId', protect, sendMessage);
router.put('/read/:otherUserId', protect, markAsRead);

module.exports = router;
