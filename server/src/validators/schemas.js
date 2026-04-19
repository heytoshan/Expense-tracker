const Joi = require('joi');
const { CATEGORIES } = require('../models/Expense');

// Auth validators
const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must be at most 50 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// Expense validators
const createExpenseSchema = Joi.object({
  title: Joi.string().max(100).required().messages({
    'any.required': 'Title is required',
    'string.max': 'Title must be at most 100 characters'
  }),
  amount: Joi.number().positive().required().messages({
    'any.required': 'Amount is required',
    'number.positive': 'Amount must be positive'
  }),
  category: Joi.string()
    .valid(...CATEGORIES)
    .required()
    .messages({
      'any.required': 'Category is required',
      'any.only': `Category must be one of: ${CATEGORIES.join(', ')}`
    }),
  date: Joi.date().iso().default(new Date()),
  notes: Joi.string().max(500).allow('').optional()
});

const updateExpenseSchema = Joi.object({
  title: Joi.string().max(100).optional(),
  amount: Joi.number().positive().optional(),
  category: Joi.string()
    .valid(...CATEGORIES)
    .optional(),
  date: Joi.date().iso().optional(),
  notes: Joi.string().max(500).allow('').optional()
}).min(1);

// Budget validators
const budgetSchema = Joi.object({
  category: Joi.string()
    .valid(...CATEGORIES)
    .required()
    .messages({
      'any.required': 'Category is required',
      'any.only': `Category must be one of: ${CATEGORIES.join(', ')}`
    }),
  amount: Joi.number().positive().required().messages({
    'any.required': 'Budget amount is required',
    'number.positive': 'Budget amount must be positive'
  }),
  month: Joi.number().min(1).max(12).required(),
  year: Joi.number().min(2020).max(2100).required()
});

// Recurring expense validators
const recurringExpenseSchema = Joi.object({
  title: Joi.string().max(100).required(),
  amount: Joi.number().positive().required(),
  category: Joi.string()
    .valid(...CATEGORIES)
    .required(),
  dayOfMonth: Joi.number().min(1).max(28).default(1),
  notes: Joi.string().max(500).allow('').optional(),
  isActive: Joi.boolean().default(true)
});

const updateRecurringSchema = Joi.object({
  title: Joi.string().max(100).optional(),
  amount: Joi.number().positive().optional(),
  category: Joi.string()
    .valid(...CATEGORIES)
    .optional(),
  dayOfMonth: Joi.number().min(1).max(28).optional(),
  notes: Joi.string().max(500).allow('').optional(),
  isActive: Joi.boolean().optional()
}).min(1);

module.exports = {
  signupSchema,
  loginSchema,
  createExpenseSchema,
  updateExpenseSchema,
  budgetSchema,
  recurringExpenseSchema,
  updateRecurringSchema
};
