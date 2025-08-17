const Section = require("../models/Section");
const Course = require("../models/Courses");
exports.createSection = async (req, res) => {
    try {
        //data fetch
        const { sectionName, courseId } = req.body;
        //data validation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "MissingDetials All Fileds Are Required!!"
            })
        }
        //create section
        const newSection = await Section.create({
            sectionName
        });

        //insert the section object id into courses 
        await Course.findByIdAndUpdate(courseId, {
            $push: {
                courseContent: newSection._id,
            }
        }, { new: true });

        //get the updated course with populated sections
        const updatedCourseDetails = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        //use populate to replace sectionid ans subsection 
        //return response
        return res.status(200).json({
            success: true,
            message: "Section Created Successfully!!",
            updatedCourseDetails,
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something gone wrong while making the section!! Please Try Again Later",
            error: error.message
        })
    }
}
//update section
exports.updateSection = async (req, res) => {
    try {
        //data input
        const { sectionName, sectionId, courseId } = req.body;
        //data validation
        if (!sectionName || !sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "MissingDetials All Fileds Are Required!!"
            })
        }

        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {
            sectionName
        }, { new: true });

        //get the updated course with populated sections
        const updatedCourseDetails = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        //return response
        return res.status(200).json({
            success: true,
            message: "Section Updated Successfully!!",
            updatedCourseDetails,
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something gone wrong while making the section!! Please Try Again Later",
            error: error.message
        })

    }
}
//remove the section
exports.deleteSection = async (req, res) => {
    try {
        // console.log("🗑️ deleteSection called with body:", req.body);
        // console.log("👤 User:", req.user);

        //data fetch by id from request body
        const { sectionId } = req.body;

        // console.log("📋 Section ID received:", sectionId);

        //data validation
        if (!sectionId) {
            // console.log("❌ Section ID is missing");
            return res.status(400).json({
                success: false,
                message: "Section ID is required"
            })
        }

        console.log("🔍 Looking for section with ID:", sectionId);

        //findbyid anddelete
        const deletedSection = await Section.findByIdAndDelete(sectionId);

        console.log("🗑️ Deletion result:", deletedSection);

        if (!deletedSection) {
            // console.log("❌ Section not found in database");
            return res.status(404).json({
                success: false,
                message: "Section not found"
            })
        }

        console.log("🧹 Cleaning up course references...");
        // Remove the section from all courses that contain it
        const courseUpdateResult = await Course.updateMany(
            { courseContent: sectionId },
            { $pull: { courseContent: sectionId } }
        );
        // console.log("📊 Course update result:", courseUpdateResult);

        // Get the updated course with populated sections (assuming we need courseId)
        const { courseId } = req.body;
        if (courseId) {
            const updatedCourseDetails = await Course.findById(courseId)
                .populate({
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                    },
                })
                .exec();

            // console.log("✅ Section deleted successfully");
            return res.status(200).json({
                success: true,
                message: "Section Deleted Successfully!!",
                updatedCourseDetails,
            })
        } else {
            // console.log("✅ Section deleted successfully");
            return res.status(200).json({
                success: true,
                message: "Section Deleted Successfully!!"
            })
        }
    }
    catch (err) {
        console.error("Error deleting section:", err);
        return res.status(500).json({
            success: false,
            message: "Something Went Wrong While Deleting"
        })

    }
}