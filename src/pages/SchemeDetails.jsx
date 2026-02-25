import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCoins,
  FaCalendarAlt,
  FaUser,
  FaWallet,
  FaCheckCircle,
  FaCreditCard,
  FaReceipt,
} from "react-icons/fa";
import { GET, getCustomerLedgerReport } from "../api/apiHelper";
import ApiEndpoints from "../api/apiEndPoints";
import Loader from "../components/Loader";

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="font-medium text-slate-900 text-sm text-right max-w-[60%]">{value ?? "—"}</span>
    </div>
  );
}

export default function SchemeDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const enrollment = location.state?.enrollment;

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md border border-slate-100">
          <p className="text-slate-600 mb-4">Scheme details not found.</p>
          <button
            onClick={() => navigate("/home")}
            className="text-amber-600 font-semibold hover:underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const collections = enrollment.collections || [];
  const accountNo = String(enrollment.EnrollmentID || "");

  const [ledgerData, setLedgerData] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(true);
  const [ledgerError, setLedgerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [error, setError] = useState("");

  // Fetch customer ledger report by enrollment no (single API; loader until complete).
  useEffect(() => {
    if (!accountNo) {
      setLedgerLoading(false);
      setLedgerData(null);
      return;
    }
    setLedgerLoading(true);
    setLedgerError(null);
    getCustomerLedgerReport(accountNo)
      .then((res) => {
        if (res?.status !== 200) {
          setLedgerError(res?.data?.error?.message || "Failed to load ledger");
          setLedgerData(null);
          return;
        }
        const err = res.data?.error;
        if (err && err.status !== 200) {
          setLedgerError(err.message || err.description || "Ledger unavailable");
          setLedgerData(null);
          return;
        }
        const data = res.data?.data ?? res.data?.Response?.data ?? res.data;
        setLedgerData(data || null);
      })
      .catch(() => {
        setLedgerError("Failed to load ledger");
        setLedgerData(null);
      })
      .finally(() => setLedgerLoading(false));
  }, [accountNo]);

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      const date = new Date(d);
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };

  const handlePayAndRegister = async () => {
    const emiAmount = enrollment.EMIAmount || 0;
    let email = null;
    try {
      const profile = localStorage.getItem("profile");
      if (profile) {
        const p = JSON.parse(profile);
        email = p.emailAddress || null;
      }
    } catch {
      email = null;
    }

    if (!email) {
      setError("Email is required for payment. Update it in Profile if needed.");
      return;
    }
    if (!accountNo) {
      setError("Account number is missing. Cannot proceed to pay.");
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

  const paymentStatus = ledgerData?.PaymentStatus ?? ledgerData?.paymentStatus;
  const ledgerCollections = ledgerData?.Response?.Collections ?? ledgerData?.Response?.collections ?? [];
  const collectionsList = Array.isArray(ledgerCollections) && ledgerCollections.length > 0
    ? ledgerCollections
    : (enrollment.collections || []);

  const hasAnyIncompletePayment = collectionsList.some(
    (c) => (c.PaymentStatus ?? c.paymentStatus ?? "").toString().toLowerCase() !== "completed"
  );

  const isPaymentCompleted =
    (paymentStatus === "Completed" || paymentStatus === "completed") &&
    !hasAnyIncompletePayment;
  const showPayButton = hasAnyIncompletePayment;

  const ledgerEntries = ledgerData?.ledger ?? ledgerData?.Ledger ?? ledgerData?.entries ?? [];
  const customerDetails = ledgerData?.customer ?? ledgerData?.Customer ?? ledgerData?.customerDetails ?? {};

  return (
    <div className="">
      <main className="max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-slate-600 hover:text-amber-700 mb-6 transition-colors font-medium"
        >
          <FaArrowLeft /> Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header with scheme name; Pay button moved to Collections section */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white px-6 py-5 relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight">{enrollment.PlanType}</h1>
                <p className="text-amber-100 text-sm mt-1 font-medium">
                  Enrollment No: {enrollment.EnrollmentID}
                </p>
              </div>
              {isPaymentCompleted && collectionsList.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20">
                  <FaCheckCircle className="text-emerald-300" />
                  <span className="text-sm font-semibold">All payments completed</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          {ledgerLoading && (
            <Loader message="Loading ledger..." />
          )}

          {!ledgerLoading && ledgerError && !ledgerData && (
            <div className="mx-6 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              {ledgerError} — Showing enrollment details only.
            </div>
          )}

          {!ledgerLoading && (
          <div className="p-6 space-y-8">
            {/* User / Customer details from ledger or enrollment */}
            <section>
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-base">
                <FaUser className="text-amber-500" /> Customer Details
              </h2>
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100 space-y-0">
                <Row
                  label="Name"
                  value={
                    customerDetails?.name ??
                    customerDetails?.CustomerName ??
                    ([enrollment.NomineeFirstName, enrollment.NomineeLastName].filter(Boolean).join(" ") || "—")
                  }
                />
                <Row label="Relationship" value={customerDetails?.relationship ?? enrollment.NomineeRelationship} />
                <Row label="Mobile" value={customerDetails?.mobile ?? customerDetails?.MobileNumber ?? enrollment.NomineeMobileNumber} />
                <Row label="Email" value={customerDetails?.email ?? customerDetails?.EmailAddress ?? enrollment.NomineeEmailAddress} />
                {(customerDetails?.address ?? enrollment.NomineeAddress) && (
                  <Row label="Address" value={customerDetails?.address ?? enrollment.NomineeAddress} />
                )}
              </div>
            </section>

            {/* Scheme details */}
            <section>
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-base">
                <FaCoins className="text-amber-500" /> Scheme Details
              </h2>
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100 space-y-0">
                <Row label="Status" value={enrollment.Status} />
                <Row label="EMI Amount" value={`₹${Number(enrollment.EMIAmount || 0).toLocaleString()}`} />
                <Row label="Tenure" value={`${enrollment.NoMonths || 0} months`} />
                <Row label="Total Paid" value={`₹${Number(enrollment.TotalPaidAmount || 0).toLocaleString()}`} />
                <Row label="Final Redeemable Amount" value={`₹${Number(enrollment.FinalRedeemableAmount || 0).toLocaleString()}`} />
                <Row label="Enrollment Gold Rate" value={`₹${Number(enrollment.EnrollmentDayGoldRate || 0).toLocaleString()}/gm`} />
                <Row label="Initial MOP" value={enrollment.InitialMOP} />
                <Row label="Scheme Efficiency" value={enrollment.SchemeEfficientType} />
                {enrollment.ReasonForInEfficient && (
                  <Row label="Reason" value={enrollment.ReasonForInEfficient} />
                )}
              </div>
            </section>

            {/* Dates */}
            <section>
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-base">
                <FaCalendarAlt className="text-amber-500" /> Dates
              </h2>
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100 space-y-0">
                <Row label="Join Date" value={formatDate(enrollment.JoinDate)} />
                <Row label="End Date" value={formatDate(enrollment.EndDate)} />
                {enrollment.DebitDate && <Row label="Debit Date" value={enrollment.DebitDate} />}
              </div>
            </section>

            {/* Ledger entries from API (if present) */}
            {Array.isArray(ledgerEntries) && ledgerEntries.length > 0 && (
              <section>
                <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-base">
                  <FaReceipt className="text-amber-500" /> Ledger
                </h2>
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-amber-50 text-amber-900">
                        <th className="text-left py-3 px-4 font-semibold">Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Particulars</th>
                        <th className="text-right py-3 px-4 font-semibold">Debit</th>
                        <th className="text-right py-3 px-4 font-semibold">Credit</th>
                        <th className="text-right py-3 px-4 font-semibold">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerEntries.map((row, i) => (
                        <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/50">
                          <td className="py-3 px-4">{formatDate(row.Date ?? row.date ?? row.TransactionDate)}</td>
                          <td className="py-3 px-4">{row.Particulars ?? row.particulars ?? row.Description ?? "—"}</td>
                          <td className="py-3 px-4 text-right font-medium">{row.Debit != null ? `₹${Number(row.Debit).toLocaleString()}` : "—"}</td>
                          <td className="py-3 px-4 text-right font-medium">{row.Credit != null ? `₹${Number(row.Credit).toLocaleString()}` : "—"}</td>
                          <td className="py-3 px-4 text-right font-medium">{row.Balance != null ? `₹${Number(row.Balance).toLocaleString()}` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Collections (from ledger API or enrollment) */}
            <section>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-base">
                  <FaWallet className="text-amber-500" /> Collections
                </h2>
                {/* {showPayButton && (
                  <button
                    type="button"
                    onClick={handlePayAndRegister}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-amber-600 text-white hover:bg-amber-700 shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                  >
                    <FaCreditCard />
                    {loading ? "Processing..." : "Pay Now"}
                  </button>
                )} */}
              </div>
              {collectionsList.length === 0 ? (
                <div className="bg-slate-50/80 rounded-xl p-6 text-center text-slate-500 text-sm border border-slate-100">
                  No collections recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-amber-50 text-amber-900">
                        <th className="text-left py-3 px-4 font-semibold">Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold">MOP</th>
                        <th className="text-left py-3 px-4 font-semibold">EMI Month</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Bank</th>
                        <th className="text-right py-3 px-4 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectionsList.map((c, index) => {
                        const dateVal = c.Date ?? c.CollectionDate ?? c.date;
                        const amountVal = c.Amount ?? c.amount ?? 0;
                        const mopVal = c.MOP ?? c.mop ?? "—";
                        const emiMonth = c.EMIMonth ?? c.emiMonth ?? "—";
                        const paymentStatusVal = (c.PaymentStatus ?? c.paymentStatus ?? "").toString();
                        const isCompleted = paymentStatusVal.toLowerCase() === "completed";
                        return (
                          <tr key={c.ReferenceNo ?? c.CollectionID ?? index} className="border-t border-slate-100 hover:bg-slate-50/50">
                            <td className="py-3 px-4">{formatDate(dateVal)}</td>
                            <td className="py-3 px-4 font-medium">₹{Number(amountVal).toLocaleString()}</td>
                            <td className="py-3 px-4">{mopVal}</td>
                            <td className="py-3 px-4">{emiMonth}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                {isCompleted ? <FaCheckCircle className="text-emerald-600" /> : null}
                                {paymentStatusVal || (c.Active === "Y" ? "Active" : "—")}
                              </span>
                            </td>
                            <td className="py-3 px-4">{c.BankName ?? c.bankName ?? "—"}</td>
                            <td className="py-3 px-4 text-right">
                              {!isCompleted && paymentStatusVal !== "" ? (
                                <button
                                  type="button"
                                  onClick={handlePayAndRegister}
                                  disabled={loading}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  <FaCreditCard /> Pay
                                </button>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
          )}
        </div>
      </main>

      {/* Payment success modal */}
      {paymentSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full shadow-2xl">
            <FaCheckCircle className="text-emerald-500 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Successful</h3>
            <p className="text-slate-600 mb-4">{paymentSuccess.message}</p>
            {paymentSuccess.receiptId && (
              <div className="text-left bg-slate-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt ID</span>
                  <span className="font-semibold">{paymentSuccess.receiptId}</span>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button
                onClick={() =>
                  navigate("/bond", {
                    state: {
                      source: "enroll",
                      schemeType: enrollment.PlanType,
                      customerId: enrollment.CustomerID || "",
                      enrollmentId: accountNo,
                      transactionRef: paymentSuccess.receiptId,
                      amount: enrollment.EMIAmount || 0,
                      fullName: enrollment.CustomerName || "",
                      mobileNumber: enrollment.MobileNo || "",
                      emailAddress: enrollment.NomineeEmailAddress || null,
                    },
                  })
                }
                className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition"
              >
                View receipt (Bond)
              </button>
              <button
                onClick={() => navigate("/home")}
                className="w-full border border-slate-300 py-3 rounded-xl font-semibold hover:bg-slate-50 transition"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
