import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import AddCourse from "./components/cors/Dashboard/AddCourse";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/common/Navbar";
import OpenRoute from "./components/cors/Auth/OpenRoute";
import Catalog from "./pages/Catalog";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import Contact from "./pages/Contact";
import MyProfile from "./components/cors/Dashboard/Settings/MyProfile";
import PrivateRoute from "./components/cors/Auth/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Settings from "./components/cors/Dashboard/Settings";
import EnrolledCourses from "./components/cors/Dashboard/Settings/EnrolledCourses";
import { ACCOUNT_TYPE } from "./utils/constants"
import Cart from "./components/cors/Dashboard/Settings/Cart";
import { useSelector } from "react-redux";
import MyCourses from "./components/cors/Dashboard/MyCourses";
import EditCourse from "./components/cors/Dashboard/EditCourse";
import CourseDetails from "./pages/CourseDetails";
import Courses from "./pages/Courses";
import ViewCourse from "./pages/ViewCourses";
import VideoDetails from "./components/cors/ViewCourse/VideoDetails";
import Instructor from "./components/cors/Dashboard/InstructorDashboard/Instructor";
function App() {
  const { user } = useSelector((state) => state.profile)
  console.log("Login import:", Login);
  console.log("Signup import:", Signup);
  console.log("Navbar import:", Navbar);
  console.log("Catalog import:", Catalog);
  // Add for any other component you import
  return (
    <div className="w-full min-h-screen bg-richblack-900 flex flex-col">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="courses" element={<Courses />} />
        <Route path="catalog/:catalogName" element={<Catalog />} />
        <Route path="courses/:courseId" element={<CourseDetails />} />
        <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
        <Route
          path="login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />
        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />

        <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />
        <Route
          path="about"
          element={
            
              <About />
          
          }
        />
        <Route
          path="contact"
          element={
            <Contact />
          }
        />
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="my-profile" element={<MyProfile />} />
          <Route path="settings" element={<Settings />} />
          {
            user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <>
                <Route path="cart" element={<Cart />} />
                <Route path="enrolled-courses" element={<EnrolledCourses />} />
              </>
            )
          }
          {
            user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
              <>
                <Route path="instructor" element={<Instructor />} />
                <Route path="add-course" element={<AddCourse />} />
                <Route path="my-courses" element={<MyCourses />} />
                <Route path="edit-course/:courseId" element={<EditCourse />} />
              </>
            )
          }
        </Route>

        <Route
          path="view-course/:courseId"
          element={
            <PrivateRoute>
              <ViewCourse />
            </PrivateRoute>
          }
        >
          <Route
            path="section/:sectionId/sub-section/:subSectionId"
            element={<VideoDetails />}
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
