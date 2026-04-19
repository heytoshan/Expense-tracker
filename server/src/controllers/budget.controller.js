const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { ApiError, catchAsync } = require('../utils/helpers');

/**
 * GET /api/budgets
 * Get all budgets for the current user, optionally filtered by month/year
 */
const getBudgets = catchAsync(async (req, res) => {
  const { month, year } = req.query;
  const filter = { user: req.user.id };

  if (month) filter.month = parseInt(month);
  if (year) filter.year = parseInt(year);

  const budgets = await Budget.find(filter).sort({ category: 1 });

  res.json({
    success: true,
    data: { budgets }
  });
});

/**
 * POST /api/budgets
 * Create or update a budget (upsert)
 */
const upsertBudget = catchAsync(async (req, res) => {
  const { category, amount, month, year } = req.body;

  const budget = await Budget.findOneAndUpdate(
    { user: req.user.id, category, month, year },
    { amount },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({
    success: true,
    message: 'Budget saved',
    data: { budget }
  });
});

/**
 * GET /api/budgets/status
 * Compare budgets vs actual spending for a given month
 */
const getBudgetStatus = catchAsync(async (req, res) => {
  const now = new Date();
  const month = parseInt(req.query.month) || now.getMonth() + 1;
  const year = parseInt(req.query.year) || now.getFullYear();

  // Get all budgets for this month
  const budgets = await Budget.find({
    user: req.user.id,
    month,
    year
  });

  // Get actual spending per category for this month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const spending = await Expense.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user.id),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' }
      }
    }
  ]);

  // Build status for each budget
  const spendingMap = {};
  spending.forEach((s) => {
    spendingMap[s._id] = s.total;
  });

  const status = budgets.map((budget) => {
    const spent = spendingMap[budget.category] || 0;
    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

    return {
      category: budget.category,
      budgeted: budget.amount,
      spent,
      remaining,
      percentage,
      exceeded: spent > budget.amount
    };
  });

  res.json({
    success: true,
    data: { status, month, year }
  });
});

/**
 * DELETE /api/budgets/:id
 */
const deleteBudget = catchAsync(async (req, res) => {
  const budget = await Budget.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  if (!budget) {
    throw new ApiError(404, 'Budget not found');
  }

  res.json({
    success: true,
    message: 'Budget deleted'
  });
});

module.exports = { getBudgets, upsertBudget, getBudgetStatus, deleteBudget };
