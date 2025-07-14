const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  name: String,
  email: String,
  role: String,
  createdAt: { type: Date, default: Date.now },
});

// Fix: prevent OverwriteModelError
const ContactMessage = mongoose.models.ContactMessage || mongoose.model("ContactMessage", contactMessageSchema);

module.exports = ContactMessage;
