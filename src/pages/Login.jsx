import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Images from "../images/images";
import { POST } from "../api/apiHelper";
import ApiEndpoints from "../api/apiEndPoints";
import Constants from "../utils/constants";

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobile(value);
    setError("");
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (mobile.length !== 10) return;
    setError("");
    setLoading(true);
    const response = await POST(ApiEndpoints.login, { mobile_number: mobile });
    setLoading(false);
    
    if (response?.data?.status === "success" && response?.data?.token) {
      localStorage.setItem(Constants.localStorageKey.accessToken, response.data.token);
      localStorage.setItem(Constants.localStorageKey.mobileNumber, response.data.mobile_number || mobile);
      localStorage.setItem(Constants.localStorageKey.tokenType, "Bearer");
      console.log(response.data);
      
      const kycUpdated = response.data.kyc_updated === true;
      localStorage.setItem(Constants.localStorageKey.kycUpdated, JSON.stringify(kycUpdated));
      navigate("/otp", { state: { mobile, kycUpdated } });
    } else {
      setError(response?.data?.message || "Login failed. Please try again.");
    }
  };

  const isMobileValid = mobile.length === 10;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        {/* Logo */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="w-40 h-20 md:w-56 md:h-28 flex items-center justify-center transition-transform hover:scale-105 duration-300">
            <img
              src={Images.KJLogo}
              alt="Logo"
              className=" w-[5rem] h-[5rem] md:w-[6rem] md:h-[6rem] object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl md:text-2xl font-semibold text-amber-900 mb-6 md:mb-8">
          Login to your Account
        </h2>

        {/* Card */}
        <form
          onSubmit={handleLogin}
          className="bg-amber-50 md:bg-white rounded-xl p-6 md:p-10 shadow-md md:shadow-lg border border-amber-100"
        >
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Enter 10-digit mobile number"
              value={mobile}
              onChange={handleMobileChange}
              autoComplete="tel"
              maxLength={10}
              className="w-full h-12 px-4 rounded-lg border border-amber-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!isMobileValid || loading}
            className={`w-full h-12 rounded-lg text-white font-medium transition-all duration-300 transform active:scale-95 ${
              isMobileValid && !loading
                ? "bg-red-700 hover:bg-red-800 shadow-lg hover:shadow-xl"
                : "bg-red-400 cursor-not-allowed opacity-70"
            }`}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="text-center text-xs md:text-sm text-gray-500 mt-6 leading-relaxed">
            Enter your 10-digit mobile number to continue.
          </p>
        </form>
      </div>
    </div>
  );
}
