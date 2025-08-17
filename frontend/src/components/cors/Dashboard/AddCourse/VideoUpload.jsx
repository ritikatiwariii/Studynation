import { useState } from "react"
import { toast } from "react-hot-toast"
import { FiUpload, FiPlay } from "react-icons/fi"

export default function VideoUpload({
    name,
    label,
    register,
    setValue,
    errors,
    editData = null,
    trigger,
}) {
    const [previewSource, setPreviewSource] = useState(
        editData ? editData : ""
    )

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        console.log("Video file selected:", file)
        if (file) {
            // Check file size (max 100MB for videos)
            if (file.size > 100 * 1024 * 1024) {
                toast.error("Video file size should be less than 100MB")
                return
            }

            // Check file type for videos
            const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
            if (!allowedTypes.includes(file.type)) {
                toast.error("Please select a valid video file (MP4, WebM, OGG, AVI, MOV)")
                return
            }

            // Create a preview URL for the video
            const videoURL = URL.createObjectURL(file)
            setPreviewSource(videoURL)

            // Set the file in the form and trigger validation
            setValue(name, file, { shouldValidate: true })
            if (trigger) trigger(name)
            console.log("Video file set in form:", file)
            toast.success("Video uploaded successfully!")
        }
    }

    const onDragOver = (e) => {
        e.preventDefault()
    }

    const onDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        console.log("Video file dropped:", file)
        if (file) {
            // Check file size (max 100MB for videos)
            if (file.size > 100 * 1024 * 1024) {
                toast.error("Video file size should be less than 100MB")
                return
            }

            // Check file type for videos
            const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
            if (!allowedTypes.includes(file.type)) {
                toast.error("Please select a valid video file (MP4, WebM, OGG, AVI, MOV)")
                return
            }

            // Create a preview URL for the video
            const videoURL = URL.createObjectURL(file)
            setPreviewSource(videoURL)

            // Set the file in the form and trigger validation
            setValue(name, file, { shouldValidate: true })
            if (trigger) trigger(name)
            console.log("Video file set in form:", file)
            toast.success("Video uploaded successfully!")
        }
    }

    return (
        <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor={name}>
                {label} <sup className="text-pink-200">*</sup>
            </label>
            <div
                className="flex min-h-[200px] cursor-pointer items-center justify-center rounded-md border-2 border-dotted border-richblack-500"
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => document.getElementById(name).click()}
            >
                {previewSource ? (
                    <div className="flex w-full flex-col p-6">
                        <video
                            src={previewSource}
                            controls
                            className="h-auto max-h-[300px] w-full rounded-md object-contain"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                ) : (
                    <div className="flex w-full flex-col items-center p-6">
                        <FiPlay className="text-4xl text-richblack-500" />
                        <p className="mt-2 text-sm text-richblack-400">
                            Drag and drop a video, or click to{" "}
                            <span className="font-semibold text-yellow-50">Browse</span> a
                            file
                        </p>
                        <p className="text-xs text-richblack-400">
                            (Supports: MP4, WebM, OGG, AVI, MOV - Max 100MB)
                        </p>
                    </div>
                )}
                <input
                    type="file"
                    id={name}
                    accept="video/mp4,video/webm,video/ogg,video/avi,video/mov"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            {errors[name] && (
                <span className="ml-2 text-xs tracking-wide text-pink-200">
                    {label} is required
                </span>
            )}
        </div>
    )
} 