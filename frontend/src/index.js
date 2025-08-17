import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import rootReducer from './reducer'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from "react-router-dom";

// Restore token from localStorage on app startup
const token = localStorage.getItem("token")
const user = localStorage.getItem("user")

const preloadedState = {
  auth: {
    token: token ? JSON.parse(token) : null,
    loading: false,
    signupData: null,
  },
  profile: {
    user: user ? JSON.parse(user) : null,
    loading: false,
  },
  viewCourse: {
    courseSectionData: [],
    courseEntireData: {},
    completedLectures: [],
    totalNoOfLectures: 0,
  }
}

const store = configureStore({
  reducer: rootReducer,
  preloadedState
})
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Toaster />
      <BrowserRouter>
        <App />
      </BrowserRouter>

    </Provider>
  </React.StrictMode>
);
