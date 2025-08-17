import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { RxCross2 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"

import {
    createSubSection,
    updateSubSection,
} from "../../../../../service/operations/courseDetailsAPI"
import { setCourse } from "../../../../../slices/courseSlice"
import IconBtn from "../../../../common/IconBtn"
import VideoUpload from "../VideoUpload"

export default function SubSectionModal({
    modalData,
    setModalData,
    add = false,
    view = false,
    edit = false,
}) {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        getValues,
        trigger,
    } = useForm()

    // console.log("view", view)
    // console.log("edit", edit)
    // console.log("add", add)

    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const { token } = useSelector((state) => state.auth)
    const { course } = useSelector((state) => state.course)

    useEffect(() => {
        if (view || edit) {
            // console.log("modalData", modalData)
            setValue("lectureTitle", modalData.title)
            setValue("lectureDesc", modalData.description)
            setValue("timeDuration", modalData.timeDuration)
            setValue("lectureVideo", modalData.videoUrl)
        }
    }, [])

    // detect whether form is updated or not
    const isFormUpdated = () => {
        const currentValues = getValues()
        // console.log("changes after editing form values:", currentValues)
        if (
            currentValues.lectureTitle !== modalData.title ||
            currentValues.lectureDesc !== modalData.description ||
            currentValues.timeDuration !== modalData.timeDuration ||
            currentValues.lectureVideo !== modalData.videoUrl
        ) {
            return true
        }
        return false
    }

    // handle the editing of subsection
    const handleEditSubsection = async () => {
        const currentValues = getValues()
        // console.log("changes after editing form values:", currentValues)
        const formData = new FormData()
        // console.log("Values After Editing form values:", currentValues)
        formData.append("sectionId", modalData.sectionId)
        formData.append("subSectionId", modalData._id)
        if (currentValues.lectureTitle !== modalData.title) {
            formData.append("title", currentValues.lectureTitle)
        }
        if (currentValues.lectureDesc !== modalData.description) {
            formData.append("description", currentValues.lectureDesc)
        }
        if (currentValues.timeDuration !== modalData.timeDuration) {
            formData.append("timeDuration", currentValues.timeDuration)
        }
        if (currentValues.lectureVideo !== modalData.videoUrl) {
            formData.append("video", currentValues.lectureVideo)
        }
        setLoading(true)
        const result = await updateSubSection(formData, token)
        if (result) {
            // console.log("result", result)
            // update the structure of course
            const updatedCourseContent = course.courseContent.map((section) =>
                section._id === modalData.sectionId ? result : section
            )
            const updatedCourse = { ...course, courseContent: updatedCourseContent }
            dispatch(setCourse(updatedCourse))
        }
        setModalData(null)
        setLoading(false)
    }

    const onSubmit = async (data) => {
        // console.log(data)
        if (view) return

        // Validate required fields
        if (!data.lectureTitle || !data.lectureDesc || !data.timeDuration || !data.lectureVideo) {
            toast.error("All fields are required")
            return
        }

        if (edit) {
            if (!isFormUpdated()) {
                toast.error("No changes made to the form")
            } else {
                handleEditSubsection()
            }
            return
        }

        const formData = new FormData()
        formData.append("sectionId", modalData)
        formData.append("title", data.lectureTitle)
        formData.append("description", data.lectureDesc)
        formData.append("timeDuration", data.timeDuration.toString())
        formData.append("videoFile", data.lectureVideo)

        // Debug logging
        console.log("Form data being sent:")
        console.log("sectionId:", modalData)
        console.log("title:", data.lectureTitle)
        console.log("description:", data.lectureDesc)
        console.log("timeDuration:", data.timeDuration)
        console.log("videoFile:", data.lectureVideo)

        // Log FormData contents
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value)
        }

        setLoading(true)
        const result = await createSubSection(formData, token)
        if (result) {
            // console.log("result", result)
            // update the structure of course
            const updatedCourseContent = course.courseContent.map((section) =>
                section._id === modalData ? result : section
            )
            const updatedCourse = { ...course, courseContent: updatedCourseContent }
            dispatch(setCourse(updatedCourse))
        }
        setModalData(null)
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-11/12 max-w-[700px] max-h-[90vh] overflow-y-auto rounded-lg border border-richblack-400 bg-richblack-800 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-richblack-5">
                        {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Lecture
                    </h2>
                    <button
                        onClick={() => setModalData(null)}
                        className="text-2xl text-richblack-5"
                    >
                        <RxCross2 />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm text-richblack-5" htmlFor="lectureTitle">
                            Lecture Title <sup className="text-pink-200">*</sup>
                        </label>
                        <input
                            id="lectureTitle"
                            placeholder="Enter Lecture Title"
                            {...register("lectureTitle", { required: true })}
                            className="form-style w-full"
                            disabled={view}
                        />
                        {errors.lectureTitle && (
                            <span className="ml-2 text-xs tracking-wide text-pink-200">
                                Lecture Title is required
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm text-richblack-5" htmlFor="lectureDesc">
                            Lecture Description <sup className="text-pink-200">*</sup>
                        </label>
                        <textarea
                            id="lectureDesc"
                            placeholder="Enter Lecture Description"
                            {...register("lectureDesc", { required: true })}
                            className="form-style resize-x-none min-h-[130px] w-full"
                            disabled={view}
                        />
                        {errors.lectureDesc && (
                            <span className="ml-2 text-xs tracking-wide text-pink-200">
                                Lecture Description is required
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm text-richblack-5" htmlFor="timeDuration">
                            Time Duration (in seconds) <sup className="text-pink-200">*</sup>
                        </label>
                        <input
                            id="timeDuration"
                            type="number"
                            placeholder="Enter time duration in seconds"
                            {...register("timeDuration", {
                                required: true,
                                min: 1,
                                valueAsNumber: true
                            })}
                            className="form-style w-full"
                            disabled={view}
                        />
                        {errors.timeDuration && (
                            <span className="ml-2 text-xs tracking-wide text-pink-200">
                                Time duration is required and must be at least 1 second
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col space-y-2">
                        <VideoUpload
                            name="lectureVideo"
                            label="Lecture Video"
                            register={register}
                            setValue={setValue}
                            errors={errors}
                            editData={view ? modalData?.videoUrl : null}
                            trigger={trigger}
                        />
                        {errors.lectureVideo && (
                            <span className="ml-2 text-xs tracking-wide text-pink-200">
                                Lecture Video is required
                            </span>
                        )}
                    </div>
                    {!view && (
                        <div className="flex justify-end gap-x-2">
                            <button
                                type="button"
                                onClick={() => setModalData(null)}
                                className="flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900"
                            >
                                Cancel
                            </button>
                            <IconBtn disabled={loading} text={edit ? "Update Lecture" : "Create Lecture"}>
                                {edit ? "Update" : "Create"}
                            </IconBtn>
                        </div>
                    )}
                </form>
                <div className="h-4"></div>
            </div>
        </div>
    )
}