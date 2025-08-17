import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"

import { getUserEnrolledCourses } from "../../../../service/operations/profileAPI"

// Custom Progress Bar Component
const ProgressBar = ({ completed, height = "8px" }) => {
    return (
        <div className="w-full bg-richblack-700 rounded-full" style={{ height }}>
            <div
                className="bg-yellow-50 rounded-full transition-all duration-300"
                style={{ width: `${completed}%`, height: "100%" }}
            ></div>
        </div>
    )
}

export default function EnrolledCourses() {
    const { token } = useSelector((state) => state.auth)
    const navigate = useNavigate()

    const [enrolledCourses, setEnrolledCourses] = useState(null)
    const [loading, setLoading] = useState(false)
    const [hasFetched, setHasFetched] = useState(false)

    const getEnrolledCourses = async () => {
        if (loading || hasFetched) return; // Prevent multiple calls

        setLoading(true);
        try {
            // Fallback: Get token from localStorage if Redux token is null
            let authToken = token
            if (!authToken) {
                const localToken = localStorage.getItem("token")
                if (localToken) {
                    authToken = JSON.parse(localToken)
                }
            }

            if (!authToken) {
                toast.error("Please login again")
                navigate("/login")
                return
            }

            const res = await getUserEnrolledCourses(authToken);
            setEnrolledCourses(res);
            setHasFetched(true);
        } catch (error) {
            if (error.message === "Invalid Token!") {
                toast.error("Session expired. Please login again.")
                navigate("/login")
            } else {
                toast.error("Failed to load enrolled courses. Please try again.")
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getEnrolledCourses();
    }, []) // Remove token dependency to prevent infinite calls

    return (
        <>
            <div className="text-3xl text-richblack-50">Enrolled Courses</div>
            {loading ? (
                <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
                    <div className="spinner"></div>
                </div>
            ) : !enrolledCourses || !enrolledCourses.length ? (
                <p className="grid h-[10vh] w-full place-content-center text-richblack-5">
                    You have not enrolled in any course yet.
                    {/* TODO: Modify this Empty State */}
                </p>
            ) : (
                <div className="my-8 text-richblack-5">
                    {/* Headings */}
                    <div className="flex rounded-t-lg bg-richblack-500 ">
                        <p className="w-[45%] px-5 py-3">Course Name</p>
                        <p className="w-1/4 px-2 py-3">Duration</p>
                        <p className="flex-1 px-2 py-3">Progress</p>
                    </div>
                    {/* Course Names */}
                    {enrolledCourses.map((course, i, arr) => (
                        <div
                            className={`flex items-center border border-richblack-700 ${i === arr.length - 1 ? "rounded-b-lg" : "rounded-none"
                                }`}
                            key={i}
                        >
                            <div
                                className="flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3"
                                onClick={() => {
                                    navigate(
                                        `/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`
                                    )
                                }}
                            >
                                <img
                                    src={course.thumbnail}
                                    alt="course_img"
                                    className="h-14 w-14 rounded-lg object-cover"
                                />
                                <div className="flex max-w-xs flex-col gap-2">
                                    <p className="font-semibold">{course.courseName}</p>
                                    <p className="text-xs text-richblack-300">
                                        {course.courseDescription.length > 50
                                            ? `${course.courseDescription.slice(0, 50)}...`
                                            : course.courseDescription}
                                    </p>
                                </div>
                            </div>
                            <div className="w-1/4 px-2 py-3">{course?.totalDuration}</div>
                            <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
                                <p>Progress: {course.progressPercentage || 0}%</p>
                                <ProgressBar
                                    completed={course.progressPercentage || 0}
                                    height="8px"
                                    isLabelVisible={false}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}