const Expense = require('../models/Expense');
const { ApiError, catchAsync } = require('../utils/helpers');

/**
 * GET /api/expenses
 * Supports: pagination, search, category filter, date range
 */
const getExpenses = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    startDate,
    endDate,
    sortBy = 'date',
    sortOrder = 'desc'
  } = req.query;

  const filter = { user: req.user.id };

  // Search by title
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  // Filter by category
  if (category) {
    filter.category = category.toLowerCase();
  }

  // Filter by date range
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [expenses, total] = await Promise.all([
    Expense.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
    Expense.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

/**
 * POST /api/expenses
 */
const createExpense = catchAsync(async (req, res) => {
  const expense = await Expense.create({
    ...req.body,
    user: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'Expense created',
    data: { expense }
  });
});

/**
 * PUT /api/expenses/:id
 */
const updateExpense = catchAsync(async (req, res) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  res.json({
    success: true,
    message: 'Expense updated',
    data: { expense }
  });
});

/**
 * DELETE /api/expenses/:id
 */
const deleteExpense = catchAsync(async (req, res) => {
  const expense = await Expense.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  res.json({
    success: true,
    message: 'Expense deleted'
  });
});

/**
 * GET /api/expenses/export
 * Export expenses as CSV
 */
const exportExpenses = catchAsync(async (req, res) => {
  const { startDate, endDate, category } = req.query;
  const filter = { user: req.user.id };

  if (category) filter.category = category.toLowerCase();
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const expenses = await Expense.find(filter).sort({ date: -1 }).lean();

  // Build CSV manually for reliability
  const headers = ['Title', 'Amount', 'Category', 'Date', 'Notes'];
  const rows = expenses.map((e) => [
    `"${(e.title || '').replace(/"/g, '""')}"`,
    e.amount,
    e.category,
    new Date(e.date).toISOString().split('T')[0],
    `"${(e.notes || '').replace(/"/g, '""')}"`
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
  res.send(csv);
});

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  exportExpenses
};
