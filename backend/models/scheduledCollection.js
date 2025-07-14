const mongoose = require("mongoose");

const scheduledCollectionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  location: { type: String, required: true },
  wasteType: { 
    type: String, 
    enum: ["Recyclable", "Hazardous", "Organic"],
    default: "Recyclable"
  },
  notes: { type: String },
  status: {
    type: String,
    enum: ["Pending", "Assigned", "Not Arrived", "On the Way", "Picked Up", "Cancelled"],
    default: "Pending"
  },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String, required: true },
  clientAddress: { type: String, required: true },
  actualPickupTime: { type: Date },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual for time until pickup
scheduledCollectionSchema.virtual('timeUntilPickup').get(function() {
  return this.date - new Date();
});

// Add index for better query performance
scheduledCollectionSchema.index({ date: 1, status: 1 });
scheduledCollectionSchema.index({ collectorId: 1, status: 1 });

module.exports = mongoose.model("ScheduledCollection", scheduledCollectionSchema);