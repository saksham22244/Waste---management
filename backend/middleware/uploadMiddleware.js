const multer = require('multer');
const path = require('path');

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define the directory where you want to store the files
    const uploadDir = path.join(__dirname, 'uploads/verification');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filenames for each file
    const fileExt = path.extname(file.originalname);
    cb(null, `verification_${Date.now()}${fileExt}`);
  }
});

// Set file filter (optional)
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, or JPG are allowed'), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

module.exports = upload;
