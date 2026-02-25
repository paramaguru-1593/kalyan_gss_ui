import { createAsyncThunk } from "@reduxjs/toolkit";
import ApiEndpoits from "../../api/apiEndPoints";
import { POST, GET } from "../../api/apiHelper";
import {
    fetchSchemeDetailsFailure,
    fetchSchemeDetailsStart,
    fetchSchemeDetailsSuccess,
    fetchCustomerSchemesFailure,
    fetchCustomerSchemesStart,
    fetchCustomerSchemesSuccess,
    updatePersonalDetailsFailure,
    updatePersonalDetailsStart,
    updatePersonalDetailsSuccess,
} from "./schemeSlice";
import axios from "axios";  

/**
 * Fetch schemes for a given store id using storeBasedSchemeData API.
 * Request body: { store_id: number }. Normalizes response to always store an array.
 */
export const fetchSchemeDetails = createAsyncThunk(
    "leadDetail/fetchSchemeDetails",
    async ({ request, onSuccess }, { rejectWithValue, dispatch }) => {
        dispatch(fetchSchemeDetailsStart());
        try {
            const response = await POST(`${ApiEndpoits.storeBasedSchemeData}`, request);
            const body = response?.data;
            const err = body?.error;
            if (response?.status >= 400 || (err && err.status >= 400)) {
                const payload = err || body || "Failed to load schemes";
                dispatch(fetchSchemeDetailsFailure(payload));
                return rejectWithValue(payload);
            }
            const list = Array.isArray(body) ? body : (body?.data ?? []);
            dispatch(fetchSchemeDetailsSuccess(list));
            if (response?.status === 200 && onSuccess) {
                onSuccess(list);
            }
            return list;
        } catch (error) {
            const payload = error.response?.data || error.message;
            dispatch(fetchSchemeDetailsFailure(payload));
            return rejectWithValue(payload);
        }
    }
);

/**
 * Fetch customer schemes for a given mobile number using getSchemesByMobileNumber API.
 * It parses the enrollment list and stores it in Redux.
 * The component can decide when to call this (e.g. only when Redux is empty).
 */
export const fetchCustomerSchemesByMobile = createAsyncThunk(
    "scheme/fetchCustomerSchemesByMobile",
    async ({ mobileNumber }, { rejectWithValue, dispatch }) => {
        if (!mobileNumber) {
            return rejectWithValue("Mobile number is required");
        }
        dispatch(fetchCustomerSchemesStart());
        try {
            const response = await GET(`${ApiEndpoits.getSchemesByMobileNumber}?MobileNumber=${encodeURIComponent(mobileNumber)}`);

            if (!response || response.status !== 200) {
                const payload = response?.data?.error?.message || "Failed to load customer schemes";
                dispatch(fetchCustomerSchemesFailure(payload));
                return rejectWithValue(payload);
            }

            const err = response.data?.error;
            if (err && err.status !== 200) {
                const payload = err.message || "Failed to load customer schemes";
                dispatch(fetchCustomerSchemesFailure(payload));
                return rejectWithValue(payload);
            }

            const responseData = response.data?.data?.Response?.data;
            const list = responseData?.enrollmentList ?? responseData?.profile?.enrollmentList;
            const normalized = Array.isArray(list) ? list : [];

            dispatch(fetchCustomerSchemesSuccess({ data: normalized, mobileNumber }));
            return normalized;
        } catch (error) {
            const payload = error.response?.data || error.message || "Failed to load customer schemes";
            dispatch(fetchCustomerSchemesFailure(payload));
            return rejectWithValue(payload);
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
