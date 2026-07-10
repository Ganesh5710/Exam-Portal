import { Response, NextFunction } from 'express';
import { prisma } from '../../database/db';
import { AuthenticatedRequest } from '../../middleware/auth';

export const getSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.systemSettings.findMany();
    // Convert array to simple key-value dictionary object
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return res.status(200).json({ success: true, data: settingsMap });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const updates = req.body; // Record<string, string>

  try {
    const keys = Object.keys(updates);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, message: 'Settings payload is empty.' });
    }

    // Update settings in transaction
    await prisma.$transaction(
      keys.map(key =>
        prisma.systemSettings.upsert({
          where: { key },
          update: { value: String(updates[key]) },
          create: { key, value: String(updates[key]) }
        })
      )
    );

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'UPDATE_SYSTEM_SETTINGS',
        target: `Keys: ${keys.join(', ')}`,
        ipAddress: req.ip
      }
    });

    return res.status(200).json({ success: true, message: 'System settings updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// Seed helper to trigger on server startup
export const seedDefaultSettings = async () => {
  const defaults = [
    { key: 'INSTITUTION_NAME', value: 'SecureExam Tech University', description: 'Institution title branding' },
    { key: 'INSTITUTION_LOGO', value: '', description: 'Branding logo asset path' },
    { key: 'THEME', value: 'dark', description: 'Portal base theme' },
    { key: 'SMTP_HOST', value: 'smtp.mailtrap.io', description: 'Email server address' },
    { key: 'SMTP_PORT', value: '2525', description: 'Email server port' },
    { key: 'EXAM_PASS_PERCENT', value: '40', description: 'Global default passing threshold percentage' },
    { key: 'SESSION_TIMEOUT', value: '60', description: 'Session timeout in minutes' },
    { key: 'MAINTENANCE_MODE', value: 'false', description: 'Block student access if true' }
  ];

  try {
    for (const item of defaults) {
      const exist = await prisma.systemSettings.findUnique({ where: { key: item.key } });
      if (!exist) {
        await prisma.systemSettings.create({ data: item });
      }
    }
  } catch (err) {
    // Fail silently on early boot
  }
};
