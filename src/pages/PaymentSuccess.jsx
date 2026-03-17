import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

function formatAmount(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount ?? "");
  return n.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const state = location.state || {};
  let receipt = state.receipt;

  if (!receipt) {
    try {
      const stored = localStorage.getItem("lastPaymentReceipt");
      if (stored) receipt = JSON.parse(stored);
    } catch (_) {}
  }

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

  const goHome = () => navigate("/home", { replace: true });
  const goBond = () => navigate("/bond", { state: receipt || {}, replace: true });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md border border-gray-300 rounded-md shadow-sm">
          <div className="px-4 py-3 border-b text-center">
            <h1 className="text-lg font-semibold text-gray-800">Gold Scheme Payment</h1>
          </div>

          <div className="p-4">
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
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
            <button onClick={goHome} className="text-blue-600 hover:underline">
              Home
            </button>
            <button onClick={goBond} className="text-blue-600 hover:underline">
              Bond
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

