import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaArrowLeft, FaUpload, FaCheckCircle } from "react-icons/fa";
import { getCustomerKycInfo, updateCustomerBankDetails, updateCustomerKyc } from "../api/apiHelper";
import Constants from "../utils/constants";
import { updatePersonalDetails } from "../store/scheme/schemesApi";

const inputClass =
  "w-full h-12 px-4 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";
const sectionTitleClass = "text-base font-semibold text-gray-900 mb-4";
const subSectionTitleClass = "text-sm font-semibold text-amber-800 mb-3";

function getInitialPersonalValues() {
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

const personalValidationSchema = Yup.object({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  mobile_no: Yup.string().required("Mobile number is required").matches(/^\d{10}$/, "Must be 10 digits"),
  email: Yup.string().email("Valid email required").required("Email is required"),
  nominee_name: Yup.string().required("Nominee name is required"),
  relation_of_nominee: Yup.string().required("Relation is required"),
});

function getInitialKycValues() {
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

function getInitialBankValues() {
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

const kycValidationSchema = Yup.object({
  mobile_no: Yup.string().required("Mobile number is required").matches(/^\d{10}$/, "Must be 10 digits"),
  id_proof_type: Yup.number().oneOf([1, 2, 3, 7], "Invalid ID proof type").required("ID proof type is required"),
  id_proof_number: Yup.string().required("ID proof number is required").max(50, "Max 50 characters"),
  id_proof_front_side: Yup.string().required("ID proof front side image is required"),
});

const bankValidationSchema = Yup.object({
  mobile_no: Yup.string().required("Mobile number is required").matches(/^\d{10}$/, "Must be 10 digits"),
  bank_account_no: Yup.string().required("Bank account number is required").max(50),
  account_holder_name: Yup.string().required("Account holder name is required").max(255),
  account_holder_name_bank: Yup.string().required("Account holder name (bank) is required").max(255),
  ifsc_code: Yup.string().required("IFSC code is required").max(50),
  name_match_percentage: Yup.mixed()
    .required("Name match percentage is required")
    .test("range", "Must be 0–100", (v) => {
      const n = Number(v);
      return !Number.isNaN(n) && n >= 0 && n <= 100;
    }),
  file: Yup.string().required("Bank book image is required"),
});

export default function ProfileEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const personalDetailsState = useSelector((state) => state.scheme?.personalDetails ?? { isLoading: false, error: null });
  // Prefill from API when getCustomerKycInfo returns (for enableReinitialize)
  const [personalPrefill, setPersonalPrefill] = useState(null);
  const [kycPrefill, setKycPrefill] = useState(null);
  const [bankPrefill, setBankPrefill] = useState(null);

  const personalFormik = useFormik({
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
        setShowSuccess(true);
      }
    },
  });

  const kycFormik = useFormik({
    initialValues: { ...getInitialKycValues(), ...kycPrefill },
    validationSchema: kycValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setKycApiError("");
      setKycApiLoading(true);
      try {
        const res = await updateCustomerKyc({
          mobile_no: values.mobile_no,
          id_proof_type: values.id_proof_type,
          id_proof_front_side: values.id_proof_front_side,
          id_proof_back_side: values.id_proof_back_side || null,
          id_proof_number: values.id_proof_number.trim(),
        });
        if (res && res.status === 200) {
          setShowSuccess(true);
          const stored = localStorage.getItem("profile");
          const merged = stored
            ? { ...JSON.parse(stored), idProofType: values.id_proof_type, idProofNumber: values.id_proof_number.trim(), mobileNumber: values.mobile_no }
            : { idProofType: values.id_proof_type, idProofNumber: values.id_proof_number.trim(), mobileNumber: values.mobile_no };
          localStorage.setItem("profile", JSON.stringify(merged));
        } else {
          setKycApiError(res?.data?.message || "KYC Details Not Updated!!");
        }
      } catch (e) {
        setKycApiError(e?.message || "KYC Details Not Updated!!");
      } finally {
        setKycApiLoading(false);
      }
    },
  });

  const bankFormik = useFormik({
    initialValues: { ...getInitialBankValues(), ...bankPrefill },
    validationSchema: bankValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setBankError("");
      setBankLoading(true);
      try {
        const num = Number(values.name_match_percentage);
        const res = await updateCustomerBankDetails({
          mobile_no: values.mobile_no,
          bank_account_no: values.bank_account_no.trim(),
          account_holder_name: values.account_holder_name.trim(),
          account_holder_name_bank: values.account_holder_name_bank.trim(),
          ifsc_code: values.ifsc_code.trim(),
          file: values.file,
          name_match_percentage: String(Number.isNaN(num) ? 0 : num),
        });
        if (res && res.status === 200) {
          setBankSuccess(true);
          setKycBankDisplay((prev) => ({
            ...prev,
            bank_details: {
              bank_account_no: values.bank_account_no,
              account_holder_name: values.account_holder_name,
              account_holder_name_bank: values.account_holder_name_bank,
              ifsc_code: values.ifsc_code,
              name_match_percentage: String(num),
            },
          }));
        } else {
          setBankError(res?.data?.message || "Failed to update bank details.");
        }
      } catch (e) {
        setBankError(e?.message || "Failed to update bank details.");
      } finally {
        setBankLoading(false);
      }
    },
  });

  // Identity Proof
  const [identityProofType, setIdentityProofType] = useState("PAN");
  const [identityProofNumber, setIdentityProofNumber] = useState("");
  const [identityProofFile, setIdentityProofFile] = useState(null);

  // KYC - Additional Personal Details
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [occupation, setOccupation] = useState("");
  const [annualIncomeRange, setAnnualIncomeRange] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState("");

  // KYC - Address Proof (legacy/local)
  const [addressProofType, setAddressProofType] = useState("");
  const [addressProofNumber, setAddressProofNumber] = useState("");
  const [addressProofFile, setAddressProofFile] = useState(null);

  // KYC: file name display only (base64 lives in kycFormik)
  const [idProofFrontFileName, setIdProofFrontFileName] = useState("");
  const [idProofBackFileName, setIdProofBackFileName] = useState("");
  const [kycApiLoading, setKycApiLoading] = useState(false);
  const [kycApiError, setKycApiError] = useState("");


  // Photograph & Signature
  const [customerPhotoFile, setCustomerPhotoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  // Bank: file name display only (base64/URL lives in bankFormik)
  const [bankBookFileName, setBankBookFileName] = useState("");

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [kycLoading, setKycLoading] = useState(true);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankSuccess, setBankSuccess] = useState(false);
  const [bankError, setBankError] = useState("");
  const [kycBankDisplay, setKycBankDisplay] = useState(null); // { bank_details, kyc_details } from API
  const [activeTab, setActiveTab] = useState("personal"); // personal | identity | kyc | bank

  const tabs = [
    { id: "personal", label: "Personal" },
    // { id: "identity", label: "Identity Proof" },
    { id: "kyc", label: "KYC Details" },
    { id: "bank", label: "Bank Details" },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("profile");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setIdentityProofType(data.identityProofType || "PAN");
        setIdentityProofNumber(data.identityProofNumber || "");
        setFatherOrHusbandName(data.fatherOrHusbandName || "");
        setMotherName(data.motherName || "");
        setMaritalStatus(data.maritalStatus || "");
        setOccupation(data.occupation || "");
        setAnnualIncomeRange(data.annualIncomeRange || "");
        setSourceOfFunds(data.sourceOfFunds || "");
        setAddressProofType(data.addressProofType || "");
        setAddressProofNumber(data.addressProofNumber || "");
      } catch (_) {}
    }
    const mobileFromAuth = localStorage.getItem(Constants.localStorageKey.mobileNumber) || "";
    if (!mobileFromAuth && !stored) setKycLoading(false);
  }, []);

  // Fetch KYC/Bank details for display and prefill (mobile from localStorage so it runs after mount)
  useEffect(() => {
    let mobile = "";
    try {
      const stored = localStorage.getItem("profile");
      if (stored) mobile = JSON.parse(stored).mobileNumber || "";
      if (!mobile) mobile = localStorage.getItem(Constants.localStorageKey.mobileNumber) || "";
    } catch (_) {}
    if (!mobile || mobile.length < 10) {
      setKycLoading(false);
      return;
    }
    setKycLoading(true);
    getCustomerKycInfo(mobile)
      .then((res) => {
        if (res && res.status === 200 && res.data?.customer_details) {
          const cd = res.data.customer_details;
          setKycBankDisplay({ bank_details: cd.bank_details || null, kyc_details: cd.kyc_details || null });

          // Personal tab: first_name, last_name, mobile_no, email, gender, dateOfBirth, address (current)
          const addr = cd.address?.current_address || {};
          const genderVal = cd.gender ? String(cd.gender).charAt(0).toUpperCase() + String(cd.gender).slice(1) : "";
          setPersonalPrefill({
            first_name: cd.first_name ?? "",
            last_name: cd.last_name ?? "",
            mobile_no: cd.mobile_no ?? "",
            email: cd.emailId ?? "",
            gender: genderVal || "Male",
            dateOfBirth: cd.date_of_birth ?? "",
            address: addr.current_street ?? "",
            city: addr.current_city ?? "",
            stateName: addr.current_state ?? "",
            pincode: addr.current_pincode != null ? String(addr.current_pincode) : "",
          });

          // KYC tab: id_proof_type, id_proof_number, id_proof_front_side, id_proof_back_side (URLs from API satisfy "already uploaded")
          const kyc = cd.kyc_details;
          if (kyc) {
            const num = kyc.id_proof_type !== undefined ? Number(kyc.id_proof_type) : 1;
            const map = { 1: "PAN", 2: "Aadhar", 3: "Voter ID", 7: "Driving Licence" };
            setIdentityProofType(map[num] || "PAN");
            setKycPrefill({
              id_proof_type: num,
              id_proof_number: kyc.id_proof_number ?? "",
              id_proof_front_side: kyc.id_proof_front_side ?? "",
              id_proof_back_side: kyc.id_proof_back_side ?? "",
            });
          }

          // Bank tab: bank_account_no (may be masked), account_holder_name, ifsc_code, name_match_percentage
          if (cd.bank_details) {
            const b = cd.bank_details;
            setBankPrefill({
              bank_account_no: b.bank_account_no ?? "",
              account_holder_name: b.account_holder_name ?? "",
              account_holder_name_bank: b.account_holder_name_bank ?? "",
              ifsc_code: b.ifsc_code ?? "",
              name_match_percentage: b.name_match_percentage ?? "",
            });
          }
        }
      })
      .catch(() => {})
      .finally(() => setKycLoading(false));
  }, []);

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleKycFrontFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setKycApiError("");
    try {
      const base64 = await readFileAsBase64(file);
      console.log(file.name);
      
      kycFormik.setFieldValue("id_proof_front_side", file.name);
      setIdProofFrontFileName(file.name);
    } catch (_) {
      setKycApiError("Failed to read front image.");
    }
  };

  const handleKycBackFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setKycApiError("");
    try {
      const base64 = await readFileAsBase64(file);
      kycFormik.setFieldValue("id_proof_back_side", typeof base64 === "string" ? base64 : "");
      setIdProofBackFileName(file.name);
    } catch (_) {
      setKycApiError("Failed to read back image.");
    }
  };

  const handleBankBookFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBankBookFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      bankFormik.setFieldValue("file", file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const v = personalFormik.values;
    const fullNameVal = [v.first_name, v.last_name].filter(Boolean).join(" ");
    const required =
      fullNameVal &&
      v.dateOfBirth &&
      v.gender &&
      v.mobile_no.length === 10 &&
      v.email.includes("@") &&
      v.address &&
      v.city &&
      v.stateName &&
      v.pincode.length === 6 &&
      identityProofType &&
      identityProofNumber;
    if (!required) return;

    setLoading(true);
    const profileData = {
      first_name: v.first_name,
      last_name: v.last_name,
      fullName: fullNameVal,
      dateOfBirth: v.dateOfBirth,
      gender: v.gender,
      mobileNumber: v.mobile_no,
      emailAddress: v.email,
      address: v.address,
      city: v.city,
      stateName: v.stateName,
      pincode: v.pincode,
      identityProofType,
      identityProofNumber,
      idProofType: kycFormik.values.id_proof_type,
      idProofNumber: kycFormik.values.id_proof_number,
      fatherOrHusbandName,
      motherName,
      maritalStatus,
      occupation,
      annualIncomeRange,
      sourceOfFunds,
      addressProofType,
      addressProofNumber,
      nomineeName: v.nominee_name,
      nomineeRelationship: v.relation_of_nominee,
      nomineeDob: v.nomineeDob,
      nomineeAddress: v.nomineeAddress,
      nomineeContact: v.nomineeContact,
    };
    localStorage.setItem("profile", JSON.stringify(profileData));
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
    }, 800);
  };

  const dateInputValue = (() => {
    const d = personalFormik.values.dateOfBirth;
    if (!d) return "";
    if (d.includes("/")) {
      const [day, m, y] = d.split("/");
      return y && m && day ? `${y}-${m.padStart(2, "0")}-${day.padStart(2, "0")}` : d;
    }
    return d;
  })();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
      {/* Top bar - full width */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center w-full">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <FaArrowLeft />
        </button>
      </div>

      {/* Full screen grid layout */}
      <div className="flex-1 overflow-y-auto w-full px-4 md:px-6 py-6">
        {/* Header */}
        <div className="text-center mb-4 md:mb-6">
          <div className="w-16 h-16 mx-auto bg-sky-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-sky-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2a4 4 0 00-4 4v2a4 4 0 008 0V6a4 4 0 00-4-4zm-6 8a6 6 0 0112 0v5a6 6 0 01-12 0v-5z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Update your information by section.</p>
        </div>

        {/* Tabs */}
        <div className="w-full max-w-[1200px] mx-auto mb-4">
          <div className="flex gap-1 p-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? "bg-amber-600 text-white shadow"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-[1200px] mx-auto space-y-6">
          {/* Tab: Personal Information */}
          {activeTab === "personal" && (
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className={sectionTitleClass}>Personal Information</h2>
            <form onSubmit={personalFormik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div>
                  <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="first_name"
                    value={personalFormik.values.first_name}
                    onChange={personalFormik.handleChange}
                    onBlur={personalFormik.handleBlur}
                    placeholder="First name"
                    className={inputClass}
                  />
                  {personalFormik.touched.first_name && personalFormik.errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{personalFormik.errors.first_name}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="last_name"
                    value={personalFormik.values.last_name}
                    onChange={personalFormik.handleChange}
                    onBlur={personalFormik.handleBlur}
                    placeholder="Last name"
                    className={inputClass}
                  />
                  {personalFormik.touched.last_name && personalFormik.errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{personalFormik.errors.last_name}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={dateInputValue}
                      onChange={(e) => personalFormik.setFieldValue("dateOfBirth", e.target.value)}
                      onBlur={personalFormik.handleBlur}
                      className={`${inputClass} pr-10`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">📅</span>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <div className="flex gap-2">
                    {["Male", "Female", "Other"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => personalFormik.setFieldValue("gender", g)}
                        className={`flex-1 py-3 rounded-lg border font-medium transition ${
                          personalFormik.values.gender === g ? "bg-amber-700 text-white border-amber-700" : "bg-white text-gray-700 border-gray-200 hover:border-amber-300"
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
                    value={personalFormik.values.mobile_no}
                    onChange={(e) => personalFormik.setFieldValue("mobile_no", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onBlur={personalFormik.handleBlur}
                    placeholder="10-digit mobile number"
                    className={inputClass}
                    maxLength={10}
                  />
                  {personalFormik.touched.mobile_no && personalFormik.errors.mobile_no && (
                    <p className="text-red-500 text-sm mt-1">{personalFormik.errors.mobile_no}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={personalFormik.values.email}
                    onChange={personalFormik.handleChange}
                    onBlur={personalFormik.handleBlur}
                    placeholder="Email"
                    className={inputClass}
                  />
                  {personalFormik.touched.email && personalFormik.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{personalFormik.errors.email}</p>
                  )}
                </div>
                <div className="lg:col-span-2">
                  <label className={labelClass}>Address</label>
                  <textarea
                    name="address"
                    value={personalFormik.values.address}
                    onChange={personalFormik.handleChange}
                    onBlur={personalFormik.handleBlur}
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
                    value={personalFormik.values.city}
                    onChange={personalFormik.handleChange}
                    onBlur={personalFormik.handleBlur}
                    placeholder="City"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input
                    type="text"
                    name="stateName"
                    value={personalFormik.values.stateName}
                    onChange={personalFormik.handleChange}
                    onBlur={personalFormik.handleBlur}
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
                    value={personalFormik.values.pincode}
                    onChange={(e) => personalFormik.setFieldValue("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onBlur={personalFormik.handleBlur}
                    placeholder="Pincode"
                    className={inputClass}
                    maxLength={6}
                  />
                </div>
              </div>

              <h3 className={subSectionTitleClass}>Nominee Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nominee Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="nominee_name"
                    value={personalFormik.values.nominee_name}
                    onChange={personalFormik.handleChange}
                    onBlur={personalFormik.handleBlur}
                    placeholder="Nominee name"
                    className={inputClass}
                  />
                  {personalFormik.touched.nominee_name && personalFormik.errors.nominee_name && (
                    <p className="text-red-500 text-sm mt-1">{personalFormik.errors.nominee_name}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Relationship with Nominee <span className="text-red-500">*</span></label>
                  <select
                    name="relation_of_nominee"
                    value={personalFormik.values.relation_of_nominee}
                    onChange={personalFormik.handleChange}
                    onBlur={personalFormik.handleBlur}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="">Select</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other</option>
                  </select>
                  {personalFormik.touched.relation_of_nominee && personalFormik.errors.relation_of_nominee && (
                    <p className="text-red-500 text-sm mt-1">{personalFormik.errors.relation_of_nominee}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Nominee Date of Birth</label>
                  <input
                    type="date"
                    name="nomineeDob"
                    value={personalFormik.values.nomineeDob}
                    onChange={personalFormik.handleChange}
                    onBlur={personalFormik.handleBlur}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Nominee Contact Number</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    name="nomineeContact"
                    value={personalFormik.values.nomineeContact}
                    onChange={(e) => personalFormik.setFieldValue("nomineeContact", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onBlur={personalFormik.handleBlur}
                    placeholder="10-digit number"
                    className={inputClass}
                    maxLength={10}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Nominee Address</label>
                  <textarea
                    name="nomineeAddress"
                    value={personalFormik.values.nomineeAddress}
                    onChange={personalFormik.handleChange}
                    onBlur={personalFormik.handleBlur}
                    placeholder="Address"
                    rows={3}
                    className={`${inputClass} min-h-[80px] py-3`}
                  />
                </div>
              </div>

              {personalDetailsState.error && (
                <p className="text-red-600 text-sm mt-2">{personalDetailsState.error}</p>
              )}
              <button
                type="submit"
                disabled={personalFormik.isSubmitting || personalDetailsState.isLoading}
                className="mt-6 w-full py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition"
              >
                {personalFormik.isSubmitting || personalDetailsState.isLoading ? "Saving..." : "Save Personal Information"}
              </button>
            </form>
          </section>
          )}

          {/* Tab: Identity Proof Submission */}
          {/* {activeTab === "identity" && (
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className={sectionTitleClass}>Identity Proof Submission</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Identity Proof Type <span className="text-red-500">*</span></label>
                <select
                  value={kycFormik.values.id_proof_type}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    kycFormik.setFieldValue("id_proof_type", v);
                    const map = { 1: "PAN", 2: "Aadhar", 3: "Voter ID", 7: "Driving Licence" };
                    setIdentityProofType(map[v] || "PAN");
                  }}
                  className={`${inputClass} appearance-none bg-no-repeat bg-right pr-10`}
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", backgroundSize: "1.5rem" }}
                >
                  <option value={1}>PAN</option>
                  <option value={3}>Voter ID</option>
                  <option value={7}>Driving Licence</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Identity Proof Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Identity proof number"
                  value={kycFormik.values.id_proof_number}
                  onChange={(e) => kycFormik.setFieldValue("id_proof_number", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload document</label>
                <label className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg cursor-pointer transition font-medium">
                  <FaUpload />
                  Choose file
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={(e) => setIdentityProofFile(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  {identityProofFile ? identityProofFile.name : "No file chosen"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  File size should be less than 500kb and only type of images (PNG, JPG, JPEG) are allowed.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className={`mt-6 w-full py-3 rounded-xl font-semibold text-white transition ${
                kycFormik.values.id_proof_type && kycFormik.values.id_proof_number?.trim() && !loading
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {loading ? "Saving..." : "Save Identity Proof"}
            </button>
          </section>
          )} */}

          {/* Tab: KYC Details (customerkycupdation API) */}
          {activeTab === "kyc" && (
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className={sectionTitleClass}>KYC (Know Your Customer) Details</h2>
            <p className="text-sm text-gray-500 mb-4">ID proof details for KYC creation and updation.</p>

            <form onSubmit={kycFormik.handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Customer&apos;s Mobile Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  name="mobile_no"
                  value={kycFormik.values.mobile_no}
                  onChange={(e) => kycFormik.setFieldValue("mobile_no", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onBlur={kycFormik.handleBlur}
                  className={inputClass}
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
                  <option value={1}>Pan Card</option>
                  <option value={3}>Voter</option>
                  <option value={7}>Driving Licence</option>
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
                  <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleKycFrontFile} />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  {idProofFrontFileName || (kycFormik.values.id_proof_front_side && !kycFormik.values.id_proof_front_side.startsWith("data:") ? "Already uploaded" : "No file chosen")}
                </p>
                {kycFormik.touched.id_proof_front_side && kycFormik.errors.id_proof_front_side && (
                  <p className="text-red-500 text-sm mt-1">{kycFormik.errors.id_proof_front_side}</p>
                )}
              </div>

              {kycApiError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{kycApiError}</div>
              )}

              <button
                type="submit"
                disabled={kycApiLoading || kycFormik.isSubmitting}
                className="mt-6 w-full py-3 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {kycApiLoading || kycFormik.isSubmitting ? "Updating..." : "Save KYC Details"}
              </button>
            </form>
          </section>
          )}

          {/* Tab: Bank Details */}
          {activeTab === "bank" && (
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className={sectionTitleClass}>Bank Details</h2>
            <p className="text-sm text-gray-500 mb-4">Update your bank account information for payments and redemption.</p>

            {kycLoading ? (
              <div className="text-gray-500 py-4">Loading bank details...</div>
            ) : (
              <form onSubmit={bankFormik.handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  <div>
                    <label className={labelClass}>Customer&apos;s Mobile Number <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit mobile"
                      name="mobile_no"
                      value={bankFormik.values.mobile_no}
                      onChange={(e) => bankFormik.setFieldValue("mobile_no", e.target.value.replace(/\D/g, "").slice(0, 10))}
                      onBlur={bankFormik.handleBlur}
                      className={inputClass}
                      maxLength={10}
                    />
                    {bankFormik.touched.mobile_no && bankFormik.errors.mobile_no && (
                      <p className="text-red-500 text-sm mt-1">{bankFormik.errors.mobile_no}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Bank Account Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="bank_account_no"
                      placeholder="Account number"
                      value={bankFormik.values.bank_account_no}
                      onChange={bankFormik.handleChange}
                      onBlur={bankFormik.handleBlur}
                      className={inputClass}
                    />
                    {bankFormik.touched.bank_account_no && bankFormik.errors.bank_account_no && (
                      <p className="text-red-500 text-sm mt-1">{bankFormik.errors.bank_account_no}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Account Holder Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="account_holder_name"
                      placeholder="Name as in records"
                      value={bankFormik.values.account_holder_name}
                      onChange={bankFormik.handleChange}
                      onBlur={bankFormik.handleBlur}
                      className={inputClass}
                    />
                    {bankFormik.touched.account_holder_name && bankFormik.errors.account_holder_name && (
                      <p className="text-red-500 text-sm mt-1">{bankFormik.errors.account_holder_name}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Account Holder Name In Bank <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="account_holder_name_bank"
                      placeholder="Name as per bank"
                      value={bankFormik.values.account_holder_name_bank}
                      onChange={bankFormik.handleChange}
                      onBlur={bankFormik.handleBlur}
                      className={inputClass}
                    />
                    {bankFormik.touched.account_holder_name_bank && bankFormik.errors.account_holder_name_bank && (
                      <p className="text-red-500 text-sm mt-1">{bankFormik.errors.account_holder_name_bank}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>IFSC Code <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="ifsc_code"
                      placeholder="e.g. ICIC0001234"
                      value={bankFormik.values.ifsc_code}
                      onChange={(e) => bankFormik.setFieldValue("ifsc_code", e.target.value.toUpperCase())}
                      onBlur={bankFormik.handleBlur}
                      className={inputClass}
                    />
                    {bankFormik.touched.ifsc_code && bankFormik.errors.ifsc_code && (
                      <p className="text-red-500 text-sm mt-1">{bankFormik.errors.ifsc_code}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Name Match Percentage <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="name_match_percentage"
                      min={0}
                      max={100}
                      step={0.01}
                      placeholder="0–100"
                      value={bankFormik.values.name_match_percentage}
                      onChange={bankFormik.handleChange}
                      onBlur={bankFormik.handleBlur}
                      className={inputClass}
                    />
                    {bankFormik.touched.name_match_percentage && bankFormik.errors.name_match_percentage && (
                      <p className="text-red-500 text-sm mt-1">{bankFormik.errors.name_match_percentage}</p>
                    )}
                  </div>
                  <div className="lg:col-span-2">
                    <label className={labelClass}>Bank Book Image <span className="text-red-500">*</span></label>
                    <p className="text-xs text-gray-500 mb-2">Upload image or paste image URL below.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg cursor-pointer transition font-medium shrink-0">
                        <FaUpload />
                        Choose file
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          className="hidden"
                          onChange={handleBankBookFile}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Or enter image URL (if applicable)"
                        value={bankFormik.values.file && bankFormik.values.file.startsWith("http") ? bankFormik.values.file : ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          bankFormik.setFieldValue("file", v);
                          if (!v) setBankBookFileName("");
                        }}
                        className={inputClass}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {bankBookFileName ? bankBookFileName : bankFormik.values.file?.startsWith("http") ? "URL entered" : bankFormik.values.file ? "Image data loaded" : "No file or URL"}
                    </p>
                    {bankFormik.touched.file && bankFormik.errors.file && (
                      <p className="text-red-500 text-sm mt-1">{bankFormik.errors.file}</p>
                    )}
                  </div>
                </div>

                {bankError && <p className="text-red-500 text-sm mt-2">{bankError}</p>}

                <button
                  type="submit"
                  disabled={bankLoading || bankFormik.isSubmitting}
                  className="mt-4 w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {bankLoading || bankFormik.isSubmitting ? "Updating..." : "Update Bank Details"}
                </button>
              </form>
            )}
          </section>
          )}
        </div>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full">
            <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Profile Updated Successfully!</h3>
            <button
              onClick={() => {
                setShowSuccess(false);
                // navigate(-1);
              }}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-medium"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Bank details success modal */}
      {bankSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full">
            <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Bank Details Updated Successfully!</h3>
            <button
              onClick={() => setBankSuccess(false)}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-medium"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
