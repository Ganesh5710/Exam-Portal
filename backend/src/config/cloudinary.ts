import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';
import fs from 'fs';
import path from 'path';

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  logger.info('Cloudinary initialized successfully.');
} else {
  logger.info('Cloudinary credentials missing. Falling back to local workspace disk storage at /uploads.');
}

export const uploadMedia = async (file: Express.Multer.File): Promise<string> => {
  if (useCloudinary) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: 'auto',
        folder: 'online-exam-portal',
      });
      // Delete temporary local file
      fs.unlinkSync(file.path);
      return result.secure_url;
    } catch (e) {
      logger.error(`Cloudinary upload failed: ${(e as Error).message}. Returning local mock path.`);
    }
  }

  // Local storage fallback
  const uploadDir = path.join(__dirname, '../../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileExt = path.extname(file.originalname);
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${fileExt}`;
  const targetPath = path.join(uploadDir, fileName);

  fs.copyFileSync(file.path, targetPath);
  fs.unlinkSync(file.path);

  // Return local asset path
  return `/uploads/${fileName}`;
};

export { cloudinary };
