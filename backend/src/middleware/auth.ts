import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    // Check if user still exists and is valid
    checkUserValidity(payload.userId, payload.username)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }
        
        // Check if user account has expired
        if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
          return res.status(401).json({ error: 'Account has expired' });
        }
        
        // Update payload with current user data
        req.user = {
          userId: user.id,
          username: user.username,
          role: user.role
        };
        
        next();
      })
      .catch((error) => {
        console.error('Error checking user validity:', error);
        return res.status(401).json({ error: 'Error validating user' });
      });
      
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function checkUserValidity(userId: number, username: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        username: username
      },
      select: {
        id: true,
        username: true,
        role: true,
        expiresAt: true
      }
    });
    
    return user;
  } catch (error) {
    console.error('Database error checking user:', error);
    throw error;
  }
}
