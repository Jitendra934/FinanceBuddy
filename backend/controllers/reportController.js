const  prisma  = require('../prismaInstance')

const getMonthlyReport = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({ where: { userId: req.userId}})
    const report = transactions.reduce((acc, tx) =>  { /*Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function. */
      const month = new Date(tx.date).getMonth();  
      const type = tx.type;                         //acc is the accumulator object which stores the total of (something)
      acc[month] = acc[month] || { income: 0, expense:0};
      acc[month][type.toLowerCase()] += tx.amount;
      return acc;
    },{})

    res.json( report );

  } catch (error) {
    res.status(500).json({error: 'Failed to fetch monthly report'})
  }
}

const getCategoryReport = async (req, res) => {
  try {
    const { period = 'current' } = req.query; 
    
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'current':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      default:
        // Default to current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const transactions = await prisma.transaction.findMany({ 
      where: { 
        userId: req.userId,
        date: {
          gte: startDate, 
          lte: now       
        },
        category: {
          name: {
           notIn: ['Income', 'Salary', 'Business', 'Freelance', 'Investment', 'Other Incomes'] //not include the category 'income' when displaying the category report
          }
        }
      },
      include: { category: true } 
    });
    
    const report = transactions.reduce((acc, tx) => {
      const categoryName = tx.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + tx.amount
      return acc;
    },{})

    res.json( report )

  } catch (error) {
    res.status(500).json({error: 'Failed to fetch category report'})
  }
}


const getBalanceReport = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({ where: { userId: req.userId} });
    let income = 0;
    let expense = 0;
    for(const tx of transactions) {
      if(tx.type === 'INCOME') income += tx.amount
      else expense += tx.amount
    }
    res.json({ income , expense , balance: income - expense})
  } catch (error) {
    res.status(500).json({error: 'Failed to fetch category report'})
  }
}

module.exports = {
  getMonthlyReport,
  getCategoryReport,
  getBalanceReport
}