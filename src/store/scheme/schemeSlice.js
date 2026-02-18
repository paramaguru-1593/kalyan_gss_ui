import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getStoreBasedSchemes } from "./schemeApi";

const initialState = {
    dialerCalling: null,
    schemes: {
        isLoading: false,
        data: [],
        error: null,
    },
};

/**
 * Async thunk to fetch schemes by store id.
 * payload: storeId (number)
 */
export const fetchStoreBasedSchemes = createAsyncThunk(
    "scheme/fetchByStoreId",
    async (storeId = 0, thunkAPI) => {
        try {
            const res = await getStoreBasedSchemes(storeId);

            // Expected Laravel response: { data: [...] } or wrapped differently.
            const payload = res?.data;

            if (!payload) {
                return thunkAPI.rejectWithValue({ message: "No response" });
            }

            // If backend returns { data: [...] }
            const responseData = payload.data ?? payload?.data?.Response?.data ?? payload ?? [];

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
            .addCase(fetchStoreBasedSchemes.pending, (state) => {
                state.schemes.isLoading = true;
                state.schemes.error = null;
            })
            .addCase(fetchStoreBasedSchemes.fulfilled, (state, action) => {
                state.schemes.isLoading = false;
                state.schemes.data = action.payload || [];
            })
            .addCase(fetchStoreBasedSchemes.rejected, (state, action) => {
                state.schemes.isLoading = false;
                state.schemes.error = action.payload || action.error;
            });
    },
});

export default schemeSlice.reducer;

