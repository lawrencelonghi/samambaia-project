import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  adminId: string;
}

// extends Request type to include adminId
declare global {
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token nao encontrado' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET nao configurado');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.adminId = decoded.adminId;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}  

