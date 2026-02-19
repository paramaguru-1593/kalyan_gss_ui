import { createAsyncThunk } from "@reduxjs/toolkit";
import ApiEndpoits from "../../api/apiEndPoints";
import { POST, GET } from "../../api/apiHelper";
import {
    fetchSchemeDetailsFailure,
    fetchSchemeDetailsStart,
    fetchSchemeDetailsSuccess,
    updatePersonalDetailsFailure,
    updatePersonalDetailsStart,
    updatePersonalDetailsSuccess,
} from "./schemeSlice";
import axios from "axios";  

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

/**
 * Update customer personal details (profile).
 * Payload: mobileNumber, first_name, last_name, emailAddress, dateOfBirth, gender,
 * address, city, stateName, pincode, nomineeName, nomineeRelationship, nomineeDob,
 * nomineeAddress, nomineeContact
 */
export const updatePersonalDetails = createAsyncThunk(
    "scheme/updatePersonalDetails",
    async (payload, { rejectWithValue, dispatch }) => {
        dispatch(updatePersonalDetailsStart());
        try {
            const response = await POST(ApiEndpoits.updatePersonalDetails, payload);
            if (response?.status === 200 && response?.data?.status === "success") {
                dispatch(updatePersonalDetailsSuccess());
                return response.data;
            }
            const err = response?.data?.message || "Failed to update personal details";
            dispatch(updatePersonalDetailsFailure(err));
            return rejectWithValue(err);
        } catch (error) {
            const err = error?.response?.data?.message || error?.message || "Failed to update personal details";
            dispatch(updatePersonalDetailsFailure(err));
            return rejectWithValue(err);
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
