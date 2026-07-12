/**
 * auth.ts (middleware)
 * JWT-based authentication guard and role-based access control.
 * protect() verifies Bearer token and attaches user to request.
 * restrictTo() enforces role-based authorization (ADMIN / STUDENT).
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/db';
import { logger } from '../config/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'STUDENT';
    firstName: string;
    lastName: string;
    departmentId: string | null;
  };
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super-secret-access-token-key-2026-portal';

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please login.' });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as { id: string; email: string; role: 'ADMIN' | 'STUDENT' };

    // Fetch complete user profile & verify status is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        status: true,
        departmentId: true,
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or deleted.' });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ success: false, message: 'Your account is blocked. Contact administrator.' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.debug(`JWT verification failed: ${(error as Error).message}`);
    return res.status(401).json({ success: false, message: 'Session expired or invalid token.' });
  }
};

export const restrictTo = (...roles: ('ADMIN' | 'STUDENT')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permissions for this action.'
      });
    }
    next();
  };
};
