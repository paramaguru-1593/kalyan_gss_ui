import { createAsyncThunk } from "@reduxjs/toolkit";
import ApiEndpoits from "../../api/apiEndPoints";
import { POST } from "../../api/apiHelper";
import { fetchSchemeDetailsFailure, fetchSchemeDetailsStart, fetchSchemeDetailsSuccess } from "./schemeSlice";

/**
 * Fetch schemes for a given store id using the centralized ApiEndpoits key.
 * Requests body: { store_id: number }
 */
export const fetchSchemeDetails = createAsyncThunk(
    "leadDetail/fetchSchemeDetails",
    async ({ request, onSuccess }, { rejectWithValue, dispatch, getState }) => {
        dispatch(fetchSchemeDetailsStart());
        try {
            const response = await POST(`${ApiEndpoits.storeBasedSchemeData}`, request);
            dispatch(fetchSchemeDetailsSuccess(response.data));
            
            if (response?.status === 200) {
                onSuccess(response.data);
            }
        } catch (error) {
            dispatch(fetchSchemeDetailsFailure(error.response?.data || error.message));
            console.error(error,'error on fetch scheme details');
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
