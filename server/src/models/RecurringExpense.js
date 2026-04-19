const mongoose = require('mongoose');
const { CATEGORIES } = require('./Expense');

const recurringExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 100
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category'
      },
      lowercase: true
    },
    dayOfMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 28,
      default: 1
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastProcessed: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RecurringExpense', recurringExpenseSchema);
