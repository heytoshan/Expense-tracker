const User = require('../models/User');
const UserLog = require('../models/UserLog');
const { catchAsync, ApiError } = require('../utils/helpers');

/**
 * GET /api/admin/users
 * Get all users with summary activity stats
 */
const getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  
  // Aggregate stats for each user
  const userStats = await Promise.all(users.map(async (user) => {
    const logs = await UserLog.find({ userId: user._id }).sort({ loginTime: -1 });
    const totalLogins = logs.length;
    const lastLogin = totalLogins > 0 ? logs[0].loginTime : null;
    const totalSessions = logs.filter(l => l.logoutTime).length;
    
    return {
      ...user.toJSON(),
      totalLogins,
      totalSessions,
      lastLogin
    };
  }));

  res.json({
    success: true,
    data: userStats
  });
});

/**
 * PATCH /api/admin/users/:id/role
 */
const updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;
  if (!['USER', 'ADMIN'].includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) throw new ApiError(404, 'User not found');

  res.json({
    success: true,
    message: `User role updated to ${role}`,
    data: user
  });
});

/**
 * PATCH /api/admin/users/:id/status
 */
const updateUserStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!['ACTIVE', 'DISABLED'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!user) throw new ApiError(404, 'User not found');

  res.json({
    success: true,
    message: `User status updated to ${status}`,
    data: user
  });
});

/**
 * DELETE /api/admin/users/:id
 */
const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  // Cleanup logs
  await UserLog.deleteMany({ userId: req.params.id });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * GET /api/admin/logs/:userId
 */
const getUserLogs = catchAsync(async (req, res) => {
  const logs = await UserLog.find({ userId: req.params.userId }).sort({ loginTime: -1 });
  
  res.json({
    success: true,
    data: logs
  });
});

/**
 * GET /api/admin/stats
 */
const getAdminStats = catchAsync(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: 'ACTIVE' });
  const totalLogins = await UserLog.countDocuments();
  
  // Avg session duration
  const sessionsWithDuration = await UserLog.find({ sessionDuration: { $exists: true } });
  const totalDuration = sessionsWithDuration.reduce((acc, curr) => acc + curr.sessionDuration, 0);
  const avgSessionDuration = sessionsWithDuration.length > 0 ? Math.round(totalDuration / sessionsWithDuration.length) : 0;

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      totalLogins,
      avgSessionDuration
    }
  });
});

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getUserLogs,
  getAdminStats
};
