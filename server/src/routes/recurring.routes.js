const router = require('express').Router();
const {
  getRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring
} = require('../controllers/recurring.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/error.middleware');
const { recurringExpenseSchema, updateRecurringSchema } = require('../validators/schemas');

router.use(authenticate);

router.get('/', getRecurring);
router.post('/', validate(recurringExpenseSchema), createRecurring);
router.put('/:id', validate(updateRecurringSchema), updateRecurring);
router.delete('/:id', deleteRecurring);

module.exports = router;
