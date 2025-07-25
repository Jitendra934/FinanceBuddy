const { categorySchema } = require('../zodSchema/category');
const prisma = require('../prismaInstance');
const { sanitizeText } = require('../utils/sanitize');

const getCategories = async (req, res) => {
  try {
    // Get categories that have transactions or budgets for this user
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          {
            transactions: {
              some: {
                userId: req.userId
              }
            }
          },
          {
            budgets: {
              some: {
                userId: req.userId
              }
            }
          }
        ]
      }
    })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get category' })
  }
}

const createCategory = async (req, res) => {
  const body = sanitizeText(req.body)
  const result = categorySchema.safeParse(body);
  if (!result.success) {
    return res.status(422).json({
      error: 'Invalid input',
      details: result.error.format()
    });
  }

  const name = result.name


  try {
    const category = await prisma.category.create({
      data: { name }
    })
    res.status(201).json(category)
  } catch (error) {
    console.error('Create category error:', error);
    res.status(400).json({ error: 'Failed to create category' })
  }
}

const updateCategory = async (req, res) => {
  const id = sanitizeText(req.params.id)
  const body = sanitizeText(req.body)
  const result = categorySchema.safeParse(body);
  if (!result.success) {
    return res.status(422).json({
      error: 'Invalid input',
      details: result.error.format()
    });
  }

  const updatedData = result.data

  try {
    const category = await prisma.category.findFirst({
      where: { id }
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updatedData
    })
    res.json(updatedCategory)
  } catch (error) {
    console.error('Update category error:', error);
    res.status(400).json({ error: 'Failed to update category' })
  }
}

const deleteCategory = async (req, res) => {
  const id = sanitizeText(req.params.id)
  try {
    const category = await prisma.category.findFirst({
      where: { id }
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    const budgetsUsingCategory = await prisma.budget.findFirst({
      where: {
        categoryId: id,
        userId: req.userId
      }
    })

    if (budgetsUsingCategory) {
      return res.status(400).json({
        error: 'Cannot delete category that is being used in budgets'
      })
    }

    await prisma.category.delete({
      where: { id }
    })
    res.status(204).send()
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Failed to delete category' })
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
}