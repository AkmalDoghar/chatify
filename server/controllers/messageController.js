const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

// @desc Get all messages for a chat
// @route GET /api/messages/:chatId
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('sender', 'name profilePic email status')
      .populate('readBy', 'name profilePic')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Send a message
// @route POST /api/messages
const sendMessage = async (req, res) => {
  const { content, chatId, messageType } = req.body;

  if (!chatId || (!content && messageType === 'text')) {
    return res.status(400).json({ message: 'Invalid data passed into request' });
  }

  const newMessage = {
    sender: req.user._id,
    content: content || '',
    chatId: chatId,
    messageType: messageType || 'text',
    readBy: [req.user._id],
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate('sender', 'name profilePic email status');
    message = await message.populate('chatId');
    message = await User.populate(message, {
      path: 'chatId.participants',
      select: 'name profilePic email status',
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { lastMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Mark messages in a chat as read
// @route PUT /api/messages/read/:chatId
const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    await Message.updateMany(
      { chatId, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({ success: true, chatId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  allMessages,
  sendMessage,
  markMessagesAsRead,
};
