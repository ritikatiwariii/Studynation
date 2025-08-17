// Import the required modules
const express = require("express")
const router = express.Router()

// Import the Controllers

// Course Controllers Import
const {
  createCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
} = require("../controller/Course")
// console.log("Course Controllers")
// console.log(createCourse,getAllCourses,getCourseDetails,editCourse,getInstructorCourses,deleteCourse)


// Categories Controllers Import
const {
  showAllCategory,
  createCategory,
  categoryPageDetails,
} = require("../controller/Category")
// console.log("Category Controllers")
// console.log(showAllCategory,createCategory,categoryPageDetails)

// Sections Controllers Import
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controller/section")
// console.log("Section Controllers")
// console.log(createSection,updateSection,deleteSection)

// Sub-Sections Controllers Import
const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controller/Subsection")
// console.log("Sub-Section Controllers")
// console.log(createSubSection,updateSubSection,deleteSubSection)

// Rating Controllers Import
const {
  createRating,
  getAverageRating,
  getAllRatingAndReview,
} = require("../controller/RatingAndReview")
// console.log("Rating Controllers")
// console.log(createRating,getAverageRating,getAllRatingAndReview)

const {
  updateCourseProgress
} = require("../controller/courseProgress");
// console.log("Course Progress Controllers")
// console.log(updateCourseProgress)

// Importing Middlewares
const { auth, isInstructor, isStudent, isAdmin } = require("../middleware/auth")
// console.log(auth,isInstructor,isStudent,isAdmin)
// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse)
//Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection)
// Update a Section
router.post("/updateSection", auth, isInstructor, updateSection)
// Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection)
// Edit Sub Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection)
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection)
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses)
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails)
// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
// Edit Course routes
router.post("/editCourse", auth, isInstructor, editCourse)
// // Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
// Delete a Course
router.delete("/deleteCourse", auth, isInstructor, deleteCourse)

router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategory)
router.post("/getCategoryPageDetails", categoryPageDetails)

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRatingAndReview)

module.exports = router