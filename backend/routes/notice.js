const express = require("express");
const router = express.Router();
const Notice = require("../models/notice");
const authMiddleware = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminAuth");
const noticeController = require("../controllers/notice.controller");

// Admin routes
router.post("/", adminAuth, noticeController.createNotice);
router.delete("/admin/:id", adminAuth, noticeController.deleteNotice);
router.get("/admin", adminAuth, noticeController.getAllNotices);

// User routes
router.get("/user", authMiddleware, noticeController.getUserNotices);
router.delete("/user/:id", authMiddleware, noticeController.deleteUserNotice);

// Public routes
router.get("/", noticeController.getAllNotices);
router.get("/:category", noticeController.getNoticesByCategory);

module.exports = router;
