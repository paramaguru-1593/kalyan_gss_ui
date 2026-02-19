import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaCoins, FaCalendarAlt, FaUser, FaWallet, FaCheckCircle } from "react-icons/fa";
import { GET } from "../api/apiHelper";
import ApiEndpoints from "../api/apiEndPoints";

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-medium text-gray-900 text-sm">{value ?? "—"}</span>
    </div>
  );
}

export default function SchemeDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const enrollment = location.state?.enrollment;

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-100 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <p className="text-gray-600 mb-4">Scheme details not found.</p>
          <button
            onClick={() => navigate("/home")}
            className="text-amber-600 font-medium hover:underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const collections = enrollment.collections || [];
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentInfoLoading, setPaymentInfoLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [error, setError] = useState("");

  const accountNo = enrollment.EnrollmentID || "";

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
  const formatDate = (d) => {
    if (!d) return "—";
    try {
      const date = new Date(d);
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 to-white">
      <main className="max-w-4xl mx-auto px-4 py-6 md:px-8">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-gray-600 hover:text-amber-700 mb-6 transition-colors"
        >
          <FaArrowLeft /> Back to Home
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-4">
            <h1 className="text-xl font-bold">{enrollment.PlanType}</h1>
            <p className="text-amber-100 text-sm mt-1">
              Enrollment ID: {enrollment.EnrollmentID}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Important details */}
            <section>
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaCoins className="text-amber-500" /> Scheme Details
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-0">
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

            <section>
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaCalendarAlt className="text-amber-500" /> Dates
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-0">
                <Row label="Join Date" value={formatDate(enrollment.JoinDate)} />
                <Row label="End Date" value={formatDate(enrollment.EndDate)} />
                {enrollment.DebitDate && <Row label="Debit Date" value={enrollment.DebitDate} />}
              </div>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaUser className="text-amber-500" /> Nominee
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-0">
                <Row label="Name" value={[enrollment.NomineeFirstName, enrollment.NomineeLastName].filter(Boolean).join(" ")} />
                <Row label="Relationship" value={enrollment.NomineeRelationship} />
                <Row label="Mobile" value={enrollment.NomineeMobileNumber} />
                <Row label="Email" value={enrollment.NomineeEmailAddress} />
                {enrollment.NomineeAddress && <Row label="Address" value={enrollment.NomineeAddress} />}
              </div>
            </section>

            {/* Collections */}
            <section>
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaWallet className="text-amber-500" /> Collections
              </h2>
              {collections.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500 text-sm">
                  No collections recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-amber-50 text-amber-900">
                        <th className="text-left py-3 px-4 font-semibold">Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold">MOP</th>
                        <th className="text-left py-3 px-4 font-semibold">Bank</th>
                        <th className="text-left py-3 px-4 font-semibold">Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collections.map((c) => (
                        <tr key={c.CollectionID} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{formatDate(c.CollectionDate)}</td>
                          <td className="py-3 px-4 font-medium">₹{Number(c.Amount || 0).toLocaleString()}</td>
                          <td className="py-3 px-4">{c.MOP ?? "—"}</td>
                          <td className="py-3 px-4">{c.BankName ?? "—"}</td>
                          <td className="py-3 px-4">{c.Active === "Y" ? "Yes" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
            </main>

            {/* Payment success modal */}
            {paymentSuccess && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
                <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full">
                  <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Payment Successful</h3>
                  <p className="text-gray-600 mb-4">{paymentSuccess.message}</p>
                  {paymentSuccess.receiptId && (
                    <div className="text-left bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Receipt ID</span>
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
                      className="w-full border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                    >
                      Go to Home
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom action bar: show pay button or receipt actions */}
            {!paymentInfo?.paymentAccepted && (
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t p-4">
                {/* <div className="flex flex-col gap-2 max-w-lg mx-auto">
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/bond", {
                        state: {
                          source: "enroll",
                          schemeType: enrollment.PlanType,
                          customerId: enrollment.CustomerID || "",
                          enrollmentId: accountNo,
                          transactionRef: enrollment.ReceiptNo || "",
                          amount: enrollment.EMIAmount || 0,
                          fullName: enrollment.CustomerName || "",
                          mobileNumber: enrollment.MobileNo || "",
                          emailAddress: enrollment.NomineeEmailAddress || null,
                        },
                      })
                    }
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
              ) : ( */}
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
            </div>
            )}
          </div>
  );
}
