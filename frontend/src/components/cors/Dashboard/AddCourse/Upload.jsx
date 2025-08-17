import { useState } from "react"
import { toast } from "react-hot-toast"
import { FiUpload } from "react-icons/fi"

export default function Upload({
    name,
    label,
    register,
    setValue,
    errors,
    editData = null,
    trigger,
    onImageUpload,
}) {
    const [previewSource, setPreviewSource] = useState(
        editData ? editData : ""
    )

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        console.log("File selected:", file)
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size should be less than 10MB")
                return
            }

            // Check file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
                toast.error("Please select a valid image file (JPG, PNG, WEBP)")
                return
            }

            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = () => {
                setPreviewSource(reader.result)
                // Set the file in the form and trigger validation
                setValue(name, file, { shouldValidate: true })
                trigger(name)
                console.log("File set in form:", file)
                toast.success("Image uploaded successfully!")
            }
            reader.onerror = () => {
                toast.error("Error reading file")
            }
        }
    }

    const onDragOver = (e) => {
        e.preventDefault()
    }

    const onDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        console.log("File dropped:", file)
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size should be less than 10MB")
                return
            }

            // Check file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
                toast.error("Please select a valid image file (JPG, PNG, WEBP)")
                return
            }

            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = () => {
                setPreviewSource(reader.result)
                // Set the file in the form and trigger validation
                setValue(name, file, { shouldValidate: true })
                trigger(name)
                console.log("File set in form:", file)
                toast.success("Image uploaded successfully!")
            }
            reader.onerror = () => {
                toast.error("Error reading file")
            }
        }
    }

    return (
        <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor={name}>
                {label} <sup className="text-pink-200">*</sup>
            </label>
            <div
                className="flex min-h-[250px] cursor-pointer items-center justify-center rounded-md border-2 border-dotted border-richblack-500"
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => document.getElementById(name).click()}
            >
                {previewSource ? (
                    <div className="flex w-full flex-col p-6">
                        <img
                            src={previewSource}
                            alt="Preview"
                            className="h-full w-full rounded-md object-cover"
                        />
                    </div>
                ) : (
                    <div className="flex w-full flex-col items-center p-6">
                        <FiUpload className="text-4xl text-richblack-500" />
                        <p className="mt-2 text-sm text-richblack-400">
                            Drag and drop an image, or click to{" "}
                            <span className="font-semibold text-yellow-50">Browse</span> a
                            file
                        </p>
                        <p className="text-xs text-richblack-400">
                            (Supports: JPG, PNG, WEBP - Max 10MB)
                        </p>
                    </div>
                )}
                <input
                    type="file"
                    id={name}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
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