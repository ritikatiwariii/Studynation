const mongoose = require("mongoose");
const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Courses");
//createRating
exports.createRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, rating, review } = req.body;
    //check if user already enrolled in the course
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: {
        $elemMatch: {
          $eq: userId
        }
      }
    });
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "User is not enrolled in the course"
      })
    }
    //check if user already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId
    });
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "User already reviewed the course"
      })
    }
    //create rating and review
    const ratingAndReview = await RatingAndReview.create({
      user: userId,
      course: courseId,
      rating,
      review
    });
    //update course rating and review
    const updatedCourseDetails = await Course.findByIdAndUpdate(courseId, {
      $push: {
        ratingAndReviews: ratingAndReview._id,
      }
    }, { new: true });

    //return response
    return res.status(200).json({
      success: true,
      message: "Rating And Review Created Successfully",
      ratingAndReview
    })


  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error in creating Rating And Review",
      error: err.message
    })
  }
}

//getAverageRating
exports.getAverageRating = async (req, res) => {
  try {
    const courseId = req.body.courseId;
    const averageRating = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId)
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" }
        }
      }
    ]);
    if (averageRating.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No Rating Found",
        averageRating: 0
      })
    }
    return res.status(200).json({
      success: true,
      message: "Average Rating Fetched Successfully",
      averageRating: averageRating[0].averageRating
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error in fetching Average Rating",
      error: err.message
    })
  }
}

//getAllRatingAndReview
exports.getAllRatingAndReview = async (req, res) => {
  try {
    const allRatingAndReview = await RatingAndReview.find({}).sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image"
      }).populate({
        path: "course",
        select: "courseName thumbnail"
      }).limit(10).exec();
    return res.status(200).json({
      success: true,
      message: "All Rating And Review Fetched Successfully",
      data: allRatingAndReview
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error in fetching Rating And Review",
      error: err.message
    })
  }
}

