import { GET, POST } from "../../api/apiHelper";

/**
 * Call backend endpoint to fetch schemes by mobile number.
 * Expects query param: MobileNumber
 * Returns the raw axios response (caller will inspect .data)
 */
export const getSchemesByMobileNumber = (mobileNumber) => {
  return GET(`/externals/getSchemesByMobileNumber`, {
    params: {
      MobileNumber: mobileNumber,
    },
  });
};

/**
 * Fetch schemes for a given store id.
 * Expects payload { store_id: number }
 */
export const getStoreBasedSchemes = (storeId) => {
  return POST(`/storebasedscheme_data`, {
    store_id: storeId,
  });
};
