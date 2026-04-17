import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { GET, POST } from "../api/apiHelper";
import ApiEndpoits from "../api/apiEndPoints";

function formatAmount(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount ?? "");
  return n.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refNo, setRefNo] = useState(null);

  const state = location.state || {};

  useEffect(() => {
    if (state.receipt) {
      setReceipt(state.receipt);
      return;
    }

    try {
      const stored = localStorage.getItem("lastPaymentReceipt");
      if (stored) {
        setReceipt(JSON.parse(stored));
      }
    } catch (_) {}
  }, [state.receipt]);

  useEffect(() => {
    const status = searchParams.get("status");
    const refNo = searchParams.get("refNo");
    setRefNo(refNo);

    if (status === "SUCCESS" && refNo) {
      setLoading(true);
      setError(null);

      POST(`${ApiEndpoits.paymentDetails}`, { billdesk_reference: refNo })
        .then((response) => {
          if (!response || response.status !== 200) {
            const msg =
              response?.data?.message ||
              response?.data?.error?.message ||
              "Failed to fetch payment details";
            throw new Error(msg);
          }

          const data = response.data;
          if (data && data.data) {
            const apiReceipt = {
              schemeType: data.data.scheme,
              enrollmentId: data.data.enrollmentId,
              monthOfEmi: data.data.monthOfEmi,
              amount: data.data.amount,
              transactionRef: data.data.transactionReference,
              transactionStatus: data.data.transactionStatus,
              status: data.data.status
            };
            setReceipt(apiReceipt);
            try {
              localStorage.setItem("lastPaymentReceipt", JSON.stringify(apiReceipt));
            } catch (_) {}
          }
        })
        .catch((err) => {
          setError(err.message || "Something went wrong while loading payment details.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [searchParams]);

  const schemeType = receipt?.schemeType || "-";
  const enrollmentId = receipt?.enrollmentId || "-";
  const monthOfEmi = receipt?.monthOfEmi || "-";
  const amount = receipt?.amount;
  const transactionRef = receipt?.transactionRef || "-";
  const statusFromQuery = searchParams.get("status");
  const normalizedStatus = String(statusFromQuery || receipt?.status || receipt?.transactionStatus || "")
    .trim()
    .toLowerCase();
  const isFailedPayment = normalizedStatus === "failed" || normalizedStatus === "failure";
  const isSuccessPayment = !isFailedPayment;
  const transactionStatus =
    (statusFromQuery && statusFromQuery.toUpperCase()) ||
    receipt?.transactionStatus ||
    "Successful Transaction";

  const customerIdForBond =
    searchParams.get("refNo") || null;

  const goHome = () => navigate("/home", { replace: true });

  const goBond = () => {
    const billdeskRef = refNo;
    if (!billdeskRef || billdeskRef === "-") {
      return;
    }
    navigate("/bond", {
      replace: true,
      state: {
        customerId: customerIdForBond,
        billdeskReference: billdeskRef,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-3xl bg-white border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              isFailedPayment ? "bg-red-500" : "bg-emerald-500"
            }`}
            aria-hidden="true"
          >
            {isFailedPayment ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M7 7L17 17M17 7L7 17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 12.5L10 16.5L18 8.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-gray-800">
            {isFailedPayment ? "Payment Failed" : "Payment Successful"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isFailedPayment
              ? "Your payment could not be completed."
              : "Your payment for the scheme has been completed successfully."}
          </p>
        </div>

        <div className="mt-5 border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="p-4">
            {loading && (
              <div className="text-center text-sm text-gray-600 py-4">
                Loading payment details...
              </div>
            )}

            {!loading && error && (
              <div className="text-center text-sm text-red-600 py-4">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-600">Scheme</div>
                <div className="text-gray-900 font-medium text-right">{schemeType}</div>

                <div className="text-gray-600">Enrollment Id</div>
                <div className="text-gray-900 font-medium text-right">{enrollmentId}</div>

                <div className="text-gray-600">Month of EMI</div>
                <div className="text-gray-900 font-medium text-right">{monthOfEmi}</div>

                <div className="text-gray-600">Amount</div>
                <div className="text-gray-900 font-medium text-right">{formatAmount(amount)}</div>

                <div className="text-gray-600">Transaction Reference</div>
                <div className="text-gray-900 font-medium text-right break-all">{transactionRef}</div>

                <div className="text-gray-600">Transaction Status</div>
                <div className="text-gray-900 font-medium text-right">{transactionStatus}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {isSuccessPayment && (
            <button
              type="button"
              onClick={goBond}
              disabled={loading || !receipt?.transactionRef}
              className="w-full h-11 rounded-lg bg-[#151b2f] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Bond
            </button>
          )}
          <button
            type="button"
            onClick={goHome}
            className="w-full h-11 rounded-lg border border-gray-300 text-gray-700 font-medium bg-white"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
