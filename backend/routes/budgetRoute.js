const express = require('express')
const authMiddleWare = require('../middleware/authMiddleware');
const { getBudgets , createBudget , updateBudget , deleteBudget, getBudgetsByMonth } = require('../controllers/budgetController')
const sanitizeMiddleware = require('../middleware/sanitizeMiddleware')
const router = express.Router()

router.get('/', authMiddleWare, getBudgets)
router.post('/' , authMiddleWare, sanitizeMiddleware, createBudget)
router.put('/:id', authMiddleWare, sanitizeMiddleware, updateBudget)
router.delete('/:id', authMiddleWare, sanitizeMiddleware, deleteBudget)
router.get('/', authMiddleWare, sanitizeMiddleware, getBudgetsByMonth)

module.exports = router;