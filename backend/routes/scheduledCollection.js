const express = require("express");
const router = express.Router();
const {
  addScheduledCollection,
  getRemainders,
  getPendingRequests,
  assignCollector,
  updateStatus,
  getUserHistory,
  getAssignedCollections,
  getTaskById,
  getCollectorHistory,
  deletePendingTask,
  getGarbageCollectors
} = require("../controllers/scheduledCollection");
const authMiddleware = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminAuth");

// User routes
router.post("/", authMiddleware, addScheduledCollection);
router.get("/reminders", authMiddleware, getRemainders);
router.get("/history", authMiddleware, getUserHistory);
router.delete("/:id", authMiddleware, deletePendingTask);

// Admin routes
router.get("/pending", authMiddleware, adminAuth, getPendingRequests);
router.get("/collectors", authMiddleware, adminAuth, getGarbageCollectors);
router.post("/assign", authMiddleware, adminAuth, assignCollector);

// Collector routes
router.get("/assigned", authMiddleware, getAssignedCollections);
router.get("/collector-history", authMiddleware, getCollectorHistory);
router.get("/task/:id", authMiddleware, getTaskById);
router.put("/status/:id", authMiddleware, updateStatus);

module.exports = router;
