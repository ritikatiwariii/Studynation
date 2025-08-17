import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

import { useLocation } from "react-router-dom"
import ReactPlayer from "react-player"

import { markLectureAsComplete } from "../../../service/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import IconBtn from "../../common/IconBtn"

const VideoDetails = () => {
    const { courseId, sectionId, subSectionId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const playerRef = useRef(null)
    const dispatch = useDispatch()
    const { token } = useSelector((state) => state.auth)
    const { courseSectionData = [], courseEntireData = {}, completedLectures = [] } =
        useSelector((state) => state.viewCourse) || {}

    const [videoData, setVideoData] = useState([])
    const [previewSource, setPreviewSource] = useState("")
    const [videoEnded, setVideoEnded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [playing, setPlaying] = useState(false)

    useEffect(() => {
        ; (async () => {
            if (!courseSectionData || !courseSectionData.length) {
                return;
            }
            if (!courseId && !sectionId && !subSectionId) {
                navigate(`/dashboard/enrolled-courses`)
            } else {
                const filteredData = courseSectionData.filter(
                    (course) => course._id === sectionId
                )

                const filteredVideoData = filteredData?.[0]?.subSection.filter(
                    (data) => data._id === subSectionId
                )

                setVideoData(filteredVideoData[0])
                setPreviewSource(courseEntireData.thumbnail)
                setVideoEnded(false)
            }
        })()
    }, [courseSectionData, courseEntireData, location.pathname, courseId, sectionId, subSectionId, navigate])

    // check if the lecture is the first video of the course
    const isFirstVideo = () => {
        const currentSectionIndx = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )

        const currentSubSectionIndx = courseSectionData[
            currentSectionIndx
        ].subSection.findIndex((data) => data._id === subSectionId)

        if (currentSectionIndx === 0 && currentSubSectionIndx === 0) {
            return true
        } else {
            return false
        }
    }

    // go to the next video
    const goToNextVideo = () => {
        // console.log(courseSectionData)

        const currentSectionIndx = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )

        const noOfSubsections =
            courseSectionData[currentSectionIndx].subSection.length

        const currentSubSectionIndx = courseSectionData[
            currentSectionIndx
        ].subSection.findIndex((data) => data._id === subSectionId)

        // console.log("no of subsections", noOfSubsections)

        if (currentSubSectionIndx !== noOfSubsections - 1) {
            const nextSubSectionId =
                courseSectionData[currentSectionIndx].subSection[
                    currentSubSectionIndx + 1
                ]._id
            navigate(
                `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
            )
        } else {
            const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
            const nextSubSectionId =
                courseSectionData[currentSectionIndx + 1].subSection[0]._id
            navigate(
                `/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`
            )
        }
    }

    // check if the lecture is the last video of the course
    const isLastVideo = () => {
        const currentSectionIndx = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )

        const noOfSubsections =
            courseSectionData[currentSectionIndx].subSection.length

        const currentSubSectionIndx = courseSectionData[
            currentSectionIndx
        ].subSection.findIndex((data) => data._id === subSectionId)

        if (
            currentSectionIndx === courseSectionData.length - 1 &&
            currentSubSectionIndx === noOfSubsections - 1
        ) {
            return true
        } else {
            return false
        }
    }

    // go to the previous video
    const goToPrevVideo = () => {
        // console.log(courseSectionData)

        const currentSectionIndx = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )

        const currentSubSectionIndx = courseSectionData[
            currentSectionIndx
        ].subSection.findIndex((data) => data._id === subSectionId)

        if (currentSubSectionIndx !== 0) {
            const prevSubSectionId =
                courseSectionData[currentSectionIndx].subSection[
                    currentSubSectionIndx - 1
                ]._id
            navigate(
                `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
            )
        } else {
            const prevSectionId = courseSectionData[currentSectionIndx - 1]._id
            const prevSubSectionLength =
                courseSectionData[currentSectionIndx - 1].subSection.length
            const prevSubSectionId =
                courseSectionData[currentSectionIndx - 1].subSection[
                    prevSubSectionLength - 1
                ]._id
            navigate(
                `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
            )
        }
    }

    const handleLectureCompletion = async () => {
        setLoading(true)
        const res = await markLectureAsComplete(
            { courseId: courseId, subsectionId: subSectionId },
            token
        )
        if (res) {
            dispatch(updateCompletedLectures(subSectionId))
        }
        setLoading(false)
    }

    // Show loading if course data is not available
    if (!courseSectionData || courseSectionData.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading course data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5 text-white">
            {!videoData ? (
                <img
                    src={previewSource}
                    alt="Preview"
                    className="h-full w-full rounded-md object-cover"
                />
            ) : (
                <div className="relative w-full aspect-video bg-black">
                    <video
                        ref={playerRef}
                        src={videoData?.videoUrl}
                        controls
                        width="100%"
                        height="100%"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        onPlay={() => setPlaying(true)}
                        onPause={() => setPlaying(false)}
                        onEnded={() => setVideoEnded(true)}
                    />
                    {/* Render When Video Ends */}
                    {videoEnded && (
                        <div
                            style={{
                                backgroundImage:
                                    "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
                            }}
                            className="absolute inset-0 z-[100] grid h-full place-content-center font-inter"
                        >
                            {!completedLectures.includes(subSectionId) && (
                                <IconBtn
                                    disabled={loading}
                                    onclick={() => handleLectureCompletion()}
                                    text={!loading ? "Mark As Completed" : "Loading..."}
                                    customClasses="text-xl max-w-max px-4 mx-auto"
                                />
                            )}
                            <IconBtn
                                disabled={loading}
                                onclick={() => {
                                    if (playerRef?.current) {
                                        // set the current time of the video to 0
                                        playerRef.current.currentTime = 0;
                                        setVideoEnded(false)
                                        setPlaying(true)
                                    }
                                }}
                                text="Rewatch"
                                customClasses="text-xl max-w-max px-4 mx-auto mt-2"
                            />
                            <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                                {!isFirstVideo() && (
                                    <button
                                        disabled={loading}
                                        onClick={goToPrevVideo}
                                        className="blackButton"
                                    >
                                        Prev
                                    </button>
                                )}
                                {!isLastVideo() && (
                                    <button
                                        disabled={loading}
                                        onClick={goToNextVideo}
                                        className="blackButton"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
            <p className="pt-2 pb-6">{videoData?.description}</p>
        </div>
    )
}

export default VideoDetails
// video