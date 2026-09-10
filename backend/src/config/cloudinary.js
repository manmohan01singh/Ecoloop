import { v2 as cloudinary } from 'cloudinary';
import config from './env.js';
import logger from '../utils/logger.js';

cloudinary.config({
  cloud_name: config.cloudinary?.cloudName,
  api_key: config.cloudinary?.apiKey,
  api_secret: config.cloudinary?.apiSecret,
});

export const uploadToCloudinary = async (file, folder = 'ecoloop', resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: resourceType,
      overwrite: true,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    logger.error('Cloudinary upload failed:', error.message);
    throw new Error('File upload failed');
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    logger.error('Cloudinary delete failed:', error.message);
    return false;
  }
};

export default cloudinary;
