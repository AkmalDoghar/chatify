const User = require('../models/User');

const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
            { phone: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user._id } })
      .select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      if (req.body.phone) user.phone = req.body.phone;
      if (req.body.profilePic) {
        user.profilePic = req.body.profilePic;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        profilePic: updatedUser.profilePic,
        bio: updatedUser.bio,
        status: updatedUser.status,
        lastSeen: updatedUser.lastSeen,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new Contact permanently to User DB
const addContact = async (req, res) => {
  try {
    const { name, phone, note } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if contact with same phone already exists
    const existingIndex = user.contacts.findIndex((c) => c.phone === phone);
    if (existingIndex > -1) {
      user.contacts[existingIndex].name = name;
      user.contacts[existingIndex].note = note || '';
    } else {
      user.contacts.push({ name, phone, note: note || '' });
    }

    await user.save();
    res.status(201).json({ message: 'Contact saved successfully', contacts: user.contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all saved contacts for logged in user
const getContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.contacts || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a contact
const deleteContact = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.contacts = user.contacts.filter((c) => c._id.toString() !== req.params.contactId);
    await user.save();
    res.json({ message: 'Contact removed', contacts: user.contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchUsers,
  getAllUsers,
  updateProfile,
  addContact,
  getContacts,
  deleteContact,
};
