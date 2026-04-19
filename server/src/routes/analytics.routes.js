const router = require('express').Router();
const { getMonthlySummary, getCategoryBreakdown } = require('../controllers/analytics.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/monthly', getMonthlySummary);
router.get('/category', getCategoryBreakdown);

module.exports = router;
