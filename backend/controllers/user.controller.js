const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const path = require("path");
const TempUser = require("../models/TempUser");
const fs = require("fs");
const { promisify } = require("util");
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const nodemailer = require("nodemailer");
const e = require("express");
const UserOPTVerification = require("../models/UserOPTVerification");
require("dotenv").config();

//nodemailer
let transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "30d";

// Helper functions
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
  } catch (err) {
    throw new Error(`Failed to create directory: ${err.message}`);
  }
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => /^(?=.*[!@#$%^&*(),.?":{}|<>]).{7,}$/.test(password);
const validatePhoneNumber = (phoneNumber) => /^\d{10}$/.test(phoneNumber);

// Helper function to send email notifications
const sendEmailNotification = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email notification error:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

// Registration Controller
async function register(req, res) {
  try {
    let { name, email, phoneNumber, address, password, role, vehicleNumber, collectionArea, licenseNumber } = req.body;

    const requiredFields = ['name', 'email', 'phoneNumber', 'address', 'password', 'role'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, message: "Password must be at least 7 characters with a special character" });
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ success: false, message: "Phone number must be 10 digits" });
    }

    if (role === "garbageCollector" && (!vehicleNumber || !licenseNumber)) {
      return res.status(400).json({ success: false, message: "Vehicle number and license number are required for garbage collectors" });
    }

    email = email.toLowerCase();

    if (role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return res.status(400).json({ success: false, message: "Only one admin is allowed" });
      }
    }

    // Check if user already exists
    const [existingUser, existingTempUser] = await Promise.all([
      User.findOne({ $or: [{ email }, { phoneNumber }] }),
      TempUser.findOne({ $or: [{ email }, { phoneNumber }] })
    ]);

    if (existingUser || existingTempUser) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number already exists"
      });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create temp user with isVerified: false for garbageCollector
    const tempUser = new TempUser({
      name,
      email,
      phoneNumber,
      address,
      password: hashedPassword,
      role,
      isVerified: role === "garbageCollector" ? false : true, // garbageCollector needs admin approval
      ...(role === "garbageCollector" && {
        vehicleNumber,
        collectionArea,
        licenseNumber
      })
    });

    const savedTempUser = await tempUser.save();

    // Send welcome email based on role
    try {
      const emailSubject = role === "garbageCollector" ?
        "Welcome to GreenCycle Tech - Garbage Collector Registration" :
        "Welcome to GreenCycle Tech - User Registration";

      const emailHtml = `
        <h1>Welcome to GreenCycle Tech!</h1>
        <p>Dear ${name},</p>
        <p>Thank you for registering with GreenCycle Tech.</p>
        ${role === "garbageCollector" ? `
          <p>As a garbage collector, your account is pending admin approval. You will receive another email once your account is approved.</p>
          <p>Please complete your verification by:</p>
          <ul>
            <li>Uploading your verification documents</li>
            <li>Waiting for admin approval</li>
          </ul>
        ` : `
          <p>Your account has been created successfully. You can now:</p>
          <ul>
            <li>Schedule waste collection requests</li>
            <li>Track your collection status</li>
            <li>View your collection history</li>
          </ul>
        `}
        <p>Please verify your email address using the OTP that has been sent separately.</p>
        <p>Thank you for choosing GreenCycle Tech!</p>
      `;

      await sendEmailNotification(email, emailSubject, emailHtml);
      console.log("Welcome email sent successfully to:", email);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Continue with registration even if email fails
    }

    // Send OTP
    await sendOTPVerificationEmail(savedTempUser);

    return res.status(200).json({
      success: true,
      message: "OTP sent to email. Please verify to complete registration.",
      tempUserId: savedTempUser._id
    });

  } catch (err) {
    console.error("Registration Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error during registration" });
  }
}

// OTP Sender
const sendOTPVerificationEmail = async ({ _id, email }) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      html: `<p>Your OTP for verification is: <strong>${otp}</strong></p><br><p>Note: This OTP is valid for 5 minutes.</p>`
    };

    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

    const newOtpVerification = new UserOPTVerification({
      userId: _id,
      otp: hashedOtp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      purpose: 'registration'
    });

    await newOtpVerification.save();
    await transporter.sendMail(mailOptions);

    return { status: "PENDING", userId: _id, email };
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

// Login Controller
async function login(req, res) {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    email = email.toLowerCase();
    const user = await User.findOne({ email });

    console.log("Fetched user during login:", user);

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.role === 'garbageCollector' && !user.isVerified) {
      return res.status(403).json({ success: false, message: "Account pending admin approval. Please wait." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
        ...(user.role === "garbageCollector" && {
          isVerified: user.isVerified
        })
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error during login" });
  }
}


// Upload verification image (Step 3)
async function uploadVerification(req, res) {
  try {
    const uploadDir = path.join(__dirname, '../uploads/verification');
    await ensureDirectoryExists(uploadDir);

    if (!req.files?.verificationImage) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    const { verificationImage } = req.files;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    if (!ALLOWED_FILE_TYPES.includes(verificationImage.mimetype)) {
      return res.status(400).json({ success: false, message: "Only JPEG/JPG/PNG images allowed" });
    }

    if (verificationImage.size > MAX_FILE_SIZE) {
      return res.status(400).json({ success: false, message: "Image size exceeds 5MB limit" });
    }

    const fileExt = path.extname(verificationImage.name);
    const fileName = `verification_${userId}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, verificationImage.data);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { verificationImage: `/uploads/verification/${fileName}` },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      await unlink(filePath);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Verification image uploaded successfully",
      user: updatedUser
    });

  } catch (err) {
    console.error("Image Upload Error:", err);
    return res.status(500).json({ success: false, message: "Failed to upload verification image" });
  }
}

// Verify collector
async function verifyCollector(req, res) {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (typeof status !== 'boolean') {
      return res.status(400).json({ success: false, message: "Invalid verification status" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified: status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== 'garbageCollector') {
      return res.status(400).json({ success: false, message: "Only garbage collectors can be verified" });
    }

    // Send email notification to the garbage collector
    try {
      const emailSubject = status ? "Account Approved" : "Account Unverified";
      const emailHtml = `
        <h1>${status ? "Your account has been approved!" : "Your account has been unverified"}</h1>
        <p>Dear ${user.name},</p>
        <p>${status ?
          "Your garbage collector account has been approved by the admin. You can now log in and start accepting collection requests." :
          "Your garbage collector account has been unverified. Please contact the admin for more information."}</p>
        ${status ? `
          <p>You can now:</p>
          <ul>
            <li>Log in to your account</li>
            <li>View and accept collection requests</li>
            <li>Update your availability</li>
            <li>Track your collections</li>
          </ul>
        ` : ""}
        <p>Thank you for your cooperation.</p>
      `;

      await sendEmailNotification(user.email, emailSubject, emailHtml);
      console.log("Verification email sent successfully to:", user.email);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Continue with the response even if email sending fails
    }

    console.log("User after verification:", user);
    return res.status(200).json({
      success: true,
      message: `Garbage collector ${status ? 'verified' : 'unverified'} successfully`,
      user
    });

  } catch (err) {
    console.error("Verification Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update verification status" });
  }
}

// Get all users
async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error("Get Users Error:", err);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
}

// Get unverified garbage collectors
async function getUnverifiedCollectors(req, res) {
  try {
    const collectors = await User.find({ role: 'garbageCollector', isVerified: false }).select("-password");
    res.status(200).json({ success: true, data: collectors });
  } catch (err) {
    console.error("Get Unverified Collectors Error:", err);
    res.status(500).json({ success: false, message: "Error fetching unverified collectors" });
  }
}

// Delete user
async function deleteUser(req, res) {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete verification image if it exists
    if (user.verificationImage) {
      const imagePath = path.join(__dirname, "..", user.verificationImage);
      try {
        await unlink(imagePath);
      } catch (err) {
        console.warn("Could not delete verification image:", err.message);
      }
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (err) {
    console.error("Delete User Error:", err);
    return res.status(500).json({ success: false, message: "Error deleting user" });
  }
}

// Forgot Password - Send OTP
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate and send OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp.toString(), saltRounds);

    // Save OTP with password reset purpose
    await UserOPTVerification.findOneAndUpdate(
      { userId: user._id, purpose: 'password_reset' },
      {
        otp: hashedOtp,
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000,// 5 minutes
        purpose: 'password_reset'
      },
      { upsert: true, new: true }
    );

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your password reset OTP is: <strong>${otp}</strong></p>
             <p>This OTP will expire in 5 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email"
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Error processing request" });
  }
}

// Verify Reset OTP
async function verifyResetOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otpRecord = await UserOPTVerification.findOne({
      userId: user._id,
      purpose: 'password_reset'
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "No OTP found" });
    }

    if (otpRecord.expiresAt < Date.now()) {
      await otpRecord.deleteOne();
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.error("Verify Reset OTP Error:", error);
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
}

// Reset Password
async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify OTP again for security
    const otpRecord = await UserOPTVerification.findOne({
      userId: user._id,
      purpose: 'password_reset'
    });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP verification required" });
    }
    const isValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isValid || otpRecord.expiresAt < Date.now()) {
      await otpRecord.deleteOne();
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Log the old password hash for debugging
    console.log("Old Password Hash:", user.password);

    // Update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;

    // Log the new password hash for debugging
    console.log("New Password :", user.password);

    // Save the updated user document
    console.log("Attempting to save user...");
    await user.save({ validateBeforeSave: false }); // Skip pre-save hooks
    console.log("User saved successfully");

    // Delete OTP record
    await otpRecord.deleteOne();

    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Error resetting password" });
  }
}

// Export controllers
module.exports = {
  register,
  login,
  uploadVerification,
  verifyCollector,
  getAllUsers,
  getUnverifiedCollectors,
  deleteUser,
  sendOTPVerificationEmail,
  forgotPassword,
  verifyResetOtp,
  resetPassword
};