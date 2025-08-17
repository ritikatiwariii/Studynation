const Profile = require("../models/Profile");
const { uploadImageToCloudinary } = require("../utils/imageUploder")
const { convertSecondsToDuration } = require("../utils/secToDuration")
const CourseProgress = require("../models/CourseProgress")
const Course = require("../models/Courses")
const User = require("../models/User");
exports.updateProfile = async (req, res) => {
  try {
    const { dateOfBirth = "", about = "", contactNumber } = req.body
    const id = req.user.id;
    console.log("updateProfile: req.user.id =", id);

    // Check if user exists
    const UserDetails = await User.findById(id);
    if (!UserDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("UserDetails.additionalDetails =", UserDetails.additionalDetails);
    const profileId = UserDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);
    console.log("profileDetails =", profileDetails);
    if (!profileDetails) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    // update the profile (NO gender)
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();

    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully!!"
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong Please Try Again Later!!"
    });
  }
}
//deleteaccount
exports.deleteAccount = async (req, res) => {
  try {
    //get id
    const id = req.user.id;
    console.log(id)
    //validate user
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User Not Found!!"
      })
    }
    //delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    //delete user
    await User.findByIdAndDelete(id);
    //return response
    return res.status(200).json({
      success: true,
      message: "Account Deleted Successfully!!"
    })
    //
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong Please Try Again Later!!"
    })
  }
}
//get userdetails
exports.getAllUserDetails = async (req, res) => {
  try {
    //get id
    const id = req.user.id;
    console.log(id)
    //validate user
    const userDetails = await User.findById(id).populate("additionalDetails").exec();
    //return response
    return res.status(200).json({
      success: true,
      data: userDetails,
      message: "User Details Fetched Successfully!!"
    })
  } catch (err) {
    return res.status(500).json({
      success: false,

      message: "Something Went Wrong Please Try Again Later!!"
    })
  }
}
exports.updateDisplayPicture = async (req, res) => {
  console.log("updateDisplayPicture: req.files.displayPicture =", req.files.displayPicture);
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    console.log("Getting enrolled courses for user:", req.user.id);

    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userId}`,
      })
    }

    userDetails = userDetails.toObject()

    // Check if user has courses
    if (!userDetails.courses || userDetails.courses.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      })
    }

    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0

      // Check if course has content
      if (userDetails.courses[i].courseContent && userDetails.courses[i].courseContent.length > 0) {
        for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
          // Check if section has subsections
          if (userDetails.courses[i].courseContent[j].subSection && userDetails.courses[i].courseContent[j].subSection.length > 0) {
            totalDurationInSeconds += userDetails.courses[i].courseContent[
              j
            ].subSection.reduce((acc, curr) => acc + (parseInt(curr.timeDuration) || 0), 0)
            SubsectionLength += userDetails.courses[i].courseContent[j].subSection.length
          }
        }
      }

      userDetails.courses[i].totalDuration = convertSecondsToDuration(
        totalDurationInSeconds
      )

      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos?.length || 0

      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    console.log("Successfully processed enrolled courses");
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    console.error("Error in getEnrolledCourses:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}
