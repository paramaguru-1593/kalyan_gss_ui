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
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md border border-gray-300 rounded-md shadow-sm">
          <div className="px-4 py-3 border-b text-center">
            <h1 className="text-lg font-semibold text-gray-800">Gold Scheme Payment</h1>
          </div>

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

          <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
            <button type="button" onClick={goHome} className="text-blue-600 hover:underline">
              Home
            </button>
            <button
              type="button"
              onClick={goBond}
              disabled={loading || !receipt?.transactionRef}
              className="text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Bond
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
