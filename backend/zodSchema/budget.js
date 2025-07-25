const z = require('zod');

const budgetSchema = z.object({
  amount: z.number().positive(),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  categoryName: z.string().min(1, "Category name is required")
});

const updateBudgetSchema = z.object({
  amount: z.number().positive().optional(),
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2000).max(2100).optional(),
  categoryName: z.string().min(1, "Category name is required").optional(),
})
.refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be updated',
})
module.exports = { budgetSchema , updateBudgetSchema};
