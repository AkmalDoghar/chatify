const express = require('express');
const {
  searchUsers,
  getAllUsers,
  updateProfile,
  addContact,
  getContacts,
  deleteContact,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, searchUsers);
router.get('/all', protect, getAllUsers);
router.put('/profile', protect, updateProfile);

// Permanent Contacts CRUD
router.post('/contacts', protect, addContact);
router.get('/contacts', protect, getContacts);
router.delete('/contacts/:contactId', protect, deleteContact);

module.exports = router;
