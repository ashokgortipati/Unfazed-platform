import express from 'express';
import {
  uploadFile,
  getFiles,
  downloadFile,
  deleteFile,
} from '../controllers/fileController.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(requireAuth);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/', getFiles);
router.get('/:id/download', downloadFile);
router.delete('/:id', deleteFile);

export default router;
