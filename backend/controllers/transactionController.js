const { transactionSchema, updateTransactionSchema } = require('../zodSchema/transaction')
const prisma = require('../prismaInstance')
const { sanitizeTransactionType, sanitizeAmount, sanitizeDate, sanitizeText } = require('../utils/sanitize')
const { connect } = require('../routes/authRoute')
const { date } = require('zod')


const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalTransactions = await prisma.transaction.count({
      where: { userId: req.userId}
    })

    const totalPages = Math.ceil(totalTransactions / limit);

    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId },
      include: { category: true },
      orderBy: { date: 'desc' },
      skip,
      take: limit
    })
    res.json({
      data: transactions,
      totalPages,
      currentPage: page,
      totalTransactions
    })
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch transactions'
    })
  }
}

const getTransactionsByMonth = async (req, res) => {
  const { month, year } = req.query;
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: { category: true }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

const createTransaction = async (req, res) => {
  const sanitizedInput = {
    type: req.body.type ? sanitizeTransactionType(req.body.type) : undefined,
    amount: req.body.amount ? sanitizeAmount(req.body.amount) : undefined,
    date: req.body.date ? sanitizeDate(req.body.date) : undefined,
    note: req.body.note ? sanitizeText(req.body.note).substring(0, 500) : undefined,
    categoryName: req.body.categoryName ? sanitizeText(req.body.categoryName) : undefined,
  };

  const result = transactionSchema.safeParse(sanitizedInput);
  if (!result.success) {
    return res.status(422).json({
      error: 'Invalid Input',
      details: result.error.format()
    });
  }

  const { type, amount, date, note, categoryName } = result.data;

  const transactionData = {
    type,
    amount,
    date,
    note: note || "",
    category: {
      connectOrCreate: {
        where: { name: categoryName },
        create: { name: categoryName }
      }
    },
    user: {
      connect: {
        id: req.userId
      }
    }
  };

  if (transactionData.amount === 0) {
    return res.status(400).json({
      error: 'Invalid amount provided'
    });
  }

  try {
    const transaction = await prisma.transaction.create({
      data: transactionData,
      include: { category: true }
    })
    res.status(201).json(transaction)
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(400).json({
      error: 'Failed to create transaction'
    })
  }
}

const getTransactionById = async (req, res) => {
  const id = sanitizeText(req.params.id);
  try {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.userId
      },
      include: { category: true }
    })

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' })
    }

    res.json(transaction)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get transaction' })
  }
}

const updateTransaction = async (req, res) => {
  const id = sanitizeText(req.params.id);

  const sanitizedInput = {
    amount: req.body.amount ? sanitizeAmount(req.body.amount) : undefined,
    date: req.body.date ? sanitizeDate(req.body.date) : undefined,
    note: req.body.note ? sanitizeText(req.body.note).substring(0, 500) : undefined,
    categoryName: req.body.categoryName ? sanitizeText(req.body.categoryName) : undefined
  };

  const cleanInput = Object.fromEntries(
    Object.entries(sanitizedInput).filter(([_, value]) => value !== undefined)
  )

  const result = updateTransactionSchema.safeParse(cleanInput);
  if (!result.success) {
    return res.status(422).json({
      error: 'Invalid input',
      details: result.error.format()
    });
  }

  const updatedData = result.data

  // Handling category update if categoryName is provided
  if (updatedData.categoryName) {
    updatedData.category = {
      connectOrCreate: {
        where: { name: updatedData.categoryName },
        create: { name: updatedData.categoryName }
      }
    }
    delete updatedData.categoryName;
  }

  if (updatedData.amount !== undefined && updatedData.amount === 0) {
    return res.status(400).json({
      error: 'Invalid amount provided'
    })
  }

  try {
    // Checking if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId: req.userId }
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: updatedData,
      include: { category: true }
    })
    res.json(updatedTransaction)
  } catch (error) {
    console.error('Transaction update error:', error);
    res.status(400).json({ error: 'Failed to update transaction' })
  }
}

const deleteTransaction = async (req, res) => {
  const id = sanitizeText(req.params.id);
  try {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.userId }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await prisma.transaction.delete({
      where: { id }
    })
    res.status(204).send()
  } catch (error) {
    if (error.code === 'P2025') { // Prisma "Record not found" error
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(500).json({ error: 'Failed to delete transaction' })
  }
}

module.exports = {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionsByMonth
}