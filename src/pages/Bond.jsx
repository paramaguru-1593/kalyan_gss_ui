import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaArrowLeft } from "react-icons/fa";

export default function Bond() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = location.state || {};

  const schemeType = params.schemeType || "DHAN SAMRIDDHI";
  const customerId = params.customerId || "";
  const enrollmentId = params.enrollmentId || "";
  const monthOfEmi = params.monthOfEmi || "";
  const amount = params.amount || 0;
  const transactionRef = params.transactionRef || "";

  const fullName = params.fullName || "";
  const mobileNumber = params.mobileNumber || "";
  const emailAddress = params.emailAddress || "";
  const dateOfBirth = params.dateOfBirth || "";
  const gender = params.gender || "";
  const address = params.address || "";
  const identityProofType =
    params.identityProofType ||
    "NO ID PROOF AVAILABLE";

  const modeOfPay = params.modeOfPay || "Online";
  const paymentGateway =
    params.paymentGateway || "";
  const source = params.source || "";

  const handleDownloadPdf = () => {
    window.print();
  };

  const goHomeOrBack = () => {
    if (source === "transactions") {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  const rows = [
    ["Customer ID", customerId],
    ["Name of the Customer", fullName],
    ["Date of Birth", dateOfBirth],
    ["Gender", gender],
    ["Mobile No.", mobileNumber],
    ["Email ID", emailAddress],
    ["Address", address],
    ["Enrollment Id", enrollmentId],
    ["Month of EMI", monthOfEmi],
    [
      "Amount",
      `₹${Number(amount).toLocaleString("en-IN")}`,
    ],
    ["Transaction Reference", transactionRef],
    ["Transaction Status", "Completed"],
    [
      "Mode of Payment",
      `${modeOfPay}${
        modeOfPay === "Online" && paymentGateway
          ? ` - ${paymentGateway}`
          : ""
      }`,
    ],
    ["ID Proof", identityProofType],
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Top bar */}
      <div className="flex justify-between items-center px-4 py-4">
        <button
          onClick={goHomeOrBack}
          className="w-10 h-10 flex items-center justify-center"
        >
          {source === "transactions" ? (
            <FaArrowLeft />
          ) : (
            <FaHome />
          )}
        </button>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pb-10">
        <h1 className="text-center text-lg font-semibold text-amber-900 mb-4">
          Kalyan Jewellers India Limited
        </h1>

        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow">
          <h2 className="text-center text-lg font-semibold text-amber-900 mb-4">
            {schemeType}
          </h2>

          <div className="border rounded overflow-hidden">
            {rows.map(([label, value], i) => (
              <div
                key={i}
                className="flex justify-between px-3 py-2 text-sm border-b last:border-none"
              >
                <span className="text-gray-600">
                  {label}
                </span>
                <span className="font-medium text-gray-900 text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownloadPdf}
          className="mt-6 w-full bg-green-600 text-white py-4 rounded-lg font-semibold"
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
}
