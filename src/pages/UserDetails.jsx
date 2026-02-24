import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaArrowLeft, FaUpload } from "react-icons/fa";
import Images from "../images/images";
import Constants from "../utils/constants";
import { updateCustomerKyc } from "../api/apiHelper";

const inputClass =
  "w-full h-12 px-4 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";
const sectionTitleClass = "text-base font-semibold text-gray-900 mb-4";

// API: id_proof_type 1=Pan, 2=Aadhar, 3=Voter, 7=Driving Licence
const ID_PROOF_OPTIONS = [
  { value: 1, label: "Pan Card" },
  { value: 3, label: "Voter" },
  { value: 7, label: "Driving Licence" },
];

function getInitialKycValues() {
  try {
    const m = localStorage.getItem(Constants.localStorageKey.mobileNumber) || "";
    const s = localStorage.getItem("profile");
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

const kycValidationSchema = Yup.object({
  mobile_no: Yup.string().required("Mobile number is required").matches(/^\d{10}$/, "Must be 10 digits"),
  id_proof_type: Yup.number().oneOf([1, 2, 3, 7], "Invalid ID proof type").required("ID proof type is required"),
  id_proof_number: Yup.string().required("ID proof number is required").max(50, "Max 50 characters"),
  id_proof_front_side: Yup.string().required("ID proof front side image is required"),
});

export default function UserDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const [idProofFrontFileName, setIdProofFrontFileName] = useState("");
  const [idProofBackFileName, setIdProofBackFileName] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [kycUpdated, setKycUpdated] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(Constants.localStorageKey.kycUpdated) || "false");
    } catch (_) {
      return false;
    }
  });

  const mobileFromState = location.state?.mobile || "";
  const kycFormik = useFormik({
    initialValues: {
      ...getInitialKycValues(),
      ...(mobileFromState ? { mobile_no: String(mobileFromState).replace(/\D/g, "").slice(0, 10) } : {}),
    },
    validationSchema: kycValidationSchema,
    onSubmit: async (values) => {
      setApiError("");
      setApiLoading(true);
      try {
        const res = await updateCustomerKyc({
          mobile_no: values.mobile_no,
          id_proof_type: values.id_proof_type,
          id_proof_front_side: values.id_proof_front_side,
          id_proof_back_side: values.id_proof_back_side || null,
          id_proof_number: values.id_proof_number.trim(),
        });
        if (res && res.status === 200) {
          const profileData = {
            idProofType: values.id_proof_type,
            idProofNumber: values.id_proof_number.trim(),
            mobileNumber: values.mobile_no,
          };
          const existing = localStorage.getItem("profile");
          const merged = existing ? { ...JSON.parse(existing), ...profileData } : profileData;
          localStorage.setItem("profile", JSON.stringify(merged));
          localStorage.setItem(Constants.localStorageKey.kycUpdated, JSON.stringify(true));
          navigate("/home");
        } else {
          setApiError(res?.data?.message || "KYC Details Not Updated!!");
        }
      } catch (e) {
        setApiError(e?.message || "KYC Details Not Updated!!");
      } finally {
        setApiLoading(false);
      }
    },
  });

  // If login API returned kycUpdated: true, skip this page and go to home
  useEffect(() => {
    if (kycUpdated) {
      navigate("/home", { replace: true });
    }
  }, [kycUpdated, navigate]);

  if (kycUpdated) {
    return null;
  }

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFrontFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setApiError("");
    try {
      const base64 = await readFileAsBase64(file);
      kycFormik.setFieldValue("id_proof_front_side", file.name);
      setIdProofFrontFileName(file.name);
    } catch (_) {
      setApiError("Failed to read front image.");
    }
  };

  const handleBackFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setApiError("");
    try {
      const base64 = await readFileAsBase64(file);
      kycFormik.setFieldValue("id_proof_back_side", typeof base64 === "string" ? base64 : "");
      setIdProofBackFileName(file.name);
    } catch (_) {
      setApiError("Failed to read back image.");
    }
  };

  const handleSkip = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 to-white px-4 py-8 pb-24">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center">
            <FaArrowLeft />
          </button>
          <div className="w-10" />
        </div>

        <div className="flex justify-center mb-4">
          <img src={Images.KJLogo} alt="Logo" className="w-32 h-20 object-contain" />
        </div>

        <h2 className="text-center text-xl font-semibold text-amber-900 mb-1">KYC Details</h2>
        {/* <p className="text-center text-sm text-amber-800/80 mb-4">
          Submit your ID proof for verification. All fields are mandatory except back side image.
        </p> */}

        <form onSubmit={kycFormik.handleSubmit} className="bg-amber-50 rounded-xl p-5 shadow-md space-y-4">
          <div>
            <label className={labelClass}>Customer&apos;s Mobile Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              inputMode="numeric"
              value={kycFormik.values.mobile_no}
              onChange={(e) => kycFormik.setFieldValue("mobile_no", e.target.value.replace(/\D/g, "").slice(0, 10))}
              onBlur={kycFormik.handleBlur}
              className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 opacity-80 cursor-not-allowed"
              readOnly
              disabled={true}
              maxLength={10}
            />
            {kycFormik.touched.mobile_no && kycFormik.errors.mobile_no && (
              <p className="text-red-500 text-sm mt-1">{kycFormik.errors.mobile_no}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>ID Proof Type <span className="text-red-500">*</span></label>
            <select
              name="id_proof_type"
              value={kycFormik.values.id_proof_type}
              onChange={kycFormik.handleChange}
              onBlur={kycFormik.handleBlur}
              className={`${inputClass} appearance-none`}
            >
              {ID_PROOF_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {kycFormik.touched.id_proof_type && kycFormik.errors.id_proof_type && (
              <p className="text-red-500 text-sm mt-1">{kycFormik.errors.id_proof_type}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>ID Proof Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="id_proof_number"
              placeholder="e.g. PAN / Aadhar number"
              value={kycFormik.values.id_proof_number}
              onChange={kycFormik.handleChange}
              onBlur={kycFormik.handleBlur}
              className={inputClass}
              maxLength={50}
            />
            {kycFormik.touched.id_proof_number && kycFormik.errors.id_proof_number && (
              <p className="text-red-500 text-sm mt-1">{kycFormik.errors.id_proof_number}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>ID Proof Front Side Image <span className="text-red-500">*</span></label>
            <label className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg cursor-pointer transition font-medium">
              <FaUpload /> Choose file
              <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleFrontFile} />
            </label>
            <p className="text-xs text-gray-500 mt-2">{idProofFrontFileName || "No file chosen"}</p>
            {kycFormik.touched.id_proof_front_side && kycFormik.errors.id_proof_front_side && (
              <p className="text-red-500 text-sm mt-1">{kycFormik.errors.id_proof_front_side}</p>
            )}
          </div>

          {/* <div>
            <label className={labelClass}>ID Proof Back Side Image (optional)</label>
            <label className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg cursor-pointer transition font-medium">
              <FaUpload /> Choose file
              <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleBackFile} />
            </label>
            <p className="text-xs text-gray-500 mt-2">{idProofBackFileName || "No file chosen"}</p>
          </div> */}

          {apiError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{apiError}</div>
          )}

          <button
            type="submit"
            disabled={apiLoading || kycFormik.isSubmitting}
            className={`w-full h-14 rounded-xl text-white font-semibold transition ${
              !apiLoading && !kycFormik.isSubmitting
                ? "bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {apiLoading || kycFormik.isSubmitting ? "Updating..." : "Save & Continue"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button type="button" onClick={handleSkip} className="text-amber-800 font-medium underline hover:no-underline">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
