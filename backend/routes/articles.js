const express = require("express");
const router = express.Router();
const {
  createArticle,
  getAllArticles,
  updateArticle,
  deleteArticle,
} = require("../controllers/articles.controller");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Routes
router.post("/", authMiddleware, upload.single("image"), createArticle); // Admin only, image upload
router.get("/", getAllArticles);
router.put("/:articleId", authMiddleware, upload.single("image"), updateArticle); // Admin only, image upload
router.delete("/:articleId", authMiddleware, deleteArticle); // Admin only

module.exports = router;