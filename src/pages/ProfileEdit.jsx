import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaUpload, FaCheckCircle } from "react-icons/fa";
import { getCustomerKycInfo, updateCustomerBankDetails } from "../api/apiHelper";
import Constants from "../utils/constants";

const inputClass =
  "w-full h-12 px-4 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";
const sectionTitleClass = "text-base font-semibold text-gray-900 mb-4";
const subSectionTitleClass = "text-sm font-semibold text-amber-800 mb-3";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const location = useLocation();

  // Personal Information
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Male");
  const [mobileNumber, setMobileNumber] = useState(localStorage.getItem('mobileNumber') || '');
  const [emailAddress, setEmailAddress] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");

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

  // KYC - Address Proof
  const [addressProofType, setAddressProofType] = useState("");
  const [addressProofNumber, setAddressProofNumber] = useState("");
  const [addressProofFile, setAddressProofFile] = useState(null);

  // Photograph & Signature
  const [customerPhotoFile, setCustomerPhotoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  // Nominee
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeRelationship, setNomineeRelationship] = useState("");
  const [nomineeDob, setNomineeDob] = useState("");
  const [nomineeAddress, setNomineeAddress] = useState("");
  const [nomineeContact, setNomineeContact] = useState("");

  // Bank Details
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountHolderNameBank, setAccountHolderNameBank] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankBookFile, setBankBookFile] = useState(""); // URL or base64 string for API
  const [bankBookFileObj, setBankBookFileObj] = useState(null); // for file input display
  const [nameMatchPercentage, setNameMatchPercentage] = useState("");

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
    { id: "identity", label: "Identity Proof" },
    { id: "kyc", label: "KYC Details" },
    { id: "bank", label: "Bank Details" },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("profile");
    const mobileFromAuth = localStorage.getItem(Constants.localStorageKey.mobileNumber) || "";
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setFullName(data.fullName || "");
        setDateOfBirth(data.dateOfBirth || "");
        setGender(data.gender || "Male");
        setMobileNumber(data.mobileNumber || mobileFromAuth || "");
        setEmailAddress(data.emailAddress || "");
        setAddress(data.address || "");
        setCity(data.city || "");
        setStateName(data.stateName || "");
        setPincode(data.pincode || "");
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
        setNomineeName(data.nomineeName || "");
        setNomineeRelationship(data.nomineeRelationship || "");
        setNomineeDob(data.nomineeDob || "");
        setNomineeAddress(data.nomineeAddress || "");
        setNomineeContact(data.nomineeContact || "");
      } catch (_) {}
    }
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
          if (cd.bank_details) {
            setBankAccountNo(cd.bank_details.bank_account_no ?? "");
            setAccountHolderName(cd.bank_details.account_holder_name ?? "");
            setAccountHolderNameBank(cd.bank_details.account_holder_name_bank ?? "");
            setIfscCode(cd.bank_details.ifsc_code ?? "");
            setNameMatchPercentage(cd.bank_details.name_match_percentage ?? "");
          }
        }
      })
      .catch(() => {})
      .finally(() => setKycLoading(false));
  }, []);

  const handleMobileChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobileNumber(v);
  };
  const handlePincodeChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(v);
  };
  const handleNomineeContactChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
    setNomineeContact(v);
  };

  const handleBankBookFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBankBookFileObj(file);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setBankBookFile(typeof dataUrl === "string" ? dataUrl : "");
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateBankDetails = async () => {
    const mobile = mobileNumber || localStorage.getItem(Constants.localStorageKey.mobileNumber) || "";
    if (!mobile || mobile.length !== 10) {
      setBankError("Mobile number is required.");
      return;
    }
    if (!bankAccountNo?.trim() || !accountHolderName?.trim() || !accountHolderNameBank?.trim() || !ifscCode?.trim() || !bankBookFile?.trim()) {
      setBankError("All bank fields including Bank Book Image are required.");
      return;
    }
    const num = Number(nameMatchPercentage);
    if (Number.isNaN(num) || num < 0 || num > 100) {
      setBankError("Name Match Percentage must be between 0 and 100.");
      return;
    }
    setBankError("");
    setBankLoading(true);
    try {
      const res = await updateCustomerBankDetails({
        mobile_no: mobile,
        bank_account_no: bankAccountNo.trim(),
        account_holder_name: accountHolderName.trim(),
        account_holder_name_bank: accountHolderNameBank.trim(),
        ifsc_code: ifscCode.trim(),
        file: bankBookFile,
        name_match_percentage: String(num),
      });
      if (res && res.status === 200) {
        setBankSuccess(true);
        setKycBankDisplay((prev) => ({
          ...prev,
          bank_details: {
            bank_account_no: bankAccountNo,
            account_holder_name: accountHolderName,
            account_holder_name_bank: accountHolderNameBank,
            ifsc_code: ifscCode,
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
  };

  const handleSave = async () => {
    const required =
      fullName &&
      dateOfBirth &&
      gender &&
      mobileNumber.length === 10 &&
      emailAddress.includes("@") &&
      address &&
      city &&
      stateName &&
      pincode.length === 6 &&
      identityProofType &&
      identityProofNumber;
    if (!required) return;

    setLoading(true);
    const profileData = {
      fullName,
      dateOfBirth,
      gender,
      mobileNumber,
      emailAddress,
      address,
      city,
      stateName,
      pincode,
      identityProofType,
      identityProofNumber,
      fatherOrHusbandName,
      motherName,
      maritalStatus,
      occupation,
      annualIncomeRange,
      sourceOfFunds,
      addressProofType,
      addressProofNumber,
      nomineeName,
      nomineeRelationship,
      nomineeDob,
      nomineeAddress,
      nomineeContact,
    };
    localStorage.setItem("profile", JSON.stringify(profileData));
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
    }, 800);
  };

  const dateInputValue = (() => {
    if (!dateOfBirth) return "";
    if (dateOfBirth.includes("/")) {
      const [d, m, y] = dateOfBirth.split("/");
      return y && m && d ? `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}` : dateOfBirth;
    }
    return dateOfBirth;
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div>
                <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Date of Birth <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateInputValue}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">📅</span>
                </div>
              </div>
              <div>
                <label className={labelClass}>Gender <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  {["Male", "Female", "Other"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 py-3 rounded-lg border font-medium transition ${
                        gender === g
                          ? "bg-amber-700 text-white border-amber-700"
                          : "bg-white text-gray-700 border-gray-200 hover:border-amber-300"
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
                  placeholder="10-digit mobile number"
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  className={inputClass}
                  maxLength={10}
                />
              </div>
              <div>
                <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  placeholder="Email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Address <span className="text-red-500">*</span></label>
                <textarea
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className={`${inputClass} min-h-[80px] py-3`}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>State <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="State"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Pincode <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Pincode"
                  value={pincode}
                  onChange={handlePincodeChange}
                  className={inputClass}
                  maxLength={6}
                />
              </div>
              </div>
              {/* Nominee fields merged into Personal Information */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-amber-800 mb-3">Nominee Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Nominee Name</label>
                    <input
                      type="text"
                      placeholder="Nominee name"
                      value={nomineeName}
                      onChange={(e) => setNomineeName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Relationship with Nominee</label>
                    <select
                      value={nomineeRelationship}
                      onChange={(e) => setNomineeRelationship(e.target.value)}
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="">Select</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Nominee Date of Birth</label>
                    <input
                      type="date"
                      value={nomineeDob}
                      onChange={(e) => setNomineeDob(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nominee Contact Number</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit number"
                      value={nomineeContact}
                      onChange={handleNomineeContactChange}
                      className={inputClass}
                      maxLength={10}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Nominee Address</label>
                    <textarea
                      placeholder="Address"
                      value={nomineeAddress}
                      onChange={(e) => setNomineeAddress(e.target.value)}
                      rows={3}
                      className={`${inputClass} min-h-[80px] py-3`}
                    />
                  </div>
                </div>
              </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className={`mt-6 w-full py-3 rounded-xl font-semibold text-white transition ${
                fullName && dateOfBirth && gender && mobileNumber.length === 10 &&
                emailAddress.includes("@") && address && city && stateName && pincode.length === 6 &&
                identityProofType && identityProofNumber && !loading
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </section>
          )}

          {/* Tab: Identity Proof Submission */}
          {activeTab === "identity" && (
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className={sectionTitleClass}>Identity Proof Submission</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Identity Proof Type <span className="text-red-500">*</span></label>
                <select
                  value={identityProofType}
                  onChange={(e) => setIdentityProofType(e.target.value)}
                  className={`${inputClass} appearance-none bg-no-repeat bg-right pr-10`}
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", backgroundSize: "1.5rem" }}
                >
                  <option value="PAN">PAN</option>
                  <option value="Aadhar">Aadhar</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Identity Proof Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Identity proof number"
                  value={identityProofNumber}
                  onChange={(e) => setIdentityProofNumber(e.target.value)}
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
                identityProofType && identityProofNumber && !loading
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {loading ? "Saving..." : "Save Identity Proof"}
            </button>
          </section>
          )}

          {/* Tab: KYC Details */}
          {activeTab === "kyc" && (
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className={sectionTitleClass}>KYC (Know Your Customer) Details</h2>
            <p className="text-sm text-gray-500 mb-4">Complete your KYC to comply with regulatory requirements.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div>
                <h3 className={subSectionTitleClass}>Additional Personal Details</h3>
                <div className="space-y-4 mb-6">
              <div>
                <label className={labelClass}>Father's / Husband's Name</label>
                <input
                  type="text"
                  placeholder="Name"
                  value={fatherOrHusbandName}
                  onChange={(e) => setFatherOrHusbandName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Mother's Name</label>
                <input
                  type="text"
                  placeholder="Name"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Marital Status</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Occupation</label>
                <input
                  type="text"
                  placeholder="Occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Annual Income Range</label>
                <select
                  value={annualIncomeRange}
                  onChange={(e) => setAnnualIncomeRange(e.target.value)}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">Select</option>
                  <option value="0-2L">0 - 2 Lakhs</option>
                  <option value="2-5L">2 - 5 Lakhs</option>
                  <option value="5-10L">5 - 10 Lakhs</option>
                  <option value="10L+">10 Lakhs +</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Source of Funds</label>
                <select
                  value={sourceOfFunds}
                  onChange={(e) => setSourceOfFunds(e.target.value)}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">Select</option>
                  <option value="Salary">Salary</option>
                  <option value="Business">Business</option>
                  <option value="Investments">Investments</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
              </div>

              <div>
            <h3 className={subSectionTitleClass}>Address Proof</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className={labelClass}>Address Proof Type</label>
                <select
                  value={addressProofType}
                  onChange={(e) => setAddressProofType(e.target.value)}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">Select</option>
                  <option value="Aadhar">Aadhar</option>
                  <option value="Passport">Passport</option>
                  <option value="Utility Bill">Utility Bill</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Address Proof Number</label>
                <input
                  type="text"
                  placeholder="Proof number"
                  value={addressProofNumber}
                  onChange={(e) => setAddressProofNumber(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg cursor-pointer transition font-medium w-full">
                  <FaUpload />
                  Upload Address Proof
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setAddressProofFile(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">{addressProofFile ? addressProofFile.name : "No file chosen"}</p>
              </div>
            </div>

            <h3 className={subSectionTitleClass}>Photograph & Signature</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg cursor-pointer transition font-medium w-full">
                  <FaUpload />
                  Upload Customer Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setCustomerPhotoFile(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">{customerPhotoFile ? customerPhotoFile.name : "No file chosen"}</p>
              </div>
              <div>
                <label className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg cursor-pointer transition font-medium w-full">
                  <FaUpload />
                  Upload Signature
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">{signatureFile ? signatureFile.name : "No file chosen"}</p>
              </div>
            </div>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className="mt-6 w-full py-3 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Saving..." : "Save KYC Details"}
            </button>
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
              <>
                {/* {kycBankDisplay?.bank_details && (
                  <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <h3 className="text-sm font-semibold text-amber-900 mb-2">Current bank details (from records)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-500">Account number:</span>
                      <span className="font-medium">{kycBankDisplay.bank_details.bank_account_no ?? "—"}</span>
                      <span className="text-gray-500">Account holder name:</span>
                      <span className="font-medium">{kycBankDisplay.bank_details.account_holder_name ?? "—"}</span>
                      <span className="text-gray-500">Name in bank:</span>
                      <span className="font-medium">{kycBankDisplay.bank_details.account_holder_name_bank ?? "—"}</span>
                      <span className="text-gray-500">IFSC:</span>
                      <span className="font-medium">{kycBankDisplay.bank_details.ifsc_code ?? "—"}</span>
                      <span className="text-gray-500">Name match %:</span>
                      <span className="font-medium">{kycBankDisplay.bank_details.name_match_percentage ?? "—"}</span>
                    </div>
                  </div>
                )} */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  <div>
                    <label className={labelClass}>Customer&apos;s Mobile Number <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit mobile"
                      value={mobileNumber}
                      onChange={handleMobileChange}
                      className={inputClass}
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Bank Account Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Account number"
                      value={bankAccountNo}
                      onChange={(e) => setBankAccountNo(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Account Holder Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Name as in records"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Account Holder Name In Bank <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Name as per bank"
                      value={accountHolderNameBank}
                      onChange={(e) => setAccountHolderNameBank(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>IFSC Code <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. ICIC0001234"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Name Match Percentage <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      placeholder="0–100"
                      value={nameMatchPercentage}
                      onChange={(e) => setNameMatchPercentage(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className={labelClass}>Bank Book Image <span className="text-red-500">*</span></label>
                    <p className="text-xs text-gray-500 mb-2">Upload image or paste image URL below. If you paste a URL, use the text field.</p>
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
                        value={bankBookFile && bankBookFile.startsWith("http") ? bankBookFile : ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setBankBookFile(v);
                          if (!v) setBankBookFileObj(null);
                        }}
                        className={inputClass}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {bankBookFileObj ? bankBookFileObj.name : bankBookFile ? (bankBookFile.startsWith("http") ? "URL entered" : "Image data loaded") : "No file or URL"}
                    </p>
                  </div>
                </div>

                {bankError && <p className="text-red-500 text-sm mt-2">{bankError}</p>}

                <button
                  type="button"
                  disabled={bankLoading}
                  onClick={handleUpdateBankDetails}
                  className="mt-4 w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {bankLoading ? "Updating..." : "Update Bank Details"}
                </button>
              </>
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
                navigate(-1);
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
