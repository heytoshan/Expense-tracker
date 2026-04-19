const router = require('express').Router();
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  exportExpenses
} = require('../controllers/expense.controller');
const { importExpenses, upload } = require('../controllers/import.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/error.middleware');
const { createExpenseSchema, updateExpenseSchema } = require('../validators/schemas');

// All expense routes require authentication
router.use(authenticate);

router.get('/export', exportExpenses);
router.post('/import', upload.single('file'), importExpenses);
router.get('/', getExpenses);
router.post('/', validate(createExpenseSchema), createExpense);
router.put('/:id', validate(updateExpenseSchema), updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
