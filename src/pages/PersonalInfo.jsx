import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaUpload } from "react-icons/fa";

export default function PersonalInfo() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = location.state || {};
  const schemeType = params.schemeType || "DHAN SAMRIDDHI";
  const monthlyAmount = params.monthlyAmount || "5000";
  const userId = params.userId || "";

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [identityProofType, setIdentityProofType] =
    useState("");
  const [identityProofNumber, setIdentityProofNumber] =
    useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

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
      identityProofNumber &&
      selectedFile &&
      acceptTerms
    );
  };

  const handleContinue = () => {
    if (!isFormValid()) return;

    navigate("/review", {
      state: {
        schemeType,
        monthlyAmount,
        userId,
        fullName,
        dateOfBirth,
        gender,
        address,
        city,
        state: stateName,
        pincode,
        mobileNumber,
        emailAddress,
        identityProofType,
        identityProofNumber,
      },
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center"
        >
          <FaArrowLeft />
        </button>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-32 md:px-8">
        <div className="max-w-4xl mx-auto w-full">
            <div className="text-center mt-4 mb-6 md:mt-8 md:mb-10">
            <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl">👤</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold">
                Personal Information
            </h2>
            <p className="text-sm md:text-base text-gray-500 mt-2">
                Please fill in your details to proceed with enrollment
            </p>
            </div>

            <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
            {/* Full name */}
            <div className="md:col-span-1">
                <input
                placeholder="Full Name *"
                value={fullName}
                onChange={(e) =>
                    setFullName(e.target.value)
                }
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition"
                />
            </div>

            {/* DOB */}
            <div className="md:col-span-1">
                <input
                type="date"
                value={dateOfBirth}
                onChange={(e) =>
                    setDateOfBirth(e.target.value)
                }
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition"
                />
            </div>

            {/* Gender */}
            <div className="flex gap-2 md:col-span-2">
                {["Male", "Female", "Other"].map((g) => (
                <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-3 rounded-lg border font-medium transition
                    ${
                        gender === g
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                    {g}
                </button>
                ))}
            </div>

            <div className="md:col-span-1">
                <input
                placeholder="Mobile Number *"
                value={mobileNumber}
                maxLength={10}
                onChange={(e) =>
                    setMobileNumber(e.target.value)
                }
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition"
                />
            </div>

            <div className="md:col-span-1">
                <input
                placeholder="Email Address *"
                value={emailAddress}
                onChange={(e) =>
                    setEmailAddress(e.target.value)
                }
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition"
                />
            </div>

            <div className="md:col-span-2">
                <textarea
                placeholder="Address *"
                value={address}
                onChange={(e) =>
                    setAddress(e.target.value)
                }
                rows={3}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition resize-none"
                />
            </div>

            <div className="md:col-span-1">
                <input
                placeholder="City *"
                value={city}
                onChange={(e) =>
                    setCity(e.target.value)
                }
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition"
                />
            </div>

            <div className="md:col-span-1">
                <input
                placeholder="State *"
                value={stateName}
                onChange={(e) =>
                    setStateName(e.target.value)
                }
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition"
                />
            </div>

            <div className="md:col-span-2">
                <input
                placeholder="Pincode *"
                value={pincode}
                maxLength={6}
                onChange={(e) =>
                    setPincode(e.target.value)
                }
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition"
                />
            </div>

            {/* Identity proof */}
            <div className="md:col-span-1">
                <select
                value={identityProofType}
                onChange={(e) =>
                    setIdentityProofType(
                    e.target.value
                    )
                }
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition bg-white"
                >
                <option value="">
                    Select Identity Proof *
                </option>
                <option>PAN</option>
                <option>Aadhar</option>
                <option>Voter ID</option>
                </select>
            </div>

            <div className="md:col-span-1">
                <input
                placeholder="Identity Proof Number *"
                value={identityProofNumber}
                onChange={(e) =>
                    setIdentityProofNumber(
                    e.target.value
                    )
                }
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition"
                />
            </div>

            {/* File upload */}
            <div className="md:col-span-2">
                <label className="flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200 py-4 rounded-lg cursor-pointer hover:bg-red-100 transition border-dashed">
                <FaUpload />
                <span className="font-medium">Choose file</span>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                    setSelectedFile(
                        e.target.files[0]
                    )
                    }
                />
                </label>
                <p className="text-xs text-center text-gray-500 mt-2">
                {selectedFile
                    ? selectedFile.name
                    : "Upload a clear image of your identity proof"}
                </p>
            </div>

            {/* Terms */}
            <div className="md:col-span-2">
                <label className="flex items-start gap-2 mt-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) =>
                    setAcceptTerms(e.target.checked)
                    }
                    className="mt-1 accent-amber-600 w-4 h-4"
                />
                <span className="text-sm text-gray-600">
                    I accept the{" "}
                    <span className="text-amber-700 font-semibold hover:underline">
                    Terms and Conditions
                    </span>
                </span>
                </label>
            </div>
            </div>
        </div>
      </div>

      {/* Continue button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:static md:border-t-0 md:bg-transparent md:max-w-4xl md:mx-auto md:w-full md:px-8 md:pb-8">
        <button
          disabled={!isFormValid()}
          onClick={handleContinue}
          className={`w-full py-4 rounded-lg font-semibold transition-all shadow-lg md:shadow-none
            ${
              isFormValid()
                ? "bg-green-600 text-white hover:bg-green-700 shadow-green-200"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
