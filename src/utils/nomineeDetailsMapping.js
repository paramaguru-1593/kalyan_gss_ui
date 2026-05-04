/**
 * Maps `/v2/nomineedetails` response `data` for profile and enroll forms.
 */

/** @param {*} res — axios response from POST /v2/nomineedetails */
export function isNomineeDetailsApiSuccess(res) {
  if (!res || res.status !== 200) return false;
  const body = res.data;
  if (!body?.data) return false;
  const errSt = body.error?.status;
  if (errSt != null && errSt !== 200) return false;
  return true;
}

/**
 * Maps API relation strings (e.g. SON, SPOUSE) to form dropdown values.
 * @param {string} [rel]
 * @returns {string}
 */
export function nomineeApiRelationToForm(rel) {
  if (rel == null || typeof rel !== "string") return "";
  const u = rel.trim().toUpperCase();
  if (
    ["SON", "DAUGHTER", "CHILD", "KID"].includes(u) ||
    u.includes("SON") ||
    u.includes("DAUGHTER")
  ) {
    return "Child";
  }
  if (["FATHER", "MOTHER", "PARENT", "MOM", "DAD"].includes(u)) return "Parent";
  if (["WIFE", "HUSBAND", "SPOUSE"].includes(u)) return "Spouse";
  if (["BROTHER", "SISTER", "SIBLING"].includes(u)) return "Sibling";
  const order = ["Spouse", "Parent", "Child", "Sibling", "Other"];
  const found = order.find((x) => x.toUpperCase() === u);
  if (found) return found;
  return "Other";
}

/**
 * @param {Record<string, unknown>} data — `res.data.data` from nominee details API
 * @returns {Record<string, string>}
 */
export function mapNomineeApiDataToProfilePrefill(data) {
  if (!data || typeof data !== "object") return {};
  const fn = String(data.nominee_first_name ?? "").trim();
  const ln = String(data.nominee_last_name ?? "").trim();
  const nameCombined = [fn, ln].filter(Boolean).join(" ").trim();

  const stateName =
    data.nominee_state && typeof data.nominee_state === "object"
      ? String(data.nominee_state.state_name ?? data.nominee_state.state_description ?? "").trim()
      : "";

  const cityStr =
    String(data.nominee_city_str ?? "").trim() ||
    (data.nominee_city && typeof data.nominee_city === "object"
      ? String(data.nominee_city.city_name ?? "").trim()
      : "");

  const districtStr =
    data.nominee_district != null && String(data.nominee_district).trim()
      ? String(data.nominee_district).trim()
      : "";

  const parts = [
    data.nominee_house_no,
    data.nominee_street,
    cityStr,
    ...(districtStr && districtStr !== cityStr ? [districtStr] : []),
    stateName,
    data.nominee_post_office_str,
  ]
    .map((p) => (p != null ? String(p).trim() : ""))
    .filter(Boolean);

  const addressLine = parts.join(", ");

  const mobile = String(data.nominee_mobile_no ?? "").replace(/\D/g, "").slice(0, 10);

  return {
    nominee_name: nameCombined,
    relation_of_nominee: nomineeApiRelationToForm(String(data.nominee_relation ?? "")),
    nomineeContact: mobile,
    nomineeAddress: addressLine,
  };
}

/**
 * @param {Record<string, unknown>} data
 * @returns {Record<string, string>}
 */
export function mapNomineeApiDataToEnrollFields(data) {
  if (!data || typeof data !== "object") return {};
  const fn = String(data.nominee_first_name ?? "").trim();
  const ln = String(data.nominee_last_name ?? "").trim();
  const stateName =
    data.nominee_state && typeof data.nominee_state === "object"
      ? String(data.nominee_state.state_name ?? data.nominee_state.state_description ?? "").trim()
      : "";
  const cityStr =
    String(data.nominee_city_str ?? "").trim() ||
    (data.nominee_city && typeof data.nominee_city === "object"
      ? String(data.nominee_city.city_name ?? "").trim()
      : "");
  const districtRaw =
    data.nominee_district != null && String(data.nominee_district).trim()
      ? String(data.nominee_district).trim()
      : "";
  const districtStr = districtRaw || cityStr;

  const postOffice = data.nominee_post_office;
  const pinStr =
    postOffice != null && String(postOffice).trim() !== ""
      ? String(postOffice).replace(/\D/g, "").slice(0, 6)
      : "";

  const mobile = String(data.nominee_mobile_no ?? "").replace(/\D/g, "").slice(0, 10);

  return {
    nomineeFirstName: fn,
    nomineeLastName: ln,
    nomineeMobileNo: mobile,
    nomineeRelation: nomineeApiRelationToForm(String(data.nominee_relation ?? "")),
    nomineePincodeId: pinStr,
    nomineeState: stateName,
    nomineeDistrict: districtStr,
    nomineeCity: cityStr,
    nomineeStreet: String(data.nominee_street ?? "").trim(),
    nomineeHouseNo: String(data.nominee_house_no ?? "").trim(),
  };
}
