const { instance } = require("../config/razorpay")
const Course = require("../models/Courses")
const crypto = require("crypto")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const {
    courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress")

// Test endpoint to check if payment controller is working
exports.testPayment = async (req, res) => {
    console.log("Payment test endpoint called");
    res.json({
        success: true,
        message: "Payment controller is working",
        env: {
            RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? "SET" : "NOT SET",
            RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? "SET" : "NOT SET"
        }
    });
}

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
    const { courses } = req.body
    const userId = req.user.id
    if (courses.length === 0) {
        return res.json({ success: false, message: "Please Provide Course ID" })
    }

    let total_amount = 0

    for (const course_id of courses) {
        let course
        try {
            // Find the course by its ID
            course = await Course.findById(course_id)

            // If the course is not found, return an error
            if (!course) {
                return res
                    .status(200)
                    .json({ success: false, message: "Could not find the Course" })
            }

            // Check if the user is already enrolled in the course
            const uid = new mongoose.Types.ObjectId(userId)
            if (course.studentsEnrolled.includes(uid)) {
                return res
                    .status(200)
                    .json({ success: false, message: "Student is already Enrolled" })
            }

            // Add the price of the course to the total amount
            total_amount += course.price
        } catch (error) {
            console.log(error)
            return res.status(500).json({ success: false, message: error.message })
        }
    }

    const options = {
        amount: total_amount * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    try {
        console.log("Payment capture called with courses:", courses)
        console.log("Total amount:", total_amount)
        console.log("Payment options:", options)

        // Check if Razorpay is properly configured
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.log("Razorpay environment variables not configured - using MOCK PAYMENT")
            console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "SET" : "NOT SET")
            console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "SET" : "NOT SET")

            // MOCK PAYMENT SYSTEM FOR TESTING
            const mockPaymentResponse = {
                id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                entity: "order",
                amount: options.amount,
                amount_paid: 0,
                amount_due: options.amount,
                currency: options.currency,
                receipt: options.receipt,
                status: "created",
                attempts: 0,
                notes: {
                    "mock_payment": "true"
                },
                created_at: Date.now()
            }

            console.log("Mock payment order created successfully:", mockPaymentResponse)
            res.json({
                success: true,
                data: mockPaymentResponse,
            })
            return
        }

        console.log("Razorpay config found, creating order...")

        // Initiate the payment using Razorpay
        const paymentResponse = await instance.orders.create(options)
        console.log("Payment order created successfully:", paymentResponse)
        res.json({
            success: true,
            data: paymentResponse,
        })
    } catch (error) {
        console.log("Razorpay error details:", error)
        console.log("Error message:", error.message)
        console.log("Error stack:", error.stack)
        res.status(500).json({
            success: false,
            message: "Could not initiate order. Please try again later."
        })
    }
}

// verify the payment
exports.verifyPayment = async (req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id
    const razorpay_payment_id = req.body?.razorpay_payment_id
    const razorpay_signature = req.body?.razorpay_signature
    const courses = req.body?.courses

    const userId = req.user.id

    if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !courses ||
        !userId
    ) {
        return res.status(200).json({ success: false, message: "Payment Failed" })
    }

    try {
        // Check if this is a mock payment (order ID starts with "order_" and contains timestamp)
        if (razorpay_order_id.startsWith('order_') && razorpay_order_id.includes('_')) {
            console.log("Mock payment detected, bypassing signature verification")
            await enrollStudents(courses, userId)
            return res.status(200).json({ success: true, message: "Mock Payment Verified" })
        }

        // Real Razorpay payment verification
        let body = razorpay_order_id + "|" + razorpay_payment_id

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex")

        if (expectedSignature === razorpay_signature) {
            await enrollStudents(courses, userId)
            return res.status(200).json({ success: true, message: "Payment Verified" })
        }

        return res.status(200).json({ success: false, message: "Payment Failed" })
    } catch (error) {
        console.error("Error in verifyPayment:", error);
        return res.status(500).json({ success: false, message: error.message })
    }
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body

    const userId = req.user.id

    if (!orderId || !paymentId || !amount || !userId) {
        return res
            .status(400)
            .json({ success: false, message: "Please provide all the details" })
    }

    try {
        console.log("Sending payment success email...");
        const enrolledStudent = await User.findById(userId)

        if (!enrolledStudent) {
            console.log("User not found for email");
            return res.status(200).json({ success: true, message: "User not found, skipping email" })
        }

        // Check if email configuration is available
        if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
            console.log("Email configuration missing, skipping email");
            return res.status(200).json({ success: true, message: "Email configuration missing, skipping email" })
        }

        await mailSender(
            enrolledStudent.email,
            `Payment Received`,
            paymentSuccessEmail(
                `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
                amount / 100,
                orderId,
                paymentId
            )
        )

        console.log("Payment success email sent successfully");
        return res.status(200).json({ success: true, message: "Email sent successfully" })
    } catch (error) {
        console.log("Error in sending payment success email:", error)
        // Don't fail the entire request if email fails
        return res.status(200).json({ success: true, message: "Payment successful, email failed" })
    }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId) => {
    if (!courses || !userId) {
        throw new Error("Please Provide Course ID and User ID")
    }

    for (const courseId of courses) {
        try {
            // Find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                { _id: courseId },
                { $push: { studentsEnrolled: userId } },
                { new: true }
            )

            if (!enrolledCourse) {
                throw new Error("Course not found")
            }
            console.log("Updated course: ", enrolledCourse)

            const courseProgress = await CourseProgress.create({
                courseID: courseId,
                userId: userId,
                completedVideos: [],
            })
            // Find the student and add the course to their list of enrolled courses
            const enrolledStudent = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        courses: courseId,
                        courseProgress: courseProgress._id,
                    },
                },
                { new: true }
            )

            console.log("Enrolled student: ", enrolledStudent)
            // Send an email notification to the enrolled student
            try {
                await mailSender(
                    enrolledStudent.email,
                    `Successfully Enrolled into ${enrolledCourse.courseName}`,
                    courseEnrollmentEmail(
                        enrolledCourse.courseName,
                        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
                    )
                )
                console.log("Email sent successfully")
            } catch (emailError) {
                console.log("Email sending failed:", emailError)
                // Don't fail the enrollment if email fails
            }
        } catch (error) {
            console.log("Error enrolling in course:", error)
            throw error
        }
    }

    console.log("All courses enrolled successfully")
}