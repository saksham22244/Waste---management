const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    imageFilename: { type: String, required: true },
    description: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  });

module.exports = mongoose.model("Location", locationSchema);