const User = require('../models/User');
const UserLog = require('../models/UserLog');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');
const { ApiError, catchAsync } = require('../utils/helpers');

/**
 * POST /api/auth/signup
 */
const signup = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  // Check existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const user = await User.create({ name, email, password });

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);

  // Store refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      user: user.toJSON(),
      accessToken
    }
  });
});

/**
 * POST /api/auth/login
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.status === 'DISABLED') {
    throw new ApiError(403, 'Your account has been disabled. Please contact support.');
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Log activity
  await UserLog.create({
    userId: user._id,
    ipAddress: req.ip || req.headers['x-forwarded-for'],
    deviceInfo: {
      userAgent: req.headers['user-agent']
    }
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      accessToken
    }
  });
});

/**
 * POST /api/auth/refresh
 */
const refresh = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    throw new ApiError(401, 'No refresh token provided');
  }

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.userId).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  if (user.status === 'DISABLED') {
    throw new ApiError(403, 'Your account has been disabled');
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id, user.role);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    data: { accessToken }
  });
});

/**
 * POST /api/auth/logout
 */
const logout = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    const user = await User.findOne({ refreshToken: token }).select('+refreshToken');
    if (user) {
      // Find latest log and update logoutTime
      const lastLog = await UserLog.findOne({ userId: user._id }).sort({ loginTime: -1 });
      if (lastLog && !lastLog.logoutTime) {
        lastLog.logoutTime = new Date();
        lastLog.sessionDuration = Math.round((lastLog.logoutTime - lastLog.loginTime) / 1000);
        await lastLog.save();
      }

      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
    }
  }

  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * GET /api/auth/me
 */
const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    success: true,
    data: { user }
  });
});

module.exports = { signup, login, refresh, logout, getMe };
