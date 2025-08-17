//create a tags
const Category = require("../models/Category");
const Course = require("../models/Courses");
function getRandomInt(max) {
  if (max <= 0) return 0;
  return Math.floor(Math.random() * max)
}
exports.createCategory = async (req, res) => {
  try {
    //fetch the details from tags
    const { name, description } = req.body;
    //perform a validation which is neccessary
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "ALL FIELDS ARE REQUIRED"
      })
    }
    //then create the tags
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    })
    console.log(categoryDetails);
    return res.status(200).json({
      success: true,
      message: "Category is created successfully!"
    })

  } catch (err) {
    console.error("Error creating category:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the category. Please try again later.",
      error: err.message
    })
  }
}
//getall the category
exports.showAllCategory = async (req, res) => {
  try {
    const allCategory = await Category.find({})
      .populate("courses")
      .exec();
    res.status(200).json({
      success: true,
      data: allCategory,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};
//categoryPageDetails
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;
    //get courses for a specific category
    const selectCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec();
    if (!selectCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      })
    }

    console.log("Category found:", selectCategory.name);
    console.log("Published courses in category:", selectCategory.courses.length);
    
    try {
      console.log("Course IDs:", selectCategory.courses.map(c => ({ id: c._id, name: c.courseName, status: c.status })));
    } catch (error) {
      console.log("Error logging course IDs:", error);
    }

    // Also check all courses in the category (regardless of status)
    try {
      const allCoursesInCategory = await Category.findById(categoryId)
        .populate("courses")
        .exec();
      console.log("All courses in category (any status):", allCoursesInCategory.courses.length);
      console.log("All course statuses:", allCoursesInCategory.courses.map(c => ({ id: c._id, name: c.courseName, status: c.status })));
    } catch (error) {
      console.log("Error checking all courses:", error);
    }
    // Handle the case where there are no courses - return empty array instead of error
    if (selectCategory.courses.length === 0) {
      console.log("No courses found for the selected category.");
      // Return success with empty courses instead of 404 error
      return res.status(200).json({
        success: true,
        data: {
          selectCategory: {
            ...selectCategory.toObject(),
            courses: []
          },
          differentCategories: null,
          mostSellingCourses: [],
        },
      });
    }


    //get different categories of courses
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })

    let differentCategories = null;
    if (categoriesExceptSelected.length > 0) {
      try {
        const randomIndex = getRandomInt(categoriesExceptSelected.length);
        differentCategories = await Category.findOne(
          categoriesExceptSelected[randomIndex]._id
        )
          .populate({
            path: "courses",
            match: { status: "Published" },
          })
          .exec();
      } catch (error) {
        console.log("Error getting different categories:", error);
        differentCategories = null;
      }
    }
    //get top rated courses
    let mostSellingCourses = [];
    try {
      const allCategories = await Category.find()
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: {
            path: "instructor",
          },
        })
        .exec();
      const allCourses = allCategories.flatMap((category) => category.courses);
      mostSellingCourses = allCourses
        .sort((a, b) => (b.sold || 0) - (a.sold || 0))
        .slice(0, 10);
    } catch (error) {
      console.log("Error getting most selling courses:", error);
      mostSellingCourses = [];
    }

    return res.status(200).json({
      success: true,
      data: {
        selectCategory,
        differentCategories,
        mostSellingCourses,
      },
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching category page details",
      error: err.message
    })
  }
}   
