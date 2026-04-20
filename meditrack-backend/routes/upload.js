const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { protect } = require('../Middleware/Auth');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789012345',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'abcd1234abcd1234abcd1234'
});

// Configure Multer Storage Engine to stream directly to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'meditrack_prescriptions',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    public_id: (req, file) => `presc_${Date.now()}_${file.originalname.split('.')[0]}`
  },
});

const parser = multer({ storage: storage });

// Upload Endpoint
router.post('/', protect, parser.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }
    
    // req.file.path holds the secure Cloudinary URL
    res.json({
      success: true,
      url: req.file.path,
      message: 'Prescription uploaded successfully'
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ success: false, message: 'Image upload failed. Check connection or Cloudinary keys.' });
  }
});

module.exports = router;
