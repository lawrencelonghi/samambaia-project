import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

//GET pagina inicial do cardapio
router.get('/', async (req, res) => {
  try {
    const categorias = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        products: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.render('index', { categorias });
  } catch (error) {
    console.error('Erro ao renderizar página:', error);
    res.status(500).send('Erro ao carregar o menu');
  }
});

//GET login da pagina admin
router.get('/admin-login', async (req, res) => {
  res.render('adminLogin')
})

//GET dashboard da pagina admin
router.get('/admin-dashboard', async (req, res) => {
  res.render('adminDashboard')
})

export default router;