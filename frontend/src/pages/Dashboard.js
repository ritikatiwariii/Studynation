import { useSelector } from "react-redux"
import { Outlet, useLocation } from "react-router-dom"

import Sidebar from "../components/cors/Dashboard/Settings/Sidebar"

function Dashboard() {
    const { loading: profileLoading } = useSelector((state) => state.profile)
    const { loading: authLoading } = useSelector((state) => state.auth)
    const location = useLocation()

    // Check if we're on a view-course page
    const isViewCoursePage = location.pathname.includes('/view-course/')

    if (profileLoading || authLoading) {
        return (
            <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="relative flex min-h-[calc(100vh-3.5rem)]">
            {/* Hide main sidebar on view-course pages */}
            {!isViewCoursePage && <Sidebar />}
            <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto">
                <div className="mx-auto w-11/12 max-w-[1000px] py-10">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Dashboard