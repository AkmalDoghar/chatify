const express = require('express');
const {
  sendSignupOTP,
  verifySignupOTP,
  sendResetOTP,
  verifyResetOTP,
  loginUser,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', loginUser);

// Signup: 2-step OTP flow
router.post('/signup/send-otp', sendSignupOTP);
router.post('/signup/verify-otp', verifySignupOTP);

// Reset Password: 2-step OTP flow
router.post('/reset/send-otp', sendResetOTP);
router.post('/reset/verify-otp', verifyResetOTP);

router.get('/me', protect, getMe);

module.exports = router;
