import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Images from "../../images/images";

/**
 * Shared layout for onboarding steps: back button, logo, title, optional subtitle.
 * Use for Personal Details, KYC Details, Bank Details steps.
 */
export default function OnboardingLayout({ title, subtitle, children, maxWidth = "max-w-lg" }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 to-white px-4 py-8 pb-24">
      <div className={`${maxWidth} mx-auto`}>
        {/* {title !== "Personal Details" && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <FaArrowLeft />
          </button>
          <div className="w-10" />
        </div>
        )} */}

        <div className="flex justify-center mb-4">
          <img src={Images.KJLogo} alt="Logo" className="w-32 h-20 object-contain" />
        </div>

        <h2 className="text-center text-xl font-semibold text-amber-900 mb-1">{title}</h2>
        {subtitle && <p className="text-center text-sm text-amber-800/80 mb-4">{subtitle}</p>}

        {children}
      </div>
    </div>
  );
}
