const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'chatify_secret_key_12345', {
    expiresIn: '30d',
  });
};

const getDefaultAvatar = (name) => {
  const initials = encodeURIComponent(name || 'U');
  return `https://ui-avatars.com/api/?name=${initials}&background=E2725B&color=fff&bold=true&size=128`;
};

// ─── STEP 1 of signup: Send OTP ───────────────────────────────────────────────
const sendSignupOTP = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Delete any previous OTPs for this email
    await OTP.deleteMany({ email, purpose: 'signup' });

    const otp = generateOTP();

    await OTP.create({
      email,
      otp,
      purpose: 'signup',
      pendingData: { name, email, password },
    });

    await sendOTPEmail({ to: email, otp, purpose: 'signup' });

    res.json({ success: true, message: 'OTP sent to your email. Please verify to complete signup.' });
  } catch (error) {
    console.error('Send Signup OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please check your email address.' });
  }
};

// ─── STEP 2 of signup: Verify OTP and create account ─────────────────────────
const verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const otpRecord = await OTP.findOne({ email, purpose: 'signup' });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    if (otpRecord.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });
    }

    const { name, password } = otpRecord.pendingData;
    const profilePic = getDefaultAvatar(name);

    const user = await User.create({ name, email, password, profilePic, status: 'offline' });

    await OTP.deleteMany({ email, purpose: 'signup' });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      status: user.status,
      lastSeen: user.lastSeen,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Verify Signup OTP error:', error);
    res.status(500).json({ message: error.message || 'Server error during verification' });
  }
};

// ─── STEP 1 of reset: Send OTP ────────────────────────────────────────────────
const sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email address' });
    }

    await OTP.deleteMany({ email, purpose: 'reset' });

    const otp = generateOTP();
    await OTP.create({ email, otp, purpose: 'reset' });

    await sendOTPEmail({ to: email, otp, purpose: 'reset' });

    res.json({ success: true, message: 'OTP sent to your email. Enter it to reset your password.' });
  } catch (error) {
    console.error('Send Reset OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// ─── STEP 2 of reset: Verify OTP and update password ────────────────────────
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const otpRecord = await OTP.findOne({ email, purpose: 'reset' });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    if (otpRecord.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    await OTP.deleteMany({ email, purpose: 'reset' });

    res.json({ success: true, message: 'Password reset successfully! You can now log in.' });
  } catch (error) {
    console.error('Verify Reset OTP error:', error);
    res.status(500).json({ message: error.message || 'Server error during password reset' });
  }
};

// ─── Direct login (unchanged) ────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    user.status = 'online';
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      status: user.status,
      lastSeen: user.lastSeen,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// ─── Get current user ────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
        status: user.status,
        lastSeen: user.lastSeen,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendSignupOTP,
  verifySignupOTP,
  sendResetOTP,
  verifyResetOTP,
  loginUser,
  getMe,
};
