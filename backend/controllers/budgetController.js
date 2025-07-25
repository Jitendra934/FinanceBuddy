const { budgetSchema, updateBudgetSchema } = require('../zodSchema/budget');
const prisma = require('../prismaInstance');
const { sanitizeText } = require('../utils/sanitize');

const getBudgets = async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId },
      include: { category: true }
    })
    res.json(budgets)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get budgets' })
  }
}

const getBudgetsByMonth = async (req, res) => {
  const { month, year } = req.query;
  try {
    const budgets = await prisma.budget.findMany({
      where: { 
        userId: req.userId,
        month: parseInt(month),
        year: parseInt(year)
      },
      include: { category: true }
    });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

const createBudget = async (req, res) => {
  const result = budgetSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      error: 'Invalid input',
      details: result.error.format()
    });
  }
  const { amount, month, year, categoryName } = result.data
  try {
    const budget = await prisma.budget.create({
      data: {
        amount,
        month,
        year,
        user: {
          connect: {
            id: req.userId
          }
        },
        category: {
          connectOrCreate: {
            where: { name: categoryName },
            create: { name: categoryName }
          }
        }
      }
    })
    res.status(201).json(budget)
  } catch (error) {
    console.error('Create budget error:', error)
    res.status(400).json({ error: 'Failed to create budget' })
  }
}

const updateBudget = async (req, res) => {
  const id = sanitizeText(req.params.id)

  const result = updateBudgetSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      error: 'Invalid input',
      details: result.error.format()
    });
  }
  //handling category update if categiry name changes
  const { categoryName, ...updatedData } = result.data;

  if (categoryName) {
    updatedData.category = {
      connectOrCreate: {
        where: { name: categoryName },
        create: { name: categoryName }
      }
    }
  }
  try {
    const budget = await prisma.budget.findFirst({
      where: { id, userId: req.userId },
      include: { category: true }
    })
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' })
    }

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: updatedData,
      include: { category: true }
    })
    res.json(updatedBudget)
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(400).json({ error: 'Failed to update budget' })
  }
}

const deleteBudget = async (req, res) => {
  const id = sanitizeText(req.params.id)
  try {
    const budget = await prisma.budget.findFirst({
      where: { id, userId: req.userId },
      include: { category: true }
    })

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' })
    }

    await prisma.budget.delete({
      where: { id }
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete budget' })
  }
}

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetsByMonth
}