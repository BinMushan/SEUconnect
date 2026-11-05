const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dtpeeydfz',
  api_key: process.env.CLOUDINARY_API_KEY || '977493353135588',
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET || '',
  secure: true
});

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer
 * @param {Object} options - Upload options (folder, public_id, etc.)
 * @returns {Promise<Object>} Cloudinary upload result containing secure_url
 */
const uploadImageBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET;
    if (!apiSecret) {
      const err = new Error('CLOUDINARY_API_SECRET is missing. Please set CLOUDINARY_API_SECRET in your Backend/.env or Render Environment Variables.');
      err.code = 'CLOUDINARY_SECRET_MISSING';
      return reject(err);
    }

    const uploadOptions = {
      folder: 'seuconnect/profiles',
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      ...options
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    stream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  uploadImageBuffer
};

