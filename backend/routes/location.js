const express = require("express");
const router = express.Router();
const {
  getAllLocations,
  createLocation,
} = require("../controllers/location.controller");
const multer = require("multer");
const path = require("path");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, `location-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

router.get("/", getAllLocations);
router.post("/", upload.single("image"), createLocation);

module.exports = router;