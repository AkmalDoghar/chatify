const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');

// @desc Access or create 1-to-1 chat with a target user
// @route POST /api/chats
const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'UserId param not sent with request' });
  }

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { participants: { $elemMatch: { $eq: req.user._id } } },
        { participants: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name profilePic email',
        },
      });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      const chatData = {
        chatName: 'sender',
        isGroupChat: false,
        participants: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'participants',
        '-password'
      );
      res.status(200).send(FullChat);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Fetch all chats for logged in user
// @route GET /api/chats
const fetchChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      participants: { $elemMatch: { $eq: req.user._id } },
    })
      .populate('participants', '-password')
      .populate('groupAdmin', '-password')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name profilePic email',
        },
      })
      .sort({ updatedAt: -1 });

    // Calculate unread counts for each chat
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          sender: { $ne: req.user._id },
          readBy: { $ne: req.user._id },
        });

        const chatObj = chat.toObject();
        chatObj.unreadCount = unreadCount;
        return chatObj;
      })
    );

    res.status(200).send(chatsWithUnread);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Create group chat
// @route POST /api/chats/group
const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: 'Please fill all the fields' });
  }

  let users = typeof req.body.users === 'string' ? JSON.parse(req.body.users) : req.body.users;

  if (users.length < 2) {
    return res
      .status(400)
      .send({ message: 'More than 2 users are required to form a group chat' });
  }

  users.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      participants: users,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
};
