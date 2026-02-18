import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getSchemesByMobileNumber } from "./schemeApi";

const initialState = {
    dialerCalling: null,
    schemes: {
        isLoading: false,
        data: [],
        error: null,
    },
};

/**
 * Async thunk to fetch schemes by mobile number.
 * payload: mobileNumber (string)
 */
export const fetchSchemesByMobileNumber = createAsyncThunk(
    "scheme/fetchByMobileNumber",
    async (mobileNumber, thunkAPI) => {
        try {
            const res = await getSchemesByMobileNumber(mobileNumber);

            // Expected Laravel response shape (from user):
            // { data: { Response: { data: [...] } }, error: { status: 200, ... } }
            const payload = res?.data;

            if (!payload) {
                return thunkAPI.rejectWithValue({ message: "No response" });
            }

            const responseData =
                payload.data?.Response?.data ?? payload?.data ?? [];

            return responseData;
        } catch (err) {
            return thunkAPI.rejectWithValue(err?.response?.data || err?.message || err);
        }
    }
);

export const schemeSlice = createSlice({
    name: "scheme",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSchemesByMobileNumber.pending, (state) => {
                state.schemes.isLoading = true;
                state.schemes.error = null;
            })
            .addCase(fetchSchemesByMobileNumber.fulfilled, (state, action) => {
                state.schemes.isLoading = false;
                state.schemes.data = action.payload || [];
            })
            .addCase(fetchSchemesByMobileNumber.rejected, (state, action) => {
                state.schemes.isLoading = false;
                state.schemes.error = action.payload || action.error;
            });
    },
});

export default schemeSlice.reducer;

