//we are upload over image in cloudinary
const cloudinary = require("cloudinary").v2;

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    try {
        console.log("File details:", {
            name: file.name,
            size: file.size,
            mimetype: file.mimetype,
            tempFilePath: file.tempFilePath
        });

        const options = { folder };
        if (height) {
            options.height = height;
        }
        if (quality) {
            options.quality = quality;
        }
        options.resource_type = "auto";

        console.log(" Uploading to Cloudinary with options:", options);

        // Add timeout to prevent hanging
        const uploadPromise = cloudinary.uploader.upload(file.tempFilePath, options);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Upload timeout after 60 seconds')), 60000)
        );

        const result = await Promise.race([uploadPromise, timeoutPromise]);
        console.log(" Cloudinary upload completed:", result.secure_url);
        return result;
    } catch (error) {
        console.error(" Cloudinary upload error:", error);
        throw error;
    }
}