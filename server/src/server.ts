import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from "path";
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js'
import categoriesRoutes from './routes/categories.js'
import productsRoutes from './routes/products.js'
import frontendRoutes from './routes/frontend.js'
import { PrismaClient } from '@prisma/client';
import * as slugify from './utils/slugify.js';


dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000
const prisma = new PrismaClient()

const app = express()

// Configurar EJS como template engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../../client/views'))

app.use(cors())
app.use(express.json())

app.locals = {
  ...app.locals,
  ...slugify
};

// Servir arquivos estáticos
app.use('/static', express.static(path.join(__dirname, '../../client/static')))
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

// Rotas da API
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/categories', productsRoutes)
app.use('/api/products', productsRoutes)
app.use('/', frontendRoutes)




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})