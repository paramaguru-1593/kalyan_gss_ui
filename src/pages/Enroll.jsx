import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function Enroll() {
  const navigate = useNavigate();
  const location = useLocation();

  const schemeType =
    location.state?.schemeType || "DHAN SAMRIDDHI";

  const [monthlyAmount, setMonthlyAmount] =
    useState(5000);
  const [expanded, setExpanded] = useState(false);

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
      <div className="flex-1 overflow-y-auto px-5 pb-28 md:px-8">
        <div className="max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="text-center mt-4 mb-6 md:mt-8 md:mb-10">
            <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl">💰</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold">
                {schemeType}
            </h2>
            <p className="text-sm md:text-base text-gray-500 mt-2">
                Configure your plan details
            </p>
            </div>

            <div className="bg-white md:p-8 md:shadow-sm md:border md:rounded-2xl">
                {/* Meta */}
                <div className="flex justify-center items-center mb-6 md:mb-8">
                <div className="text-center px-5 flex-1 md:flex-none">
                    <p className="text-xs md:text-sm text-gray-500 mb-1">
                    Tenure
                    </p>
                    <p className="font-semibold text-lg">
                    12 months
                    </p>
                </div>

                <div className="w-px h-8 bg-gray-200" />

                <div className="text-center px-5 flex-1 md:flex-none">
                    <p className="text-xs md:text-sm text-gray-500 mb-1">
                    Membership Fee
                    </p>
                    <p className="font-semibold text-lg">
                    ₹300
                    </p>
                </div>
                </div>

                <div className="border-t my-6 md:hidden" />

                {/* Amount section */}
                <div className="mb-6 md:bg-gray-50 md:p-6 md:rounded-xl">
                <h3 className="font-semibold mb-3 md:text-lg">
                    Opted Amount for Month
                </h3>

                <div className="flex items-end gap-2 mb-3">
                    <span className="text-green-600 text-2xl font-semibold">
                    ₹
                    </span>
                    <span className="text-green-600 text-3xl md:text-4xl font-bold">
                    {monthlyAmount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-gray-400 text-sm md:text-base mb-1">
                    per month
                    </span>
                </div>

                {/* Slider */}
                <input
                    type="range"
                    min={500}
                    max={50000}
                    step={500}
                    value={monthlyAmount}
                    onChange={(e) =>
                    setMonthlyAmount(Number(e.target.value))
                    }
                    className="w-full accent-green-600 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
                />

                <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                    <span>₹500</span>
                    <span>₹50,000</span>
                </div>
                </div>

                <div className="border-t my-6 md:hidden" />

                {/* Accordion */}
                <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between py-3 md:bg-white md:border md:p-4 md:rounded-xl hover:bg-gray-50 transition"
                >
                <span className="font-semibold text-gray-800">
                    Scheme Information
                </span>
                {expanded ? (
                    <FaChevronUp className="text-gray-500" />
                ) : (
                    <FaChevronDown className="text-gray-500" />
                )}
                </button>

                {expanded && (
                <div className="space-y-3 pb-2 mt-4 px-2">
                    {[
                    "Lorem ipsum dolor sit amet consectetur",
                    "Adipiscing elit sed do eiusmod tempor",
                    "Incididunt ut labore et dolore magna",
                    "Aliqua enim ad minim veniam quis",
                    ].map((text, i) => (
                    <div
                        key={i}
                        className="flex items-start gap-3"
                    >
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-600 leading-relaxed">
                        {text}
                        </p>
                    </div>
                    ))}
                </div>
                )}
            </div>
        </div>
      </div>

      {/* Floating button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:static md:border-t-0 md:bg-transparent md:max-w-4xl md:mx-auto md:w-full md:px-8 md:pb-8">
        <button
          onClick={() =>
            navigate("/review", {
              state: {
                schemeType,
                monthlyAmount,
              },
            })
          }
          className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg md:shadow-none"
        >
          Enroll
        </button>
      </div>
    </div>
  );
}
