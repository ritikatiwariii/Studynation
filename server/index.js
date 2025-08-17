const express = require('express');
const app = express();
const userRoutes = require("./routes/User");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const profileRoutes = require("./routes/Profile");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 4000;

// Database connection
database.connect();

// CORS setup for local and deployed frontend
const allowedOrigins = [
    "http://localhost:3000",
    "https://studynation-frontend2.onrender.com"
];

app.use(cors({
    origin: function(origin, callback){
        // allow requests with no origin like mobile apps or curl requests
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    abortOnLimit: true,
    createParentPath: true
}));

// Cloudinary connection
cloudinaryConnect();

// Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

// Default route
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Your server is ready"
    });
});

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});

module.exports = app;
