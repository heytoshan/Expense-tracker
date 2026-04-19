const Expense = require('../models/Expense');
const RecurringExpense = require('../models/RecurringExpense');

/**
 * Process all active recurring expenses.
 * Creates expense entries for any recurring expenses whose day-of-month matches today
 * and haven't been processed this month yet.
 */
const processRecurringExpenses = async () => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Find all active recurring expenses for today's date
  const recurringExpenses = await RecurringExpense.find({
    isActive: true,
    dayOfMonth: currentDay
  });

  const results = [];

  for (const recurring of recurringExpenses) {
    // Check if already processed this month
    if (recurring.lastProcessed) {
      const lastMonth = recurring.lastProcessed.getMonth();
      const lastYear = recurring.lastProcessed.getFullYear();
      if (lastMonth === currentMonth && lastYear === currentYear) {
        continue; // Already processed this month
      }
    }

    // Create the expense
    const expense = await Expense.create({
      user: recurring.user,
      title: recurring.title,
      amount: recurring.amount,
      category: recurring.category,
      date: today,
      notes: recurring.notes ? `[Recurring] ${recurring.notes}` : '[Recurring expense]',
      isRecurring: true,
      recurringRef: recurring._id
    });

    // Update lastProcessed
    recurring.lastProcessed = today;
    await recurring.save();

    results.push(expense);
  }

  return results;
};

module.exports = { processRecurringExpenses };
