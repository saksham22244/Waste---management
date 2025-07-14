const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require("multer");
const { EsewaInitiatePayment, paymentStatus, checkUserPaymentStatus } = require("./controllers/esewa.controller.js");
const authMiddleware = require("./middleware/authMiddleware");



// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(
  cors({
     origin: ["http://localhost:5173", "https://waste-management-frontend.onrender.com"]
    credentials: true,
  })
);


// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(fileUpload({
//   createParentPath: true,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   abortOnLimit: true,
//   useTempFiles: false,
// }));

// // Ensure upload directory exists
// const uploadDir = path.join(__dirname, "uploads/verification");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// Serve static files
// app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads")); // Save files to the uploads directory
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

const upload = multer({ storage: storage });

//multer
app.post("/upload", upload.single("verificationImage"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Log the uploaded file details
    console.log("Uploaded file:", req.file);

    // Respond with success message and file path
    res.status(200).json({
      message: "File uploaded successfully",
      filePath: req.file.path,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Payment routes
app.post("/initiate-payment", authMiddleware, EsewaInitiatePayment);
app.post("/payment-status", paymentStatus);
app.get("/payment-status", authMiddleware, checkUserPaymentStatus);

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/users", require("./routes/user"));
app.use("/api/articles", require("./routes/articles"));
app.use("/api/notices", require("./routes/notice"));
app.use("/api/scheduled-collection", require("./routes/scheduledCollection"));
app.use("/api/locations", require("./routes/location"));

// Import the contact routes
const contactRoutes = require('./routes/contactRoutes');

// Register the contact routes under the '/contact' path
app.use('/api/contact', contactRoutes)


// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", dbStatus: mongoose.connection.readyState });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
