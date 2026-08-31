const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

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
    reactions: [],
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

// ── Delete a message ──────────────────────────────────────────
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    // Soft delete — replace content with deleted marker
    message.content = '';
    message.messageType = 'deleted';
    await message.save();

    res.json({ success: true, messageId, chatId: message.chatId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ── Toggle a reaction on a message ───────────────────────────
const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const existingIdx = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingIdx >= 0) {
      // Remove reaction (toggle off)
      message.reactions.splice(existingIdx, 1);
    } else {
      // Remove any previous reaction by this user, then add new
      message.reactions = message.reactions.filter(
        (r) => r.userId.toString() !== userId.toString()
      );
      message.reactions.push({ emoji, userId, userName });
    }

    await message.save();

    res.json({ success: true, messageId, reactions: message.reactions });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  allMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  toggleReaction,
};
