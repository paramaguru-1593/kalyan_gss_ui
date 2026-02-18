import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    schemes: {
        isLoading: false,
        data: [],
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
    },
});

export const { 
    fetchSchemeDetailsStart,
    fetchSchemeDetailsSuccess,
    fetchSchemeDetailsFailure,
} = schemeSlice.actions;

export default schemeSlice.reducer;

