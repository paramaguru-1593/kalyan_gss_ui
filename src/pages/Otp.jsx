import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Images from "../images/images";
import Constants from "../utils/constants";

export default function Otp() {
  const navigate = useNavigate();
  const location = useLocation();

  const mobileNumber = location.state?.mobile || "";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  const handleOtpChange = (value, index) => {
    if (value.length > 1) {
      // paste support
      const pasted = value.slice(0, 4).split("");
      const newOtp = [...otp];

      pasted.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });

      setOtp(newOtp);
      const nextIndex = Math.min(index + pasted.length, 3);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = () => {
    const otpString = otp.join("");

    if (otpString.length !== 4) return;

    if (otpString !== "1234") {
      alert("Invalid OTP. Use 1234 for testing.");
      return;
    }

    setLoading(true);
    if (mobileNumber) {
      if (!localStorage.getItem(Constants.localStorageKey.userId)) {
        localStorage.setItem(Constants.localStorageKey.userId, mobileNumber);
      }
      localStorage.setItem(Constants.localStorageKey.mobileNumber, mobileNumber);
    }
    const kycUpdated = location.state?.kycUpdated === true || (() => {
      try {
        return JSON.parse(localStorage.getItem(Constants.localStorageKey.kycUpdated) || "false");
      } catch (_) {
        return false;
      }
    })();
    setTimeout(() => {
      navigate(kycUpdated ? "/home" : "/user-details", { state: { mobile: mobileNumber } });
    }, 800);
  };

  const otpString = otp.join("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 to-white px-4 py-10">
      <div className="max-w-md mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center"
          >
            <FaArrowLeft />
          </button>
          <div className="w-10" />
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src={Images.KJLogo}
            alt="Logo"
            className="w-32 h-20 object-contain"
          />
        </div>

        <h2 className="text-center text-xl font-semibold text-amber-900 mb-4">
          Verify OTP
        </h2>

        {/* Card */}
        <div className="bg-amber-50 rounded-xl p-5 shadow-md">
          {/* Mobile number */}
          <div className="mb-6">
            <label className="block font-semibold text-gray-800 mb-2">
              Mobile Number
            </label>
            <input
              value={mobileNumber}
              disabled
              className="w-full h-14 px-4 rounded-lg border bg-gray-100 text-gray-500"
            />
          </div>

          {/* OTP */}
          <div className="mb-6">
            <label className="block font-semibold text-gray-800 mb-3">
              Enter 4-digit OTP
            </label>

            <div className="grid grid-cols-4 gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) =>
                    (inputRefs.current[index] = el)
                  }
                  value={digit}
                  maxLength={1}
                  onChange={(e) =>
                    handleOtpChange(
                      e.target.value,
                      index
                    )
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(e, index)
                  }
                  className={`flex-1 h-16 text-center text-2xl font-bold rounded-xl border-2
                    ${
                      digit
                        ? "border-red-700 bg-red-50"
                        : "border-gray-300"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={
              otpString.length !== 4 || loading
            }
            className={`w-full h-14 rounded-xl text-white font-semibold transition
              ${
                otpString.length === 4 && !loading
                  ? "bg-gradient-to-r from-red-700 to-red-800"
                  : "bg-gray-400"
              }`}
          >
            {loading
              ? "Verifying..."
              : "Sign in / Register"}
          </button>

          {/* Helper */}
          <p className="text-center text-xs text-amber-900 mt-4">
            Enter the OTP sent to your mobile number
            to sign in or create your account.
          </p>
        </div>
      </div>
    </div>
  );
}
