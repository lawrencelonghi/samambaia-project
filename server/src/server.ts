import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from "path";
import authRoutes from './routes/auth.js'
import categoriesRoutes from './routes/categories.js'
import productsRoutes from './routes/products.js'

dotenv.config()

const PORT = process.env.PORT || 3000

const app = express()



app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/categories', productsRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
