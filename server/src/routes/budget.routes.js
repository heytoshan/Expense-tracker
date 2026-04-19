const router = require('express').Router();
const {
  getBudgets,
  upsertBudget,
  getBudgetStatus,
  deleteBudget
} = require('../controllers/budget.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/error.middleware');
const { budgetSchema } = require('../validators/schemas');

router.use(authenticate);

router.get('/status', getBudgetStatus);
router.get('/', getBudgets);
router.post('/', validate(budgetSchema), upsertBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
