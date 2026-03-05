import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Images from "../images/images";
import Constants from "../utils/constants";
import { sendOtp, verifyOtp } from "../api/apiHelper";

export default function Otp() {
  const navigate = useNavigate();
  const location = useLocation();

  const mobileNumber = location.state?.mobile || "";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0); // seconds remaining; 0 = can resend

  const inputRefs = useRef([]);

  // Countdown timer: decrement every second until 0
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const startCountdown = (expiresInSeconds) => {
    const sec = typeof expiresInSeconds === "number" && expiresInSeconds > 0
      ? expiresInSeconds
      : 300;
    setCountdown(sec);
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Call sendOtp once when entering OTP page after login
  useEffect(() => {
    if (!mobileNumber) return;
    let cancelled = false;

    (async () => {
      setError("");
      setInfo("");
      try {
        const response = await sendOtp(mobileNumber);
        if (cancelled) return;
        if (response?.data?.success) {
          setInfo(response.data.message || "OTP sent successfully.");
          startCountdown(response.data?.data?.expires_in_seconds);
        } else if (response?.data) {
          setError(response.data.message || "Failed to send OTP. Please try again.");
        }
      } catch (_e) {
        if (!cancelled) {
          setError("Failed to send OTP. Please try again.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mobileNumber]);

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

  const handleVerify = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 4) return;

    if (!mobileNumber) return;

    setError("");
    setInfo("");
    setLoading(true);
    try {
      const response = await verifyOtp(mobileNumber, otpString);
      if (response?.data?.success) {
        if (mobileNumber) {
          if (!localStorage.getItem(Constants.localStorageKey.userId)) {
            localStorage.setItem(Constants.localStorageKey.userId, mobileNumber);
          }
          localStorage.setItem(Constants.localStorageKey.mobileNumber, mobileNumber);
        }
        const kycUpdated =
          location.state?.kycUpdated === true ||
          (() => {
            try {
              return JSON.parse(localStorage.getItem(Constants.localStorageKey.kycUpdated) || "false");
            } catch (_) {
              return false;
            }
          })();
        setInfo(response.data.message || "OTP verified successfully.");
        setTimeout(() => {
          navigate(kycUpdated ? "/home" : "/onboarding/personal-details", { state: { mobile: mobileNumber } });
        }, 800);
      } else {
        const message =
          response?.data?.message ||
          (response?.data?.error === "INVALID_OTP" ? "Invalid OTP. Please try again." : "Verification failed. Please try again.");
        setError(message);
      }
    } catch (e) {
      setError(e?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!mobileNumber) return;
    setError("");
    setInfo("");
    setOtp(["", "", "", ""]);
    setResendLoading(true);
    try {
      const response = await sendOtp(mobileNumber);
      if (response?.data?.success) {
        setInfo(response.data.message || "OTP sent successfully.");
        startCountdown(response.data?.data?.expires_in_seconds);
      } else {
        setError(response?.data?.message || "Failed to send OTP. Please try again.");
      }
    } catch (e) {
      setError(e?.message || "Failed to send OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
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
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {info}
            </div>
          )}
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
            onClick={handleVerify}
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
              : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || !mobileNumber || countdown > 0}
            className={`w-full h-10 mt-3 rounded-xl font-semibold border text-sm transition ${
              countdown > 0 || resendLoading || !mobileNumber
                ? "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                : "border-red-700 text-red-700 bg-white"
            }`}
          >
            {resendLoading
              ? "Resending..."
              : countdown > 0
                ? `Resend OTP (${formatTimer(countdown)})`
                : "Resend OTP"}
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
