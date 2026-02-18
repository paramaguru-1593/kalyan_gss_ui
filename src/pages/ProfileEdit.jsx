import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUpload, FaCheckCircle } from "react-icons/fa";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = location.state || {};

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [identityProofType, setIdentityProofType] = useState("");
  const [identityProofNumber, setIdentityProofNumber] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load profile from localStorage
  useEffect(() => {
    const storedProfile = localStorage.getItem("profile");
    if (storedProfile) {
      const data = JSON.parse(storedProfile);
      setFullName(data.fullName || "");
      setEmailAddress(data.emailAddress || "");
      setAddress(data.address || "");
      setCity(data.city || "");
      setStateName(data.stateName || "");
      setPincode(data.pincode || "");
      setGender(data.gender || "");
      setMobileNumber(data.mobileNumber || "");
      setIdentityProofType(data.identityProofType || "");
      setIdentityProofNumber(data.identityProofNumber || "");
      setDateOfBirth(data.dateOfBirth || "");
    }
  }, []);

  const isFormValid = () => {
    return (
      fullName &&
      dateOfBirth &&
      gender &&
      address &&
      city &&
      stateName &&
      pincode.length === 6 &&
      mobileNumber.length === 10 &&
      emailAddress.includes("@") &&
      identityProofType &&
      identityProofNumber
    );
  };

  const handleSave = async () => {
    if (!isFormValid()) return;

    setLoading(true);

    const profileData = {
      fullName,
      dateOfBirth,
      gender,
      address,
      city,
      stateName,
      pincode,
      mobileNumber,
      emailAddress,
      identityProofType,
      identityProofNumber,
    };

    localStorage.setItem("profile", JSON.stringify(profileData));

    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-32">
        <div className="text-center mt-4 mb-6">
          <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
            <span className="text-2xl">👤</span>
          </div>
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <p className="text-sm text-gray-500">
            Update your personal information
          </p>
        </div>

        <div className="space-y-4">
          <input
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full border p-3 rounded"
          />

          {/* Gender */}
          <div className="flex gap-2">
            {["Male", "Female", "Other"].map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-3 rounded border ${
                  gender === g
                    ? "bg-amber-600 text-white"
                    : "bg-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <input
            placeholder="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <input
            placeholder="Email Address"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <textarea
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <input
            placeholder="State"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <input
            placeholder="Pincode"
            value={pincode}
            maxLength={6}
            onChange={(e) => setPincode(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <select
            value={identityProofType}
            onChange={(e) => setIdentityProofType(e.target.value)}
            className="w-full border p-3 rounded"
          >
            <option value="">Select Identity Proof</option>
            <option>PAN</option>
            <option>Aadhar</option>
            <option>Voter ID</option>
          </select>

          <input
            placeholder="Identity Proof Number"
            value={identityProofNumber}
            onChange={(e) => setIdentityProofNumber(e.target.value)}
            className="w-full border p-3 rounded"
          />

          {/* File upload */}
          <div>
            <label className="flex items-center justify-center gap-2 bg-red-700 text-white py-3 rounded cursor-pointer">
              <FaUpload />
              Choose file
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setSelectedFile(e.target.files[0])
                }
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              {selectedFile
                ? selectedFile.name
                : "No file chosen"}
            </p>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          disabled={!isFormValid() || loading}
          onClick={handleSave}
          className={`w-full py-4 rounded-lg font-semibold ${
            isFormValid()
              ? "bg-green-600 text-white"
              : "bg-gray-300"
          }`}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full">
            <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Profile Updated Successfully!
            </h3>
            <button
              onClick={() => {
                setShowSuccess(false);
                navigate(-1);
              }}
              className="w-full bg-amber-600 text-white py-3 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
