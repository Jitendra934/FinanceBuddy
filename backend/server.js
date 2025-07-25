require('dotenv').config();
const express = require('express')
const cors = require('cors')
const  authRouter  = require('./routes/authRoute')
const  transactionRouter  = require('./routes/transactionRoute')
const  budgetRouter  = require('./routes/budgetRoute')
const  reportRouter  = require('./routes/reportRoute')
const  categoryRouter  = require('./routes/categoryRoute')

const app = express()
const PORT = process.env.PORT || 4000;

const allowedOrigins = ['http://localhost:5173', 'https://finance-buddy-pi.vercel.app']

app.use(cors({origin: allowedOrigins}))
app.use(express.json())


app.get('/', (req, res) =>  res.send('Api is working'))
app.use('/api/auth', authRouter)
app.use('/api/transactions', transactionRouter)
app.use('/api/budgets', budgetRouter)
app.use('/api/reports', reportRouter)
app.use('/api/categories', categoryRouter)

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`)
})