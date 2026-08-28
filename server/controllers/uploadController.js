const cloudinary = require('cloudinary').v2;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadFile = async (req, res) => {
  try {
    const { image, file } = req.body;
    const fileData = image || file;

    if (!fileData) {
      return res.status(400).json({ message: 'No image or file payload provided' });
    }

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

    return res.json({ url: fileData });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: error.message || 'File upload failed' });
  }
};

module.exports = {
  uploadFile,
};
