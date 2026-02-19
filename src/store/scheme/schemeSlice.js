import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    schemes: {
        isLoading: false,
        data: [],
        error: null,
    },
    personalDetails: {
        isLoading: false,
        data: [],
        error: null,
    },
    terms: {
        isLoading: false,
        data: null,
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
        fetchTermsStart: (state) => {
        state.terms.isLoading = true;
        state.terms.error = null;
        state.terms.data = null;
        },
        fetchTermsSuccess: (state, action) => {
            state.terms.isLoading = false;
            state.terms.data = action.payload;
        },
        fetchTermsFailure: (state, action) => {
            state.terms.isLoading = false;
            state.terms.error = action.payload;
        },
        clearTerms: (state) => {
            state.terms.isLoading = false;
            state.terms.data = null;
            state.terms.error = null;
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
    fetchTermsStart,
    fetchTermsSuccess,
    fetchTermsFailure,
    clearTerms,
} = schemeSlice.actions;

export default schemeSlice.reducer


// const termsSlice = createSlice({
//   name: "terms",
//   initialState,
//   reducers: {
//     fetchTermsStart: (state) => {
//       state.isLoading = true;
//       state.error = null;
//       state.data = null;
//     },
//     fetchTermsSuccess: (state, action) => {
//       state.isLoading = false;
//       state.data = action.payload;
//     },
//     fetchTermsFailure: (state, action) => {
//       state.isLoading = false;
//       state.error = action.payload;
//     },
//     clearTerms: (state) => {
//       state.isLoading = false;
//       state.data = null;
//       state.error = null;
//     },
//   },
// });

// export const { fetchTermsStart, fetchTermsSuccess, fetchTermsFailure, clearTerms } = termsSlice.actions;

