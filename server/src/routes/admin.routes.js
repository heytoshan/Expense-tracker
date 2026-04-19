const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeAdmin } = require('../middlewares/admin.middleware');

// All routes require authentication and admin privileges
router.use(authenticate);
router.use(authorizeAdmin);

router.get('/users', adminController.getAllUsers);
router.get('/stats', adminController.getAdminStats);
router.get('/logs/:userId', adminController.getUserLogs);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
