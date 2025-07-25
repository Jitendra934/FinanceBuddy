const express = require('express')
const authMiddleWare = require('../middleware/authMiddleware');
const { getCategories, createCategory, deleteCategory, updateCategory } = require('../controllers/categoryController');
const sanitizeMiddleware = require('../middleware/sanitizeMiddleware');

const router = express.Router();

router.get('/', authMiddleWare, getCategories);
router.post('/', authMiddleWare, sanitizeMiddleware, createCategory);
router.put('/:id', authMiddleWare, sanitizeMiddleware, updateCategory);
router.delete('/:id', authMiddleWare, sanitizeMiddleware, deleteCategory);

module.exports = router