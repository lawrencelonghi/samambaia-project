import type {Request, Response} from 'express';
import { Router } from 'express'
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import fs from 'fs'
import path from 'path';

const router = Router()
const prisma = new PrismaClient()

//POST /api/categories/:categoryId/products adiciona novo produto em alguma categoria
router.post('/:categoryId/products', authMiddleware, 
  upload.single('image'), async (req: Request, res: Response) => {

    try {

            console.log('=== DEBUG ===');
      console.log('req.file:', req.file);
      console.log('req.body:', req.body);
      console.log('req.params:', req.params);
      console.log('============');

      const categoryId = req.params.categoryId
      const file = req.file as Express.Multer.File
      const { title, description, price } = req.body

      if(!categoryId) {
        return res.status(400).json({error: 'categoryId é obrigatório'})
      }

      if(!title || !price) {
        return res.status(400).json({error: 'titulo e preço são obrigatórios'})
      }
      if(!file) {
        return res.status(400).json({ error: 'nenhum arquivo foi adicionado' });
    }

    const category = await prisma.category.findUnique({where: {id: categoryId}})

    if(!category) {
      return res.status(400).json({ error: 'categoria nao encontrada' });
    }

    const lastProduct = await prisma.product.findFirst({
      where: { categoryId },
      orderBy: { order: 'desc' }
    })

    let currentProduct = lastProduct ? lastProduct.order + 1 : 0

    const product = await prisma.product.create({
      data: {
        filename: file.filename,
        title: title,
        description: description,
        price: parseFloat(price),
        categoryId,
        order: currentProduct++
      }
    })
    return res.status(201).json({message: 'produto adicionado:', product})

    } catch (error) {
        console.error('Error when uploading images:', error);
        return res.status(500).json({ error: 'Error when uploading images' });
    }

})

// GET /api/categories/:categoryId/products - Lista produtos de uma categoria
router.get('/:categoryId/products', async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.categoryId;

    if(!categoryId) {
      return res.status(400).json({error: 'id é obrigatório'})
    }
    
    const products = await prisma.product.findMany({
      where: { categoryId },
      orderBy: { order: 'asc' },
      include: { category: true } // inclui dados da categoria
    });
    
    return res.status(200).json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// GET /api/products - Lista TODOS os produtos
router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { order: 'asc' },
      include: { category: true }
    });
    
    return res.status(200).json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// GET /api/products/:id - Busca um produto específico
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if(!id) {
      return res.status(400).json({error: 'id é obrigatório'})
    }
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    return res.status(200).json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});


//DELETE /api/products/:id deleta um produto
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.params.id

    if(!id) {
      return res.status(400).json({error: 'id é obrigatório'})
    }

    const product = await prisma.product.findUnique({
      where: { id }, 
      include: {category: true } })
    
    if(!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    //deleta imagem do disco
    const filePath = path.join(process.cwd(),'uploads', product.filename)

    if(fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await prisma.product.delete({ where: { id } })

    return res.json({message: 'produto deletado com sucesso'})

  } catch (error) {
    console.error('erro ao deletar produto:', error);
    return res.status(500).json({ error: 'erro ao deletar produto' });
  }
})

//PUT /api/products/:id edita um produto
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    
    const id = req.params.id
    const { title, description, price } = req.body

    if(!id) {
      return res.status(400).json({error: 'id é obrigatório'})
    }

    if(!title && !description && !price) {
      return res.status(400).json({error: "nenhum dado para alterar"})
    }

    const product = await prisma.product.update({ 
      where: { id },
      data: {
        title: title,
        description: description,
        price: price
      }
    })

    return res.json(product)

  } catch (error) {
      console.error('erro ao atualizar produto');
      return res.status(500).json({ error: 'erro ao atualizar produto' });
  }
})

export default router