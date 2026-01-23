import type { Request, Response } from 'express';
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router()
const prisma = new PrismaClient()

// POST /api/auth/login

router.post('/login', async (req: Request, res: Response) => {

  const { username, password } = req.body

  try {

    //validar se usuario enviou dados
    if(!username || !password) {
      return res.status(400).json({ error: 'username ou senha invalido'})
    }

    //buscar usuario admin
    const admin = await prisma.admin.findUnique({ where: {username}})

    if(!admin) {
      return res.status(401).json({ error: 'credenciais invalidas'})
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password)

    if(!isPasswordValid) {
      return res.status(401).json({ error: 'credenciais invalidas'})
    }

    //gerar token jwt
    const secret = process.env.JWT_SECRET;
    if(!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      { adminId: admin.id }, 
      secret, 
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    })
   } catch(error) {
      console.error('erro de login:', error);
      return res.status(500).json({ error: 'internal server error' });
    }
  })

  //GET /api/auth/me
  router.get('/me', async (req: Request, res: Response) => {
    try {
       //remove prefixo Bearer do token 
    const token = req.headers.authorization?.replace('Bearer ', '')

    if(!token) {
      return res.status(401).json({ error: 'nao autorizado' });
    }

    const secret = process.env.JWT_SECRET

    if(!secret) {
      throw new Error("JWT_SECRET nao configurado")
    }
    const decoded = jwt.verify(token,secret) as {adminId: string}

    const admin = await prisma.admin.findUnique({
      where: {id: decoded.adminId},
      select: { id: true, username: true}
    })

    if(!admin) {
      return res.status(401).json({ error: 'nao autorizado' });
    }

    return res.json({admin})

    } catch (error) {
          return res.status(401).json({ error: 'token invalido' });
    }
  })

  export default router