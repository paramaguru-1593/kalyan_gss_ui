import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const SAMPLE_TRANSACTIONS = [
  {
    schemeType: "DHAN SAMRIDDHI",
    modeOfPay: "Online",
    paymentGateway: "Bill Desk",
    joinDate: "2025-12-05",
    enrollmentId: "47083638935870",
    transactionRef: "4649129997596",
    amount: 2000,
  },
  {
    schemeType: "DHAN SAMRIDDHI",
    modeOfPay: "Online",
    paymentGateway: "Razorpay",
    joinDate: "2025-12-05",
    enrollmentId: "79420914888322",
    transactionRef: "8289083580149",
    amount: 2000,
  },
];

export default function Transactions() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    // Get transactions from localStorage
    const stored = localStorage.getItem("transactions");
    if (stored) {
      setTransactions(JSON.parse(stored));
    } else {
      // show sample transactions when none are stored so UI matches designs
      setTransactions(SAMPLE_TRANSACTIONS);
    }

    setLoading(false);
  }, []);

  const handleViewReceipt = (tx) => {
    navigate("/bond", {
      state: { ...tx, source: "transactions" },
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center mt-10">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!transactions.length) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center shadow-sm">
          <h3 className="font-semibold text-lg text-gray-800">
            No transactions yet
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Once you enroll in a scheme and make a payment, it will appear here.
          </p>

          <button
            onClick={() =>
              navigate("/home", { state: { userId } })
            }
            className="mt-4 px-6 py-2 border border-amber-500 text-amber-600 rounded-full font-semibold"
          >
            Explore Schemes
          </button>
        </div>
      );
    }

    return transactions.map((tx, index) => {
      const paymentDate = tx.joinDate
        ? new Date(tx.joinDate).toISOString().slice(0, 10)
        : "-";

      const gatewayLabel =
        tx.modeOfPay === "Online" && tx.paymentGateway
          ? `ONLINE - ${tx.paymentGateway}`
          : tx.modeOfPay;

      return (
        <div
          key={index}
          className="bg-white border border-amber-100 rounded-2xl p-4 shadow-md mb-4 animate-fade-in hover:shadow-lg transition-all duration-200"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {/* Header: scheme left, amount + status right */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-800 text-sm md:text-base">
                {tx.schemeType}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {gatewayLabel}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-green-600 text-lg md:text-xl">
                ₹{Number(tx.amount).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-green-700">Completed</p>
            </div>
          </div>

          <div className="pt-1 pb-2 border-t border-amber-50">
            <Row label="Payment Date" value={paymentDate} />
            <Row label="Enrollment No" value={tx.enrollmentId} />
            <Row label="Receipt ID" value={tx.transactionRef} />
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="text-xs text-gray-400">Tap to view detailed receipt</span>

            <button
              onClick={() => handleViewReceipt(tx)}
              className="bg-red-600 text-white text-sm px-4 py-2 rounded-full hover:bg-red-700 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              View Receipt
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col animate-fade-in">
      <div className="bg-gray-300 h-0.5" />
      <div className="flex-1 overflow-y-auto px-5 pb-6 md:px-8">
        <div className="max-w-4xl mx-auto w-full">
            <div className="text-center mt-4 mb-6 md:mt-8 md:mb-10">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                Transaction History
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-2">
                View the payments made towards your gold saving schemes.
            </p>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-6">
                {renderContent()}
            </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}
