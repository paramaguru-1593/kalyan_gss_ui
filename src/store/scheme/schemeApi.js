import { GET } from "../../api/apiHelper";

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
