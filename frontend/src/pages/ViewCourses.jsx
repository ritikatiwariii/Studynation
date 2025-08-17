import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useParams } from "react-router-dom"

import CourseReviewModal from "../components/cors/ViewCourse/CourseReviewModal"
import VideoDetailsSidebar from "../components/cors/ViewCourse/VideoDetailsSlidebar"
import { getFullDetailsOfCourse } from "../service/operations/courseDetailsAPI"
import {
  setCompletedLectures,
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
} from "../slices/viewCourseSlice"


export default function ViewCourse() {
  const { courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const viewCourseState = useSelector((state) => state.viewCourse)
  const dispatch = useDispatch()
  const [reviewModal, setReviewModal] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    if (hasFetched || !courseId || !token) return;

    setHasFetched(true);
    ; (async () => {
      try {
        const courseData = await getFullDetailsOfCourse(courseId, token)

        if (!courseData || !courseData.courseDetails) {
          return
        }

        // Handle missing completedVideos field
        const completedVideos = courseData.completedVideos || courseData.completedLectures || []

        dispatch(setCourseSectionData(courseData.courseDetails.courseContent || []))
        dispatch(setEntireCourseData(courseData.courseDetails))
        dispatch(setCompletedLectures(completedVideos))

        let lectures = 0
        courseData?.courseDetails?.courseContent?.forEach((sec) => {
          lectures += sec.subSection?.length || 0
        })
        dispatch(setTotalNoOfLectures(lectures))
      } catch (error) {
        console.error("Error loading course data:", error)
        // Set empty data to prevent infinite loading
        dispatch(setCourseSectionData([]))
        dispatch(setEntireCourseData({}))
        dispatch(setCompletedLectures([]))
        dispatch(setTotalNoOfLectures(0))
      }
    })()
  }, [courseId]) // Remove token dependency to prevent infinite calls

  return (
    <>
      <div className="relative flex min-h-[calc(100vh-3.5rem)] w-full">
        <VideoDetailsSidebar setReviewModal={setReviewModal} />
        <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto">
          <div className="mx-6">
            <Outlet />
          </div>
        </div>
      </div>
      {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </>
  )
}