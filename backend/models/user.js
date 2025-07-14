const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phoneNumber: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["User", "garbageCollector", "admin"],
    required: true,
  },
  // Garbage collector specific fields
  vehicleNumber: { type: String },
  licenseNumber: { type: String },
  verificationImage: { type: String }, // Path to the uploaded image
  isVerified: { type: Boolean, default: false }, // Admin verification status
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//   }
//   next();
// });

// Compare password method
// userSchema.methods.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

userSchema.methods.comparePassword = async function (password) {
  console.log("Stored Password Hash:", this.password);
  console.log("Provided Plain Password:", password);
  const isMatch = await bcrypt.compare(password, this.password);
  console.log("Password Match Result:", isMatch);
  return isMatch;
};
const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
