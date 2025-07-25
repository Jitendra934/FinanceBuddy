const express = require('express')
const authMiddleWare = require('../middleware/authMiddleware');
const { getMonthlyReport , getCategoryReport , getBalanceReport } = require('../controllers/reportController')

const router = express.Router();

router.get('/monthly', authMiddleWare, getMonthlyReport)
router.get('/category', authMiddleWare, getCategoryReport)
router.get('/balance', authMiddleWare, getBalanceReport)

module.exports = router