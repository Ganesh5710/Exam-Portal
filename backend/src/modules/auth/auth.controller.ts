import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../database/db';
import { logger } from '../../config/logger';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super-secret-access-token-key-2026-portal';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-token-key-2026-portal';
const ACCESS_EXP = process.env.JWT_ACCESS_EXPIRATION || '15m';
const REFRESH_EXP = process.env.JWT_REFRESH_EXPIRATION || '7d';

const generateTokens = async (userId: string, email: string, role: string) => {
  const accessToken = jwt.sign({ id: userId, email, role }, ACCESS_SECRET, { expiresIn: ACCESS_EXP as any });
  const refreshTokenString = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXP as any });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Store refresh token in database
  const tokenRecord = await prisma.refreshToken.create({
    data: {
      token: refreshTokenString,
      userId,
      expiresAt,
    }
  });

  return { accessToken, refreshToken: refreshTokenString };
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check account status and lock time
    if (user.status === 'BLOCKED') {
      return res.status(403).json({ success: false, message: 'Account blocked. Please contact administrator.' });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const waitTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      return res.status(403).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${waitTime} minute(s).`
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Increment login failures
      const attempts = user.loginAttempts + 1;
      let lockUntil: Date | null = null;
      if (attempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        logger.warn(`User ${email} locked due to failed attempts`);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: attempts, lockUntil }
      });

      return res.status(401).json({
        success: false,
        message: attempts >= 5
          ? 'Account locked for 15 minutes due to too many failed attempts.'
          : 'Invalid email or password.'
      });
    }

    // Reset login failures on success
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockUntil: null }
    });

    const { accessToken, refreshToken } = await generateTokens(user.id, user.email, user.role);

    // Save tokens in cookies (HTTPOnly for security)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15m
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        target: `User ID: ${user.id}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          departmentId: user.departmentId
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken: requestToken } = req.body;

  if (!requestToken) {
    return res.status(400).json({ success: false, message: 'Refresh token is required.' });
  }

  try {
    // Verify token exists and is valid
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: requestToken },
      include: { user: true }
    });

    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    // Revoke old token (Refresh Token Rotation)
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true }
    });

    // Verify JWT payload
    const decoded = jwt.verify(requestToken, REFRESH_SECRET) as { id: string };
    if (decoded.id !== tokenRecord.userId) {
      return res.status(401).json({ success: false, message: 'Token ownership mismatch.' });
    }

    const user = tokenRecord.user;
    if (user.status === 'BLOCKED') {
      return res.status(403).json({ success: false, message: 'User account is blocked.' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user.id, user.email, user.role);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;

  try {
    if (refreshToken) {
      // Invalidate token in Database
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true }
      });
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({ success: true, message: 'Logout successful.' });
  } catch (error) {
    next(error);
  }
};
