import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, restrictTo } from '../../middleware/auth';
import { uploadImportFile, getJobStatus, cancelJob, approveImport } from './import.controller';

const router = Router();

// Configure multer storage inside local uploads directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../../../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `import-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // limit file size to 50MB
});

router.use(protect);
router.use(restrictTo('ADMIN'));

router.post('/upload', upload.single('file'), uploadImportFile);
router.get('/status/:id', getJobStatus);
router.post('/cancel/:id', cancelJob);
router.post('/approve/:id', approveImport);

export default router;
