import { createAsyncThunk } from "@reduxjs/toolkit";
import ApiEndpoits from "../../api/apiEndPoints";
import { POST } from "../../api/apiHelper";
import { GET } from "../../api/apiHelper";
import axios from "axios";  
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

export const fetchTermsAndCondition = createAsyncThunk(
  "scheme/fetchTermsAndCondition",
  async ({ request, onSuccess }, { rejectWithValue }) => {
    try {
      const schemeId = request?.scheme_id ?? request?.schemeId ?? request;
      let response = await GET(`${ApiEndpoits.getTermsAndCondition}`, {
        params: { scheme_id: String(schemeId) },
      });

      // Retry logic if the standard route fails with 404
      if (response?.status === 404) {
        const directUrl = `${import.meta.env.VITE_API_URL}${ApiEndpoits.getTermsAndCondition}`;
        response = await axios.get(directUrl, {
          params: { scheme_id: String(schemeId) },
        });
      }

      const payload = response.data?.data ?? response.data;

      if (response?.status === 200) {
        onSuccess && onSuccess(response.data);
      }

      return payload;
    } catch (error) {
      console.error("Error on fetch terms:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
