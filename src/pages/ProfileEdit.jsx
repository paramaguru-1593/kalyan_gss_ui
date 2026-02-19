import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaUpload, FaCheckCircle } from "react-icons/fa";

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
  const [mobileNumber, setMobileNumber] = useState("");
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

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("profile");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setFullName(data.fullName || "");
        setDateOfBirth(data.dateOfBirth || "");
        setGender(data.gender || "Male");
        setMobileNumber(data.mobileNumber || "");
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
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
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
        <div className="text-center mb-6 md:mb-8">
          <div className="w-16 h-16 mx-auto bg-sky-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-sky-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2a4 4 0 00-4 4v2a4 4 0 008 0V6a4 4 0 00-4-4zm-6 8a6 6 0 0112 0v5a6 6 0 01-12 0v-5z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Update your personal information.</p>
        </div>

        <div className="w-full max-w-[1200px] mx-auto space-y-6">
          {/* Personal Information */}
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
            {/* </div> */}
          </section>

          {/* Identity Proof Submission */}
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
          </section>

          {/* KYC Details - spans both columns on xl or full width on single column */}
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 xl:col-span-2">
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
          </section>

          {/* Nominee details merged into Personal Information above; section removed */}
        </div>
      </div>

      {/* Save button - fixed at bottom, full width */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 w-full">
        <button
          disabled={
            loading ||
            !fullName ||
            !dateOfBirth ||
            !gender ||
            mobileNumber.length !== 10 ||
            !emailAddress.includes("@") ||
            !address ||
            !city ||
            !stateName ||
            pincode.length !== 6 ||
            !identityProofType ||
            !identityProofNumber
          }
          onClick={handleSave}
          className={`w-full py-4 rounded-xl font-semibold text-white transition ${
            fullName && dateOfBirth && gender && mobileNumber.length === 10 &&
            emailAddress.includes("@") && address && city && stateName && pincode.length === 6 &&
            identityProofType && identityProofNumber && !loading
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
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
    </div>
  );
}
