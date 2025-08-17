const razorpay = require("razorpay");

console.log("Initializing Razorpay...");
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "SET" : "NOT SET");
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "SET" : "NOT SET");

exports.instance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log("Razorpay instance created");