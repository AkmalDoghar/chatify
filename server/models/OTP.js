const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['signup', 'reset'],
    required: true,
  },
  // Store pending signup data temporarily
  pendingData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // Auto-delete after 10 minutes
    expires: 600,
  },
});

module.exports = mongoose.model('OTP', otpSchema);
