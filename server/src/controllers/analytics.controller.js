const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const { catchAsync } = require('../utils/helpers');

/**
 * GET /api/analytics/monthly
 * Monthly spending summary for the current year or specified year
 */
const getMonthlySummary = catchAsync(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const data = await Expense.aggregate([
    {
      $match: {
        user: userId,
        date: {
          $gte: new Date(year, 0, 1),
          $lte: new Date(year, 11, 31, 23, 59, 59)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$date' },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Fill in all 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const found = data.find((d) => d._id === i + 1);
    return {
      month: i + 1,
      total: found ? found.total : 0,
      count: found ? found.count : 0
    };
  });

  const yearTotal = months.reduce((sum, m) => sum + m.total, 0);

  res.json({
    success: true,
    data: { year, months, yearTotal }
  });
});

/**
 * GET /api/analytics/category
 * Category-wise breakdown for a given month/year
 */
const getCategoryBreakdown = catchAsync(async (req, res) => {
  const now = new Date();
  const month = parseInt(req.query.month) || now.getMonth() + 1;
  const year = parseInt(req.query.year) || now.getFullYear();
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const data = await Expense.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);

  const grandTotal = data.reduce((sum, d) => sum + d.total, 0);

  const categories = data.map((d) => ({
    category: d._id,
    total: d.total,
    count: d.count,
    percentage: grandTotal > 0 ? Math.round((d.total / grandTotal) * 100) : 0
  }));

  res.json({
    success: true,
    data: { categories, grandTotal, month, year }
  });
});

module.exports = { getMonthlySummary, getCategoryBreakdown };
