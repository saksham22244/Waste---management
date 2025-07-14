const mongoose = require("mongoose");

const userHistorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  wasteType: {
    type: String,
    enum: ["Recyclable", "Hazardous", "Organic"],
    default: "Recyclable"
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  status: {
    type: String,
    default: "Completed"
  },
  description: String,
  actualPickupTime: Date,
  clientName: String,
  clientEmail: String,
  clientPhone: String,
  clientAddress: String,
  collectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  notes: String,
  estimatedTime: String
}, { timestamps: true });

module.exports = mongoose.model("UserHistory", userHistorySchema);