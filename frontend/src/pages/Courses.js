import React, { useEffect, useState } from 'react'
import Footer from '../components/common/Footer'
import { getAllCourses } from '../service/operations/courseDetailsAPI'
import CourseCard from '../components/cors/Catalog/CourseCard'
import { useSelector } from "react-redux"

const Courses = () => {
    const { loading } = useSelector((state) => state.profile)
    const [courses, setCourses] = useState([])
    const [coursesLoading, setCoursesLoading] = useState(true)

    useEffect(() => {
        const fetchAllCourses = async () => {
            try {
                setCoursesLoading(true)
                const allCourses = await getAllCourses()
                console.log("All courses fetched:", allCourses)
                setCourses(allCourses || [])
            } catch (error) {
                console.log("Error fetching courses:", error)
                setCourses([])
            } finally {
                setCoursesLoading(false)
            }
        }

        fetchAllCourses()
    }, [])

    if (loading || coursesLoading) {
        return (
            <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <>
            {/* Hero Section */}
            <div className="box-content bg-richblack-800 px-4">
                <div className="mx-auto flex min-h-[260px] max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent">
                    <p className="text-sm text-richblack-300">
                        Home / Courses
                    </p>
                    <p className="text-3xl text-richblack-5">
                        All Courses
                    </p>
                    <p className="max-w-[870px] text-richblack-200">
                        Explore our collection of courses designed to help you learn and grow
                    </p>
                </div>
            </div>

            {/* Courses Section */}
            <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
                <div className="section_heading">Available Courses</div>

                {courses.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-richblack-300 text-lg">No courses available at the moment.</p>
                        <p className="text-richblack-400 text-sm mt-2">Check back later for new courses!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                        {courses.map((course, index) => (
                            <CourseCard
                                course={course}
                                key={course._id || index}
                                Height={"h-[400px]"}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </>
    )
}

export default Courses 