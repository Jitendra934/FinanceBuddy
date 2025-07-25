const express = require('express')
const authMiddleWare = require('../middleware/authMiddleware');
const { getTransactions , createTransaction , getTransactionById , updateTransaction , deleteTransaction, getTransactionsByMonth } = require('../controllers/transactionController')
const sanitizeMiddleware = require('../middleware/sanitizeMiddleware')

const router = express.Router()

router.get('/' , authMiddleWare, getTransactions)
router.post('/', authMiddleWare, sanitizeMiddleware, createTransaction)
router.get('/monthly', authMiddleWare, sanitizeMiddleware, getTransactionsByMonth)
router.get('/:id', authMiddleWare, sanitizeMiddleware, getTransactionById)
router.put('/:id', authMiddleWare, sanitizeMiddleware, updateTransaction)
router.delete('/:id', authMiddleWare, sanitizeMiddleware, deleteTransaction)

module.exports = router