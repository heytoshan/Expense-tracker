/**
 * Admin middleware — restricts access to users with the 'ADMIN' role.
 * Should be used AFTER the 'authenticate' middleware.
 */
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

module.exports = { authorizeAdmin };
