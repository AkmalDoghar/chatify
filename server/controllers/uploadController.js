const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if credentials exist
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// @desc Upload file/image
// @route POST /api/upload
const uploadFile = async (req, res) => {
  try {
    const { image, file } = req.body; // base64 payload or file stream
    const fileData = image || file;

    if (!fileData) {
      return res.status(400).json({ message: 'No image or file payload provided' });
    }

    // If Cloudinary environment variables are set, upload to Cloudinary
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const result = await cloudinary.uploader.upload(fileData, {
        folder: 'chatify_uploads',
        resource_type: 'auto',
      });
      return res.json({ url: result.secure_url });
    }

    // Fallback for local development when Cloudinary keys aren't configured yet
    // Returns base64 data URI directly
    return res.json({ url: fileData });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: error.message || 'File upload failed' });
  }
};

module.exports = {
  uploadFile,
};
