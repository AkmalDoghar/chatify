const express = require('express');
const { allMessages, sendMessage, markMessagesAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, allMessages);
router.route('/read/:chatId').put(protect, markMessagesAsRead);

module.exports = router;
