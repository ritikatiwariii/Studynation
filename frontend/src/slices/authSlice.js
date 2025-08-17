import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // ... your state
    loading: false,
    signupData: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setSignupData: (state, action) => {
            state.signupData = action.payload;
        },
    },
});

export const { setToken, setLoading, setSignupData } = authSlice.actions;
export default authSlice.reducer;