const express = require('express');
const app = express();
const userRoutes = require("./routes/User")
const paymentRoutes = require("./routes/Payments")
const coursRoutes = require("./routes/Course")
const profileRoutes = require("./routes/Profile")

const database = require("./config/database")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const { cloudinaryConnect } = require("./config/cloudinary")
const fileUpload = require("express-fileupload")
const dotenv = require("dotenv")
const PORT = process.env.PORT || 4000
dotenv.config();
//database connection

database.connect();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))



app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    abortOnLimit: true,
    createParentPath: true
}))
//cloudinary connection
cloudinaryConnect();
//routes
app.use("/api/v1/auth", userRoutes)
app.use("/api/v1/profile", profileRoutes)
app.use("/api/v1/course", coursRoutes)
app.use("/api/v1/payment", paymentRoutes)

//default route
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Your server is ready"
    })
})

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`)
})
module.exports = app;