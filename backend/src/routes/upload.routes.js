import { Router } from 'express';
import upload from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';
import { uploadDeviceImage, uploadDeviceVideo, uploadAvatar, uploadPostImage } from '../controllers/upload.controller.js';
import fs from 'fs';

const router = Router();

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// All upload routes require authentication
router.use(authenticate);

// Upload device image
router.post('/device/:id/image', upload.single('file'), uploadDeviceImage);

// Upload device video
router.post('/device/:id/video', upload.single('file'), uploadDeviceVideo);

// Upload user avatar
router.post('/avatar', upload.single('file'), uploadAvatar);

// Upload post image (up to 5 images at once)
router.post('/post/image', upload.array('files', 5), uploadPostImage);

export default router;
