import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { Device } from '../models/index.js';
import logger from '../utils/logger.js';

export const uploadDeviceImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'No file uploaded' },
      });
    }

    const result = await uploadToCloudinary(req.file.path, 'ecoloop/devices', 'image');

    // Update device metadata with image
    const device = await Device.findByPk(req.params.id);
    if (!device || device.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Device not found' },
      });
    }

    const metadata = device.metadata || {};
    metadata.imageUrl = result.url;
    metadata.imagePublicId = result.publicId;
    await device.update({ metadata });

    // Clean up temp file
    const fs = await import('fs');
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        format: result.format,
      },
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    logger.error('Upload failed:', error.message);
    next(error);
  }
};

export const uploadDeviceVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'No file uploaded' },
      });
    }

    const result = await uploadToCloudinary(req.file.path, 'ecoloop/devices/videos', 'video');

    // Update device metadata with video
    const device = await Device.findByPk(req.params.id);
    if (!device || device.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Device not found' },
      });
    }

    const metadata = device.metadata || {};
    metadata.videoUrl = result.url;
    metadata.videoPublicId = result.publicId;
    await device.update({ metadata });

    // Clean up temp file
    const fs = await import('fs');
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        format: result.format,
        duration: result.duration,
      },
      message: 'Video uploaded successfully',
    });
  } catch (error) {
    logger.error('Video upload failed:', error.message);
    next(error);
  }
};

export const uploadPostImage = async (req, res, next) => {
  try {
    const files = req.files?.length ? req.files : req.file ? [req.file] : [];
    if (!files.length) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'No file uploaded' },
      });
    }

    const fs = await import('fs');
    const results = await Promise.all(
      files.map(async (file) => {
        const result = await uploadToCloudinary(file.path, 'ecoloop/posts', 'image');
        fs.unlinkSync(file.path);
        return {
          url: result.url,
          publicId: result.publicId,
          format: result.format,
          width: result.width,
          height: result.height,
        };
      })
    );

    res.json({
      success: true,
      data: results,
      message: `${results.length} image(s) uploaded successfully`,
    });
  } catch (error) {
    logger.error('Post image upload failed:', error.message);
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'No file uploaded' },
      });
    }

    const result = await uploadToCloudinary(req.file.path, 'ecoloop/avatars', 'image');

    // Update user avatar
    await req.user.update({ avatar: result.url });

    // Clean up temp file
    const fs = await import('fs');
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
      },
      message: 'Avatar uploaded successfully',
    });
  } catch (error) {
    logger.error('Avatar upload failed:', error.message);
    next(error);
  }
};
