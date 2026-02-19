import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    schemes: {
        isLoading: false,
        data: [],
        error: null,
    },
    personalDetails: {
        isLoading: false,
        error: null,
    },
}


export const schemeSlice = createSlice({
    name: "scheme",
    initialState,
    reducers: {
        fetchSchemeDetailsStart: (state) => {
            state.schemes.isLoading = true;
            state.schemes.error = null;
        },
        fetchSchemeDetailsSuccess: (state, action) => {
            state.schemes.isLoading = false;
            state.schemes.data = action.payload;
        },
        fetchSchemeDetailsFailure: (state, action) => {
            state.schemes.isLoading = false;
            state.schemes.error = action.payload;
        },
        updatePersonalDetailsStart: (state) => {
            state.personalDetails.isLoading = true;
            state.personalDetails.error = null;
        },
        updatePersonalDetailsSuccess: (state) => {
            state.personalDetails.isLoading = false;
            state.personalDetails.error = null;
        },
        updatePersonalDetailsFailure: (state, action) => {
            state.personalDetails.isLoading = false;
            state.personalDetails.error = action.payload;
        },
    },
});

export const {
    fetchSchemeDetailsStart,
    fetchSchemeDetailsSuccess,
    fetchSchemeDetailsFailure,
    updatePersonalDetailsStart,
    updatePersonalDetailsSuccess,
    updatePersonalDetailsFailure,
} = schemeSlice.actions;

export default schemeSlice.reducer;

