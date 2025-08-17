const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploder");
exports.createSubSection = async (req, res) => {
  try {
    console.log("🚀 Starting subsection creation...");

    //data fetch from req.body
    const { sectionId, title, timeDuration, description } = req.body;
    console.log("📝 Request data:", { sectionId, title, timeDuration, description });

    //fetch files for video
    const video = req.files.videoFile
    console.log("📁 Video file received:", video ? "Yes" : "No");

    //validation
    if (!sectionId || !title || !description || !timeDuration || !video) {
      console.log("❌ Validation failed");
      console.log("Missing fields:", { sectionId: !!sectionId, title: !!title, description: !!description, timeDuration: !!timeDuration, video: !!video });
      return res.status(400).json({
        success: false,
        message: "All Fields Are Required!!"
      })
    }

    // File type validation
    const allowedTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'audio/mpeg', 'audio/mp3', 'audio/wav'];
    if (!allowedTypes.includes(video.mimetype)) {
      console.log("❌ Invalid file type:", video.mimetype);
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Please upload a video or audio file."
      })
    }

    // File size validation (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (video.size > maxSize) {
      console.log("❌ File too large:", video.size);
      return res.status(400).json({
        success: false,
        message: "File too large. Please upload a file smaller than 50MB."
      })
    }

    console.log("☁️ Starting Cloudinary upload...");
    //upload video to cloudinary 
    const uplaodDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
    console.log("✅ Cloudinary upload successful:", uplaodDetails.secure_url);

    console.log("💾 Creating subsection in database...");
    //create subsection
    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uplaodDetails.secure_url
    })
    console.log("✅ Subsection created:", subSectionDetails._id);

    console.log("🔗 Updating section with subsection ID...");
    //insert id of subsection into section
    console.log("Section ID:", sectionId);
    console.log("Subsection ID:", subSectionDetails._id);

    const updateSection = await Section.findByIdAndUpdate(
      { _id: sectionId }, {
      $push: {
        subSection: subSectionDetails._id,
      }
    }, { new: true }
    )

    console.log("✅ Section updated:", updateSection);

    console.log("🔍 Verifying section update...");
    // Verify the section was updated correctly
    const verifySection = await Section.findById(sectionId).populate("subSection");
    console.log("✅ Verified section with populated subsections:", verifySection);

    console.log("📤 Sending response...");
    //return response
    return res.status(200).json({
      success: true,
      message: "Subsection Created Successfully!",
      data: {
        subSectionId: subSectionDetails._id,
        sectionId: sectionId,
        updatedSection: updateSection
      }
    })

  }
  catch (err) {
    console.error("❌ Error in createSubSection:", err);
    console.error("❌ Error stack:", err.stack);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong!",
      error: err.message
    })
  }
}
//delete subsection
exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body
    const subSection = await SubSection.findById(subSectionId)

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      })
    }

    if (title !== undefined) {
      subSection.title = title
    }

    if (description !== undefined) {
      subSection.description = description
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      )
      subSection.videoUrl = uploadDetails.secure_url
      subSection.timeDuration = `${uploadDetails.duration}`
    }

    await subSection.save()

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    console.log("updated section", updatedSection)

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    })
  }
}

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body

    if (!subSectionId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "SubSection ID and Section ID are required"
      });
    }

    // Validate ObjectId format
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(subSectionId) || !mongoose.Types.ObjectId.isValid(sectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found"
      });
    }

    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found"
      });
    }

    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    )

    const deletedSubSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error("Error in deleteSubSection:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
      error: error.message
    })
  }
}