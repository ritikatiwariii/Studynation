//forgot pass -->link generate->mail->openui->enter a newpass
const User = require("../models/User");
const bcrypt = require("bcrypt");
const mailSender = require("../utils/mailSender");
const crypto = require("crypto");

exports.resetPasswordToken = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists for this email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Your email is not registered!"
            });
        }

        // Generate a unique token
        const token = crypto.randomUUID();

        // Update user by adding token and expiration time
        await User.findOneAndUpdate(
            { email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000, // <-- use this name
            },
            { new: true }
        );

        // Generate frontend link for password reset
        const url = `http://localhost:3000/update-password/${token}`;

        // Send a mail
        try {
            await mailSender(email, "Password Reset Link", `Password reset link: ${url}`);
            return res.status(200).json({
                success: true,
                message: "Email sent successfully. Please check your email."
            });
        } catch (mailError) {
            console.error("Failed to send email:", mailError);
            return res.status(500).json({
                success: false,
                message: "Failed to send email. Please try again later."
            });
        }
    } catch (err) {
        console.error("resetPasswordToken error:", err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong! Please try again later."
        });
    }
};
//reset the pass
exports.resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;

        if (confirmPassword !== password) {
            return res.json({
                success: false,
                message: "Password and Confirm Password Does not Match",
            });
        }
        const userDetails = await User.findOne({ token: token });
        if (!userDetails) {
            return res.json({
                success: false,
                message: "Token is Invalid",
            });
        }
        if (!(userDetails.resetPasswordExpires > Date.now())) {
            return res.status(403).json({
                success: false,
                message: `Token is Expired, Please Regenerate Your Token`,
            });
        }
        const encryptedPassword = await bcrypt.hash(password, 10);
        await User.findOneAndUpdate(
            { token: token },
            { password: encryptedPassword },
            { new: true }
        );
        res.json({
            success: true,
            message: `Password Reset Successful`,
        });
    } catch (error) {
        return res.json({
            error: error.message,
            success: false,
            message: `Some Error in Updating the Password`,
        });
    }
};