const express = require("express");
const router = express.Router();

const { capturePayment, verifyPayment, sendPaymentSuccessEmail, testPayment } = require("../controller/Payments");
const { auth, isStudent } = require("../middleware/auth");

// Test route to check payment controller
router.get("/test", testPayment);

// Route to initiate/capture payment (Razorpay order)
router.post("/capturePayment", auth, isStudent, capturePayment);

// Route to verify Razorpay payment signature
router.post("/verifyPayment", auth, isStudent, verifyPayment);

// Route to send payment success email
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail);

module.exports = router;
