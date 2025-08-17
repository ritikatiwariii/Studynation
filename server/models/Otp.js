const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 10 * 60
    }
});

// Add index on email for faster queries
otpSchema.index({ email: 1 });

module.exports = mongoose.model("Otp", otpSchema);