import Constants from "../../utils/constants";

/**
 * Shared initial values and validation for onboarding steps.
 * Keeps consistency with ProfileEdit / api payloads.
 */

export function getInitialPersonalValues() {
  try {
    const s = localStorage.getItem("profile");
    const m = localStorage.getItem(Constants.localStorageKey.mobileNumber) || "";
    if (s) {
      const d = JSON.parse(s);
      const fn = d.first_name ?? (d.fullName ? String(d.fullName).trim().split(/\s+/)[0] : "") ?? "";
      const ln = d.last_name ?? (d.fullName ? String(d.fullName).trim().split(/\s+/).slice(1).join(" ") : "") ?? "";
      return {
        first_name: fn,
        last_name: ln,
        mobile_no: d.mobileNumber || m || "",
        email: d.emailAddress || "",
        dateOfBirth: d.dateOfBirth || "",
        gender: d.gender || "Male",
        address: d.address || "",
        city: d.city || "",
        stateName: d.stateName || "",
        pincode: d.pincode || "",
        nominee_name: d.nomineeName || "",
        relation_of_nominee: d.nomineeRelationship || "",
        nomineeDob: d.nomineeDob || "",
        nomineeAddress: d.nomineeAddress || "",
        nomineeContact: d.nomineeContact || "",
      };
    }
  } catch (_) {}
  const m = typeof localStorage !== "undefined" ? localStorage.getItem(Constants.localStorageKey.mobileNumber) || "" : "";
  return {
    first_name: "",
    last_name: "",
    mobile_no: m,
    email: "",
    dateOfBirth: "",
    gender: "Male",
    address: "",
    city: "",
    stateName: "",
    pincode: "",
    nominee_name: "",
    relation_of_nominee: "",
    nomineeDob: "",
    nomineeAddress: "",
    nomineeContact: "",
  };
}

export function getInitialKycValues() {
  try {
    const s = localStorage.getItem("profile");
    const m = localStorage.getItem(Constants.localStorageKey.mobileNumber) || "";
    const d = s ? JSON.parse(s) : {};
    return {
      mobile_no: d.mobileNumber || m || "",
      id_proof_type: typeof d.idProofType === "number" ? d.idProofType : 1,
      id_proof_number: d.idProofNumber || "",
      id_proof_front_side: "",
      id_proof_back_side: "",
    };
  } catch (_) {}
  return {
    mobile_no: localStorage.getItem(Constants.localStorageKey.mobileNumber) || "",
    id_proof_type: 1,
    id_proof_number: "",
    id_proof_front_side: "",
    id_proof_back_side: "",
  };
}

export function getInitialBankValues() {
  try {
    const m = localStorage.getItem(Constants.localStorageKey.mobileNumber) || "";
    const s = localStorage.getItem("profile");
    const d = s ? JSON.parse(s) : {};
    return {
      mobile_no: d.mobileNumber || m || "",
      bank_account_no: "",
      account_holder_name: "",
      account_holder_name_bank: "",
      ifsc_code: "",
      name_match_percentage: "",
      file: "",
    };
  } catch (_) {}
  return {
    mobile_no: localStorage.getItem(Constants.localStorageKey.mobileNumber) || "",
    bank_account_no: "",
    account_holder_name: "",
    account_holder_name_bank: "",
    ifsc_code: "",
    name_match_percentage: "",
    file: "",
  };
}
