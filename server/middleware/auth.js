const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

exports.auth = async (req, res, next) => {
  try {
    console.log("🔍 Auth middleware - checking for token...");
    console.log("📋 Headers:", req.headers);
    console.log("🍪 Cookies:", req.cookies);
    console.log("📦 Body:", req.body);

    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    console.log("🔑 Auth header:", authHeader);

    const token = req.cookies.token || req.body.token || (authHeader && authHeader.replace("Bearer ", ""));
    console.log("🎫 Extracted token:", token ? "Found" : "Not found");

    if (!token) {
      // console.log("❌ No token found in any location");
      return res.status(401).json({
        success: false,
        message: "Token is Missing!"
      });
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
      // console.log("🔐 Token verified successfully, user:", req.user);
    } catch (err) {
      console.error("❌ Token verification failed:", err.message);
      return res.status(401).json({
        success: false,
        message: "Invalid Token!"
      });
    }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong!"
    });
  }
};

// isStudent
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route of student only"
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role can not be verify"
    });
  }
};

// isInstructor
exports.isInstructor = async (req, res, next) => {
  try {
    console.log("👨‍🏫 isInstructor middleware - checking user role...");
    console.log("👤 User object:", req.user);
    console.log("🎭 Account type:", req.user.accountType);

    if (req.user.accountType !== "Instructor") {
      console.log("❌ Access denied - user is not an instructor");
      return res.status(401).json({
        success: false,
        message: "This is a protected route of Instructor only"
      });
    }
    console.log("✅ Instructor access granted");
    next();
  } catch (err) {
    console.error("❌ Error in isInstructor middleware:", err);
    return res.status(500).json({
      success: false,
      message: "User role can not be verify"
    });
  }
};

// isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route of Admin only"
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User role can not be verify"
    });
  }
};