const router = require('express').Router();
const { getMonthlySummary, getCategoryBreakdown, getDailyTrend } = require('../controllers/analytics.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/monthly', getMonthlySummary);
router.get('/category', getCategoryBreakdown);
router.get('/daily', getDailyTrend);

module.exports = router;
