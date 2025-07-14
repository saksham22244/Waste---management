const mongoose = require('mongoose');

const TempUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["User", "garbageCollector", "admin"],
        required: true
    },
    vehicleNumber: { type: String },
    licenseNumber: { type: String },
    createdAt: { type: Date, default: Date.now, expires: '1h' } // Auto-delete after 1 hour
});

module.exports = mongoose.model('TempUser', TempUserSchema);