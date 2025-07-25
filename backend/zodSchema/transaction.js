const z = require('zod');

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'], {
    required_error: "Type must be 'INCOME' or 'EXPENSE'",
  }),
  amount: z.number().positive(),
  date: z.coerce.date(),
  note: z.string().optional(),
  categoryName: z.string().min(1, "Category name is required")
});

const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  date: z.coerce.date().optional(),
   note: z.string().optional(),
  categoryName: z.string().min(1).optional()
})

module.exports = { transactionSchema , updateTransactionSchema };