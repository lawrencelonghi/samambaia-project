import type {Request, Response} from 'express';
import { Router } from 'express'
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import fs from 'fs'
import path from 'path';

const router = Router()
const prisma = new PrismaClient()

//POST /api/categories/:categoryId/products adiciona novo produto
router.post('/:categoryId/products', authMiddleware, 
  upload.single('image'), async (req: Request, res: Response) => {

    try {

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

    const product = await prisma.product.create({
      data: {
        filename: file.filename,
        title: req.body,
        description: req.body,
        price: req.body,
        categoryId
      }
    })
    return res.status(201).json({message: 'produto adicionado:', product})

    } catch (error) {
        console.error('Error when uploading images:', error);
        return res.status(500).json({ error: 'Error when uploading images' });
    }

})

export default router