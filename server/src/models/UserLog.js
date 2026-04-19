const mongoose = require('mongoose');

const userLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    loginTime: {
      type: Date,
      default: Date.now
    },
    logoutTime: {
      type: Date
    },
    sessionDuration: {
      type: Number // In seconds
    },
    ipAddress: {
      type: String
    },
    deviceInfo: {
      userAgent: String,
      os: String,
      browser: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('UserLog', userLogSchema);
