//signup//login//changepass//sendotp
const User = require("../models/User");
const OTP = require("../models/Otp");
const Profile = require("../models/Profile")
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mailSender = require("../utils/mailSender");
require("dotenv").config();
//senotp


const otpTemplate = require("../mail/templates/emailVerificationTemplate");  // adjust path


exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user is already registered
        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: `User is Already Registered`,
            });
        }

        // // Delete any existing OTPs for this email
        // await OTP.deleteMany({ email });
        // console.log('🗑️ Deleted existing OTPs for email:', email);

        // Generate unique OTP
        let otp;
        let result;
        do {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp });
        } while (result);

        // Save OTP to DB
        const otpPayload = { email, otp };
        console.log(' Saving OTP to database:', otpPayload);
        const otpBody = await OTP.create(otpPayload);
        console.log(" OTP saved to database:", otpBody);

        // Verify OTP was saved by fetching it
        const verifyOtp = await OTP.findById(otpBody._id);
        console.log("🔍 Verification - OTP found in DB:", verifyOtp ? "YES" : "NO");

        // ✅ Use your custom HTML email template
        const htmlBody = otpTemplate(otp);

        // ✅ Call mailSender with correct order
        await mailSender(email, "OTP Verification Email", htmlBody);

        // Send success response
        res.status(200).json({
            success: true,
            message: `OTP Sent Successfully`,
        });
    } catch (error) {
        console.log("❌ sendOtp error:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};



//signup functionality
exports.signup = async (req, res) => {
    console.log('🔄 Signup function called for email:', req.body.email);
    //take the important thing from the req body
    try {
        const { firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp } = req.body
        //validate the data
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp || !accountType) {
            return res.status(403).json({
                success: false,
                message: "Essential information is missing !Please fill all the details carefully"
            })

        }

        //validate accountType
        const validAccountTypes = ["Student", "Instructor", "Admin"];
        if (!validAccountTypes.includes(accountType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid account type. Must be Student, Instructor, or Admin"
            })
        }
        //match the both password
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "password and ConfirmPasswod  does not match,Please try again"
            })
        }
        //check user already present or not
        const existinguser = await User.findOne({
            email
        })
        //if present sucess false
        if (existinguser) {
            return res.status(400).json({
                success: false,
                message: "User is already registerd !Please Login"
            })

        }
        //find most recent otp
        const recentOtp = await OTP.find({
            email
        }).sort({ createdAt: -1 }).limit(1);
        console.log('🔍 Searching for OTP for email:', email);
        console.log('📊 Found OTPs:', recentOtp.length);
        console.log('recentotp is:', recentOtp);

        //validate otp input and db
        if (recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                message: "OTP Not found"
            })
        }
        //check both the otp
        //💕
        //recentotp which we fetch from db
        else if (otp !== recentOtp[0].otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            })
        }

        //check if OTP is expired (10 minutes)
        const otpCreatedAt = new Date(recentOtp[0].createdAt);
        const currentTime = new Date();
        const timeDifference = (currentTime - otpCreatedAt) / 1000 / 60; // in minutes

        if (timeDifference > 10) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP"
            })
        }
        //otp is matching--->then hash the password
        //hassh the pass
        const hashedpassword = await bcrypt.hash(password, 10);
        //create a profile
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        })

        //create the db
        const user = await User.create({
            firstName,
            lastName,
            password: hashedpassword,
            email,
            accountType,
            additionalDetails: profileDetails,
            image: `https://api.dicebear.com/7.x/bottts/svg?seed=${firstName}`
        })
        console.log('✅ User registered successfully:', user.email);
        return res.status(200).json({
            success: true,
            message: "User is registered Successfully",
            user,
        })
    } catch (err) {
        console.log('error', err);

        return res.status(500).json({
            success: false,
            message: "User can not be registerd !Please try again!! "
        })

    }
}
//login flow
exports.login = async (req, res) => {
    //fetch pass and email from req
    try {
        const { email, password } = req.body;
        //validataion
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please Fill All The Details!"
            })
        }

        //user check kro
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Please Sign Up first"
            })
        }
        ////genrate a JWT token,after pass
        //compare the pass
        if (await bcrypt.compare(password, user.password)) {
            //now you are ready to generate the pass
            const payload = {
                id: user._id,
                email: user.email,
                accountType: user.accountType
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            })
            user.token = token;
            user.password = undefined;

            //create cookie
            const option = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }
            res.cookie("token", token, option).status(200).json({
                success: true,
                token,
                user,
                message: "You Logged In Successfully"
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "Password is incorrect "
            })
        }
        //send res
    } catch (error) {
        console.log('error', error);

        return res.status(500).json({
            success: false,
            message: "LOGIN FAILURE"
        })
    }
    //perfrom a validation
}
//change password
exports.changePassword = async (req, res) => {
    //get data
    try {
        const { email, currentpassword, newpassword, confirmpassword } = req.body;
        //validate user is present or not
        if (!email || !newpassword || !currentpassword || !confirmpassword) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the details!"
            })
        }
        const user = await User.findOne({ email });
        //it means user is present you may change the pass
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User is not registered"
            })
        }
        //validate the pass
        //also check the current pass is correct then only user change the pass
        const ispassmatch = await bcrypt.compare(currentpassword, user.password);
        if (!ispassmatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect!"
            })
        }
        if (newpassword !== confirmpassword) {
            return res.status(401).json({
                success: false,
                message: "New password and confirm password do not match!"
            })
        }
        //hashed the new pass
        const hashedpassword = await bcrypt.hash(newpassword, 10);
        user.password = hashedpassword;
        //save the entry to db
        await user.save();
        //send a mail as successfull change the pass
        await mailSender(
            user.email, 'Password updated successfully', `Hi,\n\nYour password has been updated successfully`
        );
        return res.status(200).json({
            success: true,
            message: "Password Updated Successfully"
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}