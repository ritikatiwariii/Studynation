import React, { useEffect, useState } from "react"
import ReactStars from "react-rating-stars-component"
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import "../../App.css"
// Icons
import { FaStar } from "react-icons/fa"
// Import required modules
import { Autoplay, FreeMode, Pagination } from "swiper/modules"

// Get apiFunction and the endpoint
import { apiConnector } from "../../service/apiconnector"
import { ratingsEndpoints } from "../../service/apis"

function ReviewSlider() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [hasFetched, setHasFetched] = useState(false)
    const truncateWords = 15

    useEffect(() => {
        if (hasFetched) return; // Prevent multiple calls

        ; (async () => {
            try {
                setLoading(true)
                setError(null)
                const { data } = await apiConnector(
                    "GET",
                    ratingsEndpoints.REVIEWS_DETAILS_API
                )
                if (data?.success) {
                    setReviews(data?.data || [])
                } else {
                    setReviews([])
                }
                setHasFetched(true)
            } catch (error) {
                console.log("Error fetching reviews:", error)
                setError("Failed to load reviews")
                setReviews([]) // Set empty array to prevent Swiper issues
                setHasFetched(true)
            } finally {
                setLoading(false)
            }
        })()
    }, [hasFetched])

    // Don't render Swiper if no reviews or loading
    if (loading) {
        return (
            <div className="text-white">
                <div className="my-[50px] h-[184px] max-w-maxContentTab lg:max-w-maxContent flex items-center justify-center">
                    <div className="spinner"></div>
                </div>
            </div>
        )
    }

    if (error || !reviews || reviews.length === 0) {
        return (
            <div className="text-white">
                <div className="my-[50px] h-[184px] max-w-maxContentTab lg:max-w-maxContent flex items-center justify-center">
                    <p className="text-richblack-300">No reviews available</p>
                </div>
            </div>
        )
    }

    return (
        <div className="text-white">
            <div className="my-[50px] h-[184px] max-w-maxContentTab lg:max-w-maxContent">
                <Swiper
                    slidesPerView={Math.min(4, reviews.length)}
                    spaceBetween={25}
                    loop={reviews.length > 4}
                    freeMode={true}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    modules={[FreeMode, Pagination, Autoplay]}
                    className="w-full "
                >
                    {reviews.map((review, i) => {
                        return (
                            <SwiperSlide key={i}>
                                <div className="flex flex-col gap-3 bg-richblack-800 p-3 text-[14px] text-richblack-25">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={
                                                review?.user?.image
                                                    ? review?.user?.image
                                                    : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                                            }
                                            alt=""
                                            className="h-9 w-9 rounded-full object-cover"
                                        />
                                        <div className="flex flex-col">
                                            <h1 className="font-semibold text-richblack-5">{`${review?.user?.firstName} ${review?.user?.lastName}`}</h1>
                                            <h2 className="text-[12px] font-medium text-richblack-500">
                                                {review?.course?.courseName}
                                            </h2>
                                        </div>
                                    </div>
                                    <p className="font-medium text-richblack-25">
                                        {review?.review.split(" ").length > truncateWords
                                            ? `${review?.review
                                                .split(" ")
                                                .slice(0, truncateWords)
                                                .join(" ")} ...`
                                            : `${review?.review}`}
                                    </p>
                                    <div className="flex items-center gap-2 ">
                                        <h3 className="font-semibold text-yellow-100">
                                            {review.rating.toFixed(1)}
                                        </h3>
                                        <ReactStars
                                            count={5}
                                            value={review.rating}
                                            size={20}
                                            edit={false}
                                            activeColor="#ffd700"
                                            emptyIcon={<FaStar />}
                                            fullIcon={<FaStar />}
                                        />
                                    </div>
                                </div>
                            </SwiperSlide>
                        )
                    })}
                    {/* <SwiperSlide>Slide 1</SwiperSlide> */}
                </Swiper>
            </div>
        </div>
    )
}

export default ReviewSlider