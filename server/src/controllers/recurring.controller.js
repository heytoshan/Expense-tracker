const RecurringExpense = require('../models/RecurringExpense');
const { ApiError, catchAsync } = require('../utils/helpers');

/**
 * GET /api/recurring
 */
const getRecurring = catchAsync(async (req, res) => {
  const expenses = await RecurringExpense.find({ user: req.user.id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { expenses }
  });
});

/**
 * POST /api/recurring
 */
const createRecurring = catchAsync(async (req, res) => {
  const expense = await RecurringExpense.create({
    ...req.body,
    user: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'Recurring expense created',
    data: { expense }
  });
});

/**
 * PUT /api/recurring/:id
 */
const updateRecurring = catchAsync(async (req, res) => {
  const expense = await RecurringExpense.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!expense) {
    throw new ApiError(404, 'Recurring expense not found');
  }

  res.json({
    success: true,
    message: 'Recurring expense updated',
    data: { expense }
  });
});

/**
 * DELETE /api/recurring/:id
 */
const deleteRecurring = catchAsync(async (req, res) => {
  const expense = await RecurringExpense.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  if (!expense) {
    throw new ApiError(404, 'Recurring expense not found');
  }

  res.json({
    success: true,
    message: 'Recurring expense deleted'
  });
});

module.exports = { getRecurring, createRecurring, updateRecurring, deleteRecurring };
