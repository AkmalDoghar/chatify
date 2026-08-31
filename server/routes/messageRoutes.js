const express = require('express');
const {
  allMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  toggleReaction,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, allMessages);
router.route('/read/:chatId').put(protect, markMessagesAsRead);
router.route('/delete/:messageId').put(protect, deleteMessage);
router.route('/reaction/:messageId').put(protect, toggleReaction);

module.exports = router;
