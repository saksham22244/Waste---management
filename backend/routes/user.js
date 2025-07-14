const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getAllUsers,
  deleteUser,
  uploadVerification,
  verifyCollector,
  getUnverifiedCollectors,
  sendOTPVerificationEmail,
  forgotPassword,
  verifyResetOtp,
  resetPassword
} = require("../controllers/user.controller");
const UserOPTVerification = require("../models/UserOPTVerification");
const fileUpload = require("express-fileupload");
const authMiddleware = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminAuth");
const User = require("../models/user");
const TempUser = require("../models/TempUser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Configure file upload middleware with size limit of 5MB
const uploadMiddleware = fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  abortOnLimit: true,
  createParentPath: true // Auto-create parent directories
});

// ----------------------
// ✅ Public Routes
// ----------------------
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

// OTP Verification Endpoint (for temp users)
router.post("/verify-otp", async (req, res) => {
  try {
    const { tempUserId, otp } = req.body;

    if (!tempUserId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Temporary user ID and OTP are required."
      });
    }

    const tempUser = await TempUser.findById(tempUserId);
    if (!tempUser) {
      return res.status(400).json({
        success: false,
        message: "Registration session expired or invalid. Please register again."
      });
    }

    const otpRecords = await UserOPTVerification.find({ userId: tempUserId });
    if (otpRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new OTP."
      });
    }

    const { expiresAt, otp: hashedOtp } = otpRecords[0];

    if (expiresAt < Date.now()) {
      await UserOPTVerification.deleteMany({ userId: tempUserId });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP."
      });
    }

    const validOTP = await bcrypt.compare(otp, hashedOtp);
    if (!validOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again."
      });
    }

    const newUser = new User({
      name: tempUser.name,
      email: tempUser.email.toLowerCase(),
      phoneNumber: tempUser.phoneNumber,
      address: tempUser.address,
      password: tempUser.password, // Already hashed from temp user
      role: tempUser.role,
      ...(tempUser.role === "garbageCollector" && {
        vehicleNumber: tempUser.vehicleNumber,
        collectionArea: tempUser.collectionArea,
        licenseNumber: tempUser.licenseNumber,
        isVerified: false
      })
    });

    const savedUser = await newUser.save();

    // Clean up temporary data
    await Promise.all([
      TempUser.deleteOne({ _id: tempUserId }),
      UserOPTVerification.deleteMany({ userId: tempUserId })
    ]);

    const token = jwt.sign(
      { userId: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(201).json({
      success: true,
      message: "Account verified and registered successfully.",
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phoneNumber: savedUser.phoneNumber,
        address: savedUser.address,
        role: savedUser.role,
        ...(savedUser.role === "garbageCollector" && {
          isVerified: savedUser.isVerified
        })
      }
    });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during OTP verification.",
      error: error.message
    });
  }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { tempUserId, TempUserId, email } = req.body;
    const effectiveTempUserId = tempUserId || TempUserId;

    if (!effectiveTempUserId || !email) {
      return res.status(400).json({
        success: false,
        message: "Temporary user ID and email are required."
      });
    }

    const tempUser = await TempUser.findOne({
      _id: effectiveTempUserId,
      email: email.toLowerCase()
    });

    if (!tempUser) {
      return res.status(404).json({
        success: false,
        message: "Registration session not found. Please start registration again."
      });
    }

    // Delete any existing OTPs and send a new one
    await UserOPTVerification.deleteMany({ userId: effectiveTempUserId });
    await sendOTPVerificationEmail({ _id: effectiveTempUserId, email: tempUser.email });

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully.",
      tempUserId: effectiveTempUserId
    });

  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP.",
      details: error.message
    });
  }
});

// Endpoint for garbage collectors to upload verification without token
router.post("/upload-verification",
  uploadMiddleware, // Handle file upload here
  uploadVerification
);

// ----------------------
// 🔒 Protected Routes
// ----------------------
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ success: false, message: "Error fetching user profile" });
  }
});

router.get("/unverified-collectors", authMiddleware, getUnverifiedCollectors);
router.put("/verify-collector/:userId", authMiddleware, verifyCollector);
router.get("/all", adminAuth, getAllUsers);
router.delete("/:userId", authMiddleware, deleteUser);

// Verify Garbage Collector Route
router.patch('/:userId/verify', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (typeof status !== 'boolean') {
      return res.status(400).json({ success: false, message: "Invalid verification status" });
    }

    // Check if the user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Only allow garbage collectors to be verified
    if (user.role !== 'garbageCollector') {
      return res.status(400).json({ success: false, message: "Only garbage collectors can be verified" });
    }

    // Update the user's verification status
    user.isVerified = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Garbage collector ${status ? 'verified' : 'unverified'} successfully`,
      user
    });

  } catch (err) {
    console.error("Verification Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update verification status" });
  }
});

module.exports = router;