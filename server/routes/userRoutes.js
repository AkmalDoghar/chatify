const express = require('express');
const { searchUsers, getAllUsers, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, searchUsers);
router.get('/all', protect, getAllUsers);
router.put('/profile', protect, updateProfile);

module.exports = router;
