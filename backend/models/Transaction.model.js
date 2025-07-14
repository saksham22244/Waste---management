const mongoose = require('mongoose');

// Define the schema
const transactionSchema = new mongoose.Schema({
    product_id: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ["PENDING", "COMPLETE", "FAILED", "REFUNDED"],
        default: 'PENDING'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

transactionSchema.pre("save", function (next) {
    if (this.status) {
        this.status = this.status.toUpperCase(); // Normalize case
    }
    next();
});

// Create and export the model
const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;