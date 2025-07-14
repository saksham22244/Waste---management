const Transaction = require("../models/Transaction.model.js");

// Dynamically import esewajs
const loadEsewaModule = async () => {
    const esewaModule = await import("esewajs");
    return esewaModule;
};

const EsewaInitiatePayment = async (req, res) => {
    const { amount, productId } = req.body; // Data coming from frontend
    try {
        const { EsewaPaymentGateway } = await loadEsewaModule();

        const reqPayment = await EsewaPaymentGateway(
            amount,
            0,
            0,
            0,
            productId,
            process.env.MERCHANT_ID,
            process.env.SECRET,
            process.env.SUCCESS_URL,
            process.env.FAILURE_URL,
            process.env.ESEWAPAYMENT_URL,
            undefined,
            undefined
        );

        if (!reqPayment) {
            return res.status(400).json({ message: "Error sending data" });
        }

        if (reqPayment.status === 200) {
            const transaction = new Transaction({
                product_id: productId,
                amount: amount,
                userId: req.user._id
            });
            await transaction.save();
            console.log("Transaction saved successfully");

            return res.send({
                url: reqPayment.request.res.responseUrl,
            });
        }
    } catch (error) {
        console.error("Error initiating payment:", error.message || error);
        return res.status(400).json({ message: "Error sending data", error: error.message });
    }
};

const paymentStatus = async (req, res) => {
    const { product_id } = req.body; // Extract data from request body
    try {
        // Find the transaction by its product ID
        const transaction = await Transaction.findOne({ product_id });
        if (!transaction) {
            return res.status(400).json({ message: "Transaction not found" });
        }

        // Dynamically import esewajs
        const { EsewaCheckStatus } = await loadEsewaModule();

        // Check payment status
        const paymentStatusCheck = await EsewaCheckStatus(
            transaction.amount,
            transaction.product_id,
            process.env.MERCHANT_ID,
            process.env.ESEWAPAYMENT_STATUS_CHECK_URL
        );

        if (!paymentStatusCheck?.data?.status) {
            return res.status(400).json({ message: "Invalid API response" });
        }
        console.log("API Response Status:", paymentStatusCheck.data.status);

        if (paymentStatusCheck.status === 200) {
            console.log("API Response:", paymentStatusCheck);
            // Normalize the status value to uppercase
            const newStatus = paymentStatusCheck.data.status.toUpperCase();

            // Validate the status value against the allowed enum values
            if (!["PENDING", "COMPLETE", "FAILED", "REFUNDED"].includes(newStatus)) {
                return res.status(400).json({ message: "Invalid transaction status" });
            }

            // Update the transaction status
            transaction.status = newStatus;
            await transaction.save();
            return res.status(200).json({ message: "Transaction status updated successfully" });
        }
    } catch (error) {
        console.error("Error updating transaction status:", error.message || error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const checkUserPaymentStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find the most recent transaction for the user
        const transaction = await Transaction.findOne({ 
            userId,
            status: 'COMPLETE'
        }).sort({ createdAt: -1 });

        if (!transaction) {
            return res.status(200).json({ status: 'PENDING' });
        }

        // Check if the transaction is recent (within last 24 hours)
        const isRecent = (new Date() - transaction.createdAt) < 24 * 60 * 60 * 1000;
        
        return res.status(200).json({ 
            status: isRecent ? 'COMPLETE' : 'PENDING'
        });
    } catch (error) {
        console.error("Error checking payment status:", error);
        return res.status(500).json({ message: "Error checking payment status" });
    }
};

module.exports = { EsewaInitiatePayment, paymentStatus, checkUserPaymentStatus };