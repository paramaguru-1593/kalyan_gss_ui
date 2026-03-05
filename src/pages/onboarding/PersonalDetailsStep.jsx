import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import Constants from "../../utils/constants";
import { getCustomerKycInfo } from "../../api/apiHelper";
import { updatePersonalDetails } from "../../store/scheme/schemesApi";
import OnboardingLayout from "../../components/onboarding/OnboardingLayout";
import FormFooterButtons from "../../components/onboarding/FormFooterButtons";
import { getInitialPersonalValues } from "./onboardingFormUtils";

const inputClass =
  "w-full h-12 px-4 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";
const subSectionTitleClass = "text-sm font-semibold text-amber-800 mb-3";

const personalValidationSchema = Yup.object({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  mobile_no: Yup.string().required("Mobile number is required").matches(/^\d{10}$/, "Must be 10 digits"),
  email: Yup.string().email("Valid email required").required("Email is required"),
  nominee_name: Yup.string().required("Nominee name is required"),
  relation_of_nominee: Yup.string().required("Relation is required"),
});

export default function PersonalDetailsStep() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const personalDetailsState = useSelector((state) => state.scheme?.personalDetails ?? { isLoading: false, error: null });
  const [personalPrefill, setPersonalPrefill] = useState(null);
  const [loading, setLoading] = useState(true);

  const formik = useFormik({
    initialValues: { ...getInitialPersonalValues(), ...(personalPrefill || {}) },
    validationSchema: personalValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = {
        mobileNumber: values.mobile_no,
        first_name: values.first_name ?? null,
        last_name: values.last_name ?? null,
        emailAddress: values.email || null,
        dateOfBirth: values.dateOfBirth || null,
        gender: values.gender || null,
        address: values.address || null,
        city: values.city || null,
        stateName: values.stateName || null,
        pincode: values.pincode || null,
        nomineeName: values.nominee_name || null,
        nomineeRelationship: values.relation_of_nominee || null,
        nomineeDob: values.nomineeDob || null,
        nomineeAddress: values.nomineeAddress || null,
        nomineeContact: values.nomineeContact || null,
      };
      const result = await dispatch(updatePersonalDetails(payload));
      if (updatePersonalDetails.fulfilled.match(result)) {
        const fullNameVal = [values.first_name, values.last_name].filter(Boolean).join(" ");
        const stored = localStorage.getItem("profile");
        const merged = stored
          ? {
              ...JSON.parse(stored),
              first_name: values.first_name,
              last_name: values.last_name,
              fullName: fullNameVal,
              mobileNumber: values.mobile_no,
              emailAddress: values.email,
              dateOfBirth: values.dateOfBirth,
              gender: values.gender,
              address: values.address,
              city: values.city,
              stateName: values.stateName,
              pincode: values.pincode,
              nomineeName: values.nominee_name,
              nomineeRelationship: values.relation_of_nominee,
              nomineeDob: values.nomineeDob,
              nomineeAddress: values.nomineeAddress,
              nomineeContact: values.nomineeContact,
            }
          : {
              first_name: values.first_name,
              last_name: values.last_name,
              fullName: fullNameVal,
              mobileNumber: values.mobile_no,
              emailAddress: values.email,
              dateOfBirth: values.dateOfBirth,
              gender: values.gender,
              address: values.address,
              city: values.city,
              stateName: values.stateName,
              pincode: values.pincode,
              nomineeName: values.nominee_name,
              nomineeRelationship: values.relation_of_nominee,
              nomineeDob: values.nomineeDob,
              nomineeAddress: values.nomineeAddress,
              nomineeContact: values.nomineeContact,
            };
        localStorage.setItem("profile", JSON.stringify(merged));
        navigate("/onboarding/kyc-details", { replace: true });
      }
    },
  });

  // Fetch customer KYC/details on mount to prefill if data already exists
  useEffect(() => {
    let mobile = "";
    try {
      const stored = localStorage.getItem("profile");
      if (stored) mobile = JSON.parse(stored).mobileNumber || "";
      if (!mobile) mobile = localStorage.getItem(Constants.localStorageKey.mobileNumber) || "";
    } catch (_) {}
    if (!mobile || mobile.length < 10) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getCustomerKycInfo(mobile)
      .then((res) => {
        if (res && res.status === 200 && res.data?.customer_details) {
          const cd = res.data.customer_details;
          const addr = cd.address?.current_address ?? cd.address ?? {};
          const genderVal = cd.gender ? String(cd.gender).charAt(0).toUpperCase() + String(cd.gender).slice(1) : "";
          setPersonalPrefill({
            first_name: cd.first_name ?? "",
            last_name: cd.last_name ?? "",
            mobile_no: cd.mobile_no ?? cd.mobileNo ?? "",
            email: cd.emailId ?? cd.email ?? "",
            gender: genderVal || "Male",
            dateOfBirth: cd.date_of_birth ?? cd.dateOfBirth ?? "",
            address: addr.current_street ?? addr.street ?? "",
            city: addr.current_city ?? addr.city ?? "",
            stateName: addr.current_state ?? addr.state ?? "",
            pincode: addr.current_pincode != null ? String(addr.current_pincode) : (addr.pincode != null ? String(addr.pincode) : ""),
            nominee_name: cd.nominee_details?.nominee_name ?? "",
            relation_of_nominee: cd.nominee_details?.relation_of_nominee ?? "",
            nomineeDob: cd.nominee_details?.nominee_dob ?? "",
            nomineeAddress: cd.nominee_details?.nominee_address ?? "",
            nomineeContact: cd.nominee_details?.nominee_mobile_number ?? "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dateInputValue = (() => {
    const d = formik.values.dateOfBirth;
    if (!d) return "";
    if (d.includes("/")) {
      const [day, m, y] = d.split("/");
      return y && m && day ? `${y}-${m.padStart(2, "0")}-${day.padStart(2, "0")}` : d;
    }
    return d;
  })();

  const handleSkip = () => {
    navigate("/onboarding/kyc-details", { replace: true });
  };

  const isLoading = formik.isSubmitting || personalDetailsState.isLoading;

  return (
    <OnboardingLayout title="Personal Details" subtitle="Step 1 of 3">
      {loading ? (
        <div className="bg-amber-50 rounded-xl p-8 shadow-md text-center text-gray-500">Loading your details...</div>
      ) : (
      <form onSubmit={formik.handleSubmit} className="bg-amber-50 rounded-xl p-5 shadow-md space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="first_name"
              value={formik.values.first_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="First name"
              className={inputClass}
            />
            {formik.touched.first_name && formik.errors.first_name && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.first_name}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="last_name"
              value={formik.values.last_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Last name"
              className={inputClass}
            />
            {formik.touched.last_name && formik.errors.last_name && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.last_name}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={dateInputValue}
              onChange={(e) => formik.setFieldValue("dateOfBirth", e.target.value)}
              onBlur={formik.handleBlur}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <div className="flex gap-2">
              {["Male", "Female", "Other"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => formik.setFieldValue("gender", g)}
                  className={`flex-1 py-3 rounded-lg border font-medium transition ${
                    formik.values.gender === g ? "bg-amber-700 text-white border-amber-700" : "bg-white text-gray-700 border-gray-200 hover:border-amber-300"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Mobile Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              inputMode="numeric"
              name="mobile_no"
              readOnly
              disabled
              value={formik.values.mobile_no}
              className={`${inputClass} opacity-80 cursor-not-allowed`}
              maxLength={10}
            />
            {formik.touched.mobile_no && formik.errors.mobile_no && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.mobile_no}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Email"
              className={inputClass}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <textarea
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Address"
              rows={3}
              className={`${inputClass} min-h-[80px] py-3`}
            />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input
              type="text"
              name="city"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="City"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input
              type="text"
              name="stateName"
              value={formik.values.stateName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="State"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Pincode</label>
            <input
              type="text"
              inputMode="numeric"
              name="pincode"
              value={formik.values.pincode}
              onChange={(e) => formik.setFieldValue("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
              onBlur={formik.handleBlur}
              placeholder="Pincode"
              className={inputClass}
              maxLength={6}
            />
          </div>
        </div>

        <h3 className={subSectionTitleClass}>Nominee Details</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelClass}>Nominee Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="nominee_name"
              value={formik.values.nominee_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Nominee name"
              className={inputClass}
            />
            {formik.touched.nominee_name && formik.errors.nominee_name && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.nominee_name}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Relationship with Nominee <span className="text-red-500">*</span></label>
            <select
              name="relation_of_nominee"
              value={formik.values.relation_of_nominee}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${inputClass} appearance-none`}
            >
              <option value="">Select</option>
              <option value="Spouse">Spouse</option>
              <option value="Parent">Parent</option>
              <option value="Child">Child</option>
              <option value="Sibling">Sibling</option>
              <option value="Other">Other</option>
            </select>
            {formik.touched.relation_of_nominee && formik.errors.relation_of_nominee && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.relation_of_nominee}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Nominee Date of Birth</label>
            <input
              type="date"
              name="nomineeDob"
              value={formik.values.nomineeDob}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nominee Contact Number</label>
            <input
              type="tel"
              inputMode="numeric"
              name="nomineeContact"
              value={formik.values.nomineeContact}
              onChange={(e) => formik.setFieldValue("nomineeContact", e.target.value.replace(/\D/g, "").slice(0, 10))}
              onBlur={formik.handleBlur}
              placeholder="10-digit number"
              className={inputClass}
              maxLength={10}
            />
          </div>
          <div>
            <label className={labelClass}>Nominee Address</label>
            <textarea
              name="nomineeAddress"
              value={formik.values.nomineeAddress}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Address"
              rows={3}
              className={`${inputClass} min-h-[80px] py-3`}
            />
          </div>
        </div>

        {personalDetailsState.error && (
          <p className="text-red-600 text-sm mt-2">{personalDetailsState.error}</p>
        )}

        <FormFooterButtons
          onSubmit={() => formik.handleSubmit()}
          onSkip={handleSkip}
          submitLabel="Submit & Continue"
          skipLabel="Skip for now"
          isLoading={isLoading}
          submitDisabled={false}
        />
      </form>
      )}
    </OnboardingLayout>
  );
}
