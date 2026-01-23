import type { Request, Response } from "express";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import type { responseEncoding } from "axios";
import { authMiddleware } from "../middlewares/authMiddleware.js";


const router = Router()
const prisma = new PrismaClient()

//POST /api/categories adiciona categorias 
router.post('/', authMiddleware ,async (req: Request, res: Response) => {

  try {
    const { title } = req.body 

    if(!title) {
      return res.status(400).json({error: 'titulo é obrigatorio'})
    }

    const existingCategory = await prisma.category.findUnique({where: {title}})

    if(existingCategory) {
      return res.status(409).json({error: 'categoria ja existe'})
    }

    const lastCategory = await prisma.category.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true }
    }) 

    const newOrder = lastCategory ? lastCategory.order + 1 : 0

    const newCategory = await prisma.category.create({
      data: {
        title: title,
        order: newOrder
      }
    })

    return res.status(201).json(newCategory)

  } catch (error) {
      console.error('erro ao criar categoria', error);
      return res.status(500).json({ error: 'internal server error' });
  }
})

//GET /api/categories lista todas as categorias (admin e front publico)
router.get('/', async (req: Request, res: Response) => {

  try {
    const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } })

    if(!categories) {
      return res.status(400).json({error: 'nenhuma categoria criada'})
    }

    return res.status(200).json(categories)
  } catch (error) {
      console.error('erro ao buscar categorias', error);
      return res.status(500).json({ error: 'internal server error' });
  }
})

//PUT /api/categories/:id envia os dados editados de uma categoria
router.put('/:id', authMiddleware , async (req: Request, res: Response) => {
  try {

    const id = req.params.id
    const {title, order} = req.body

    if(!id) {
      return res.status(400).json({ error: 'ID e necessario' });
    }

    if (!title && order === undefined) {
      return res.status(400).json({ error: 'nenhum campo para atualizar' });
    }

    const category = await prisma.category.update({
      where: {id},
      data: {
        ...(title && { title }),
        ...(order !== undefined && { order })
      }
    })

    return res.status(200).json(category)

  } catch (error) {
    console.error('erro ao atualizar categoria', error);
    return res.status(500).json({ error: 'internal server error' });
  }
})

//DELETE /api/categories/:id deleta categoria E SEUS PRODUTOS
router.delete('/:id', authMiddleware , async (req: Request, res: Response) => {

  try {
    
    const id = req.params.id

    if(!id) {
      return res.status(400).json({ error: 'ID e necessario' });
    }

    const productsCount = await prisma.product.count({ where: { categoryId: id } })

    const category = await prisma.category.delete({where: {id}})

    return res.status(200).json({
      message: 'categoria deletada com sucesso',
      category,
      productsDeleted: productsCount
    })

  } catch (error) {
      console.error('erro ao deletar categoria', error);
      return res.status(500).json({ error: 'internal server error' });
  }
})

export default router