import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";

const SCHEME_DATA = {
  "DHAN SAMRIDDHI": {
    tenure: 12,
    membershipFee: 3000,
    firstInstallment: 2000,
  },
  "Gold Harvest Scheme": {
    tenure: 24,
    membershipFee: 6000,
    firstInstallment: 4000,
  },
  "Smart Gold Saver Scheme": {
    tenure: 48,
    membershipFee: 12000,
    firstInstallment: 8000,
  },
  "Golden Future Plan": {
    tenure: 96,
    membershipFee: 24000,
    firstInstallment: 16000,
  },
};

export default function Review() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = location.state || {};

  const [modeOfPay, setModeOfPay] = useState("Online");
  const [paymentGateway, setPaymentGateway] = useState("");
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const schemeType = params.schemeType || "DHAN SAMRIDDHI";
  const userId = params.userId || "";
  const monthlyAmount = parseFloat(params.monthlyAmount || "5000");

  const schemeInfo =
    SCHEME_DATA[schemeType] || SCHEME_DATA["DHAN SAMRIDDHI"];

  const personalData = {
    fullName: params.fullName || "",
    mobileNumber: params.mobileNumber || "",
    emailAddress: params.emailAddress || "",
  };

  // Generated values
  const enrollmentId = Math.floor(Math.random() * 1e14).toString();
  const customerId = Math.floor(Math.random() * 1e14).toString();
  const joinDate = new Date().toLocaleString();
  const monthOfEmi = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const transactionRef = Math.floor(Math.random() * 1e13).toString();

  const amountPaid = schemeInfo.firstInstallment;
  const totalInstallmentAmount =
    monthlyAmount * schemeInfo.tenure +
    schemeInfo.membershipFee;
  const remainingAmount =
    totalInstallmentAmount - amountPaid;

  const paymentModes = ["Online", "Offline", "Cash"];
  const paymentGateways = [
    "Bill Desk",
    "Razorpay",
    "PayU",
    "CCAvenue",
  ];

  const handlePay = () => {
    if (modeOfPay === "Online" && !paymentGateway) {
      alert("Select payment gateway");
      return;
    }

    setShowProcessing(true);

    setTimeout(() => {
      setShowProcessing(false);
      setShowSuccess(true);
    }, 2000);
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

      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {/* Header */}
        <div className="text-center my-4">
          <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
            📋
          </div>
          <h2 className="text-xl font-semibold">
            Review and Payment
          </h2>
        </div>

        {/* Scheme info */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <Row label="Enrollment ID" value={enrollmentId} />
          <Row label="Join Date" value={joinDate} />
          <Row label="Amount Paid" value={`₹${amountPaid}`} />
          <Row label="Remaining Amount" value={`₹${remainingAmount}`} />
          <Row label="Total Amount" value={`₹${totalInstallmentAmount}`} />
        </div>

        {/* Customer info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg space-y-2">
          <Row label="Customer Name" value={personalData.fullName} />
          <Row label="Customer ID" value={customerId} />
          <Row label="Mobile" value={personalData.mobileNumber} />
        </div>

        {/* Payment */}
        <div className="mt-6 space-y-3">
          <label className="text-sm">Mode of Pay</label>
          <select
            value={modeOfPay}
            onChange={(e) => {
              setModeOfPay(e.target.value);
              if (e.target.value !== "Online")
                setPaymentGateway("");
            }}
            className="w-full border p-3 rounded"
          >
            {paymentModes.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          {modeOfPay === "Online" && (
            <>
              <label className="text-sm">Payment Gateway</label>
              <select
                value={paymentGateway}
                onChange={(e) => setPaymentGateway(e.target.value)}
                className="w-full border p-3 rounded"
              >
                <option value="">Select Gateway</option>
                {paymentGateways.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* Pay button */}
        <button
          onClick={handlePay}
          className="w-full mt-6 bg-green-600 text-white py-4 rounded-lg font-semibold"
        >
          Pay & Register
        </button>
      </div>

      {/* Processing */}
      {showProcessing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl text-center">
            <FaCheckCircle className="text-4xl text-amber-500 mx-auto mb-4" />
            <p className="font-semibold">Processing Payment...</p>
          </div>
        </div>
      )}

      {/* Success: Review flow → Bond (receipt) or Home */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
            <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-4" />
            <h3 className="font-semibold text-lg">
              Payment Successful
            </h3>
            <p className="text-sm text-gray-500 mt-1">Confirm details → Make payment ✓</p>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() =>
                  navigate("/bond", {
                    state: {
                      schemeType,
                      customerId,
                      enrollmentId,
                      monthOfEmi,
                      amount: amountPaid,
                      transactionRef,
                      fullName: personalData.fullName,
                      mobileNumber: personalData.mobileNumber,
                      emailAddress: personalData.emailAddress,
                    },
                  })
                }
                className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700"
              >
                View receipt (Bond)
              </button>
              <button
                onClick={() => navigate("/home")}
                className="w-full border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
