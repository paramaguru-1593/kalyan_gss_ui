import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { GET } from "../api/apiHelper";
import ApiEndpoints from "../api/apiEndPoints";

/** @typedef {{ paymentAccepted?: boolean; paymentAcceptedMonth?: string | null; acceptanceReason?: string }} PaymentInfo */

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-0 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900">{value ?? "—"}</span>
    </div>
  );
}

export default function EnrollCustomerInfo() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const [email, setEmail] = useState(state.emailAddress || "testing@gmail.com");
  const [customerName, setCustomerName] = useState(state.fullName || "test");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(/** @type {PaymentInfo | null} */ (null));
  const [paymentInfoLoading, setPaymentInfoLoading] = useState(true);

  const accountNo = state.account_no ?? "";
  const receiptNo = state.receipt_no ?? "";
  const emiAmount = state.emi_amount ?? "";
  const mobileNo = state.mobile_no ?? "";
  const schemeName = state.scheme_name ?? "Scheme";
  const customerId = state.customer_id ?? "";
  const tenure = state.tenure ?? "";

  useEffect(() => {
    try {
      if (state.fullName) setCustomerName(state.fullName);
      if (state.emailAddress) setEmail(state.emailAddress);
    } catch (_) {}
  }, [state.fullName, state.emailAddress]);

  useEffect(() => {
    const profile = localStorage.getItem("profile");
    if (profile && !state.fullName) {
      try {
        const data = JSON.parse(profile);
        if (data.emailAddress) setEmail(data.emailAddress);
        if (data.fullName) setCustomerName(data.fullName);
      } catch (_) {}
    }
  }, [state.fullName]);

  // Check if first month already paid via getPaymentInformation
  useEffect(() => {
    if (!accountNo) {
      setPaymentInfoLoading(false);
      setPaymentInfo(null);
      return;
    }
    setPaymentInfoLoading(true);
    GET(ApiEndpoints.getPaymentInformation, {
      params: { EnrollmentID: accountNo },
    })
      .then((response) => {
        const data = response?.data?.data;
        if (data != null) {
          setPaymentInfo({
            paymentAccepted: data.paymentAccepted === true,
            paymentAcceptedMonth: data.paymentAcceptedMonth ?? null,
            acceptanceReason: data.acceptanceReason,
          });
        } else {
          setPaymentInfo(null);
        }
      })
      .catch(() => setPaymentInfo(null))
      .finally(() => setPaymentInfoLoading(false));
  }, [accountNo]);

  const handlePayAndRegister = async () => {
    if (!email.trim()) {
      setError("Email is required for payment. Update it in Profile if needed.");
      return;
    }
    if (!accountNo) {
      setError("Account number is missing. Please complete enrollment first.");
      return;
    }
    setError("");
    setLoading(true);

    const dateStr = new Date().toISOString().slice(0, 10);
    const transId = `TXN${Date.now()}${Math.random().toString(36).slice(2, 9)}`;
    const amountStr = String(emiAmount || "0");
    const channel = "Web";

    const params = {
      Date: dateStr,
      enrNo: String(accountNo),
      amount: amountStr,
      transId,
      email: email.trim(),
      channel,
    };

    const response = await GET(ApiEndpoints.confirmPayment, { params });
    setLoading(false);

    const isSuccess =
      response?.status === 200 &&
      response?.data?.data != null &&
      response?.data?.error?.status !== 400;
    if (isSuccess) {
      const data = response.data.data;
      const receiptId = (Array.isArray(data) ? data[0] : data)?.ReceiptID;
      setPaymentSuccess({
        receiptId: receiptId ?? transId,
        message: response?.data?.error?.message || "Payment confirmed successfully.",
      });
    } else {
      const errMsg =
        response?.data?.error?.message ||
        response?.data?.error?.description ||
        "Payment confirmation failed. Please try again.";
      setError(errMsg);
    }
  };

  if (paymentSuccess) {
    const bondState = {
      source: "enroll",
      schemeType: schemeName,
      customerId,
      enrollmentId: accountNo,
      transactionRef: paymentSuccess.receiptId || receiptNo,
      amount: emiAmount,
      fullName: customerName,
      mobileNumber: mobileNo,
      emailAddress: email,
    };
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 max-w-md w-full text-center">
            <FaCheckCircle className="text-green-600 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Successful</h2>
            <p className="text-gray-600 mb-6">{paymentSuccess.message}</p>
            {paymentSuccess.receiptId && (
              <div className="text-left bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Receipt ID</span>
                  <span className="font-semibold">{paymentSuccess.receiptId}</span>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/bond", { state: bondState })}
                className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition"
              >
                View receipt (Bond)
              </button>
              <button
                onClick={() => navigate("/home")}
                className="w-full border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center"
        >
          <FaArrowLeft />
        </button>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-28">
        <div className="max-w-lg mx-auto w-full">
          <div className="text-center mt-4 mb-6">
            <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-2xl">👤</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Customer Information</h2>
            <p className="text-sm text-gray-500 mt-2">Review and proceed to pay</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-5 space-y-1 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Enrollment & Scheme</h3>
            <Row label="Account No" value={accountNo} />
            <Row label="Receipt No" value={receiptNo} />
            <Row label="Scheme" value={schemeName} />
            <Row label="Tenure" value={tenure ? `${tenure} months` : ""} />
            <Row label="EMI Amount" value={emiAmount ? `₹${Number(emiAmount).toLocaleString("en-IN")}` : ""} />
          </div>

          <div className="bg-gray-50 rounded-xl p-5 space-y-1 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Customer Details</h3>
            <Row label="Customer Name" value={customerName} />
            <Row label="Customer ID" value={customerId} />
            <Row label="Mobile" value={mobileNo} />
            <Row label="Email" value={email} />
          </div>

          {!email && (
            <p className="text-sm text-amber-700 mb-4">
              Add email in Edit Profile for payment. You can still proceed; email may be required by the payment API.
            </p>
          )}

          {paymentInfoLoading && (
            <p className="text-sm text-gray-500 py-2">Checking payment status...</p>
          )}
          {!paymentInfoLoading && paymentInfo?.paymentAccepted && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
              First month already paid.
              {paymentInfo.paymentAcceptedMonth && (
                <span className="block mt-1">Accepted for: {paymentInfo.paymentAcceptedMonth}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        {!paymentInfoLoading && paymentInfo?.paymentAccepted ? (
          <div className="flex items-center justify-center gap-2 max-w-lg mx-auto">
            <button
              type="button"
              onClick={() => navigate("/bond", {
                state: {
                  source: "enroll",
                  schemeType: schemeName,
                  customerId,
                  enrollmentId: accountNo,
                  transactionRef: receiptNo,
                  amount: emiAmount,
                  fullName: customerName,
                  mobileNumber: mobileNo,
                  emailAddress: email,
                },
              })}
              className="w-full py-4 rounded-xl font-semibold bg-amber-600 text-white hover:bg-amber-700 transition"
            >
              View receipt (Bond)
            </button>
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="w-full py-3 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 transition"
            >
              Go to Home
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handlePayAndRegister}
            disabled={loading || paymentInfoLoading}
            className={`w-full max-w-lg mx-auto block py-4 rounded-xl font-semibold transition ${
              loading || paymentInfoLoading
                ? "bg-gray-400 cursor-wait text-white"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {loading ? "Processing..." : paymentInfoLoading ? "Checking..." : "Pay & Register"}
          </button>
        )}
      </div>
    </div>
  );
}
