import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaHome, FaArrowLeft } from "react-icons/fa";
import { POST } from "../api/apiHelper";
import ApiEndpoits from "../api/apiEndPoints";

function displayValue(v) {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function buildReceiptApiRows(data) {
  if (!data || typeof data !== "object") return { main: [], schemeRows: [] };
  const sp = data.scheme_payment;
  const main = [
    ["company_name", "Company Name", data.company_name],
    ["scheme_name", "Scheme Name", data.scheme_name],
    ["customer_id", "Customer ID", data.customer_id],
    ["name_of_customer", "Name of Customer", data.name_of_customer],
    ["date_of_birth", "Date of Birth", data.date_of_birth],
    ["gender", "Gender", data.gender],
    ["mobile_no", "Mobile No.", data.mobile_no],
    ["email_id", "Email ID", data.email_id],
    ["address", "Address", data.address],
    ["enrollment_id", "Enrollment ID", data.enrollment_id],
    ["month_of_emi", "Month of EMI", data.month_of_emi],
    ["amount_formatted", "amount_formatted", data.amount_formatted],
    ["amount", "amount", data.amount],
    ["transaction_reference", "Transaction Reference", data.transaction_reference],
    ["transaction_status", "Transaction Status", data.transaction_status],
    ["mode_of_payment", "Mode of Payment", data.mode_of_payment],
    ["bank_reference_no", "Bank Reference No.", data.bank_reference_no],
    ["payment_gateway", "Payment Gateway", data.payment_gateway],
    ["payment_date", "Payment Date", data.payment_date],
    ["id_proof", "ID Proof", data.id_proof],
  ];
  const schemeRows =
    sp && typeof sp === "object"
      ? [
          ["scheme_payment.id", "Scheme Payment — ID", sp.id],
          ["scheme_payment.status", "Scheme Payment — Status", sp.status],
          [
            "scheme_payment.installment_no",
            "Scheme Payment — Installment No.",
            sp.installment_no,
          ],
        ]
      : [];
  return { main, schemeRows };
}

function ReceiptApiView({ receiptApiData, params, onBack }) {
  const { main, schemeRows } = buildReceiptApiRows(receiptApiData);
  const handleDownloadPdf = () => window.print();

  return (
    <div className="min-h-screen bg-amber-50 print:bg-white">
      <div className="flex justify-between items-center px-4 py-4 print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center"
        >
          {params.source === "transactions" ? <FaArrowLeft /> : <FaHome />}
        </button>
        <div className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-10">
        {/* {params.customerId != null && params.customerId !== "" && (
          <p className="text-center text-xs text-amber-800/70 mb-2 print:hidden">
            Customer ID: <span className="font-medium">{params.customerId}</span>
          </p>
        )} */}
        <h1 className="text-center text-lg font-semibold text-amber-900 mb-2">
          {displayValue(receiptApiData.company_name)}
        </h1>
        <p className="text-center text-sm text-amber-800/80 mb-4">
          Payment receipt
        </p>

        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow print:shadow-none">
          <h2 className="text-center text-lg font-semibold text-amber-900 mb-4">
            {displayValue(receiptApiData.scheme_name)}
          </h2>

          <div className="border rounded overflow-hidden">
            {main.map(([key, label, value]) => (
              <div
                key={key}
                className="flex flex-col sm:flex-row sm:justify-between gap-1 px-3 py-2 text-sm border-b last:border-none"
              >
                <span className="text-gray-600 shrink-0">{label}</span>
                <span className="font-medium text-gray-900 text-right break-words max-w-full sm:max-w-[65%]">
                  {displayValue(value)}
                </span>
              </div>
            ))}
          </div>

          {/* {schemeRows.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-amber-900 mb-2">
                scheme_payment
              </h3>
              <div className="border rounded overflow-hidden">
                {schemeRows.map(([key, label, value]) => (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:justify-between gap-1 px-3 py-2 text-sm border-b last:border-none"
                  >
                    <span className="text-gray-600 shrink-0">{label}</span>
                    <span className="font-medium text-gray-900 text-right">
                      {displayValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>

        <button
          type="button"
          onClick={handleDownloadPdf}
          className="mt-6 w-full bg-green-600 text-white py-4 rounded-lg font-semibold print:hidden"
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
}

export default function Bond() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = location.state || {};

  const billdeskReference =
    typeof params.billdeskReference === "string"
      ? params.billdeskReference.trim()
      : "";
  const hasPreloadedReceipt = Boolean(params.receiptApiData);
  const shouldFetchReceipt = Boolean(billdeskReference) && !hasPreloadedReceipt;

  const [fetchedReceipt, setFetchedReceipt] = useState(null);
  const [loading, setLoading] = useState(shouldFetchReceipt);
  const [fetchError, setFetchError] = useState(null);

  const receiptApiData = fetchedReceipt;

  useEffect(() => {
    if (!shouldFetchReceipt) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    POST(ApiEndpoits.receiptByReference, {
      billdesk_reference: billdeskReference,
    })
      .then((res) => {
        if (cancelled) return;
        if (!res || res.status !== 200) {
          const msg =
            res?.data?.message ||
            res?.data?.error?.message ||
            "Failed to load receipt.";
          throw new Error(msg);
        }
        if (!res.data?.success || !res.data?.data) {
          throw new Error(res.data?.message || "Receipt not found.");
        }
        setFetchedReceipt(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setFetchError(err.message || "Could not load bond.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [billdeskReference, shouldFetchReceipt]);

  const goHomeOrBack = () => {
    if (params.source === "transactions") {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  if (shouldFetchReceipt && loading && !receiptApiData) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col">
        <div className="flex justify-between items-center px-4 py-4">
          <button
            type="button"
            onClick={goHomeOrBack}
            className="w-10 h-10 flex items-center justify-center"
          >
            {params.source === "transactions" ? <FaArrowLeft /> : <FaHome />}
          </button>
          <div className="w-10" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
          {/* {params.customerId != null && params.customerId !== "" && (
            <p className="text-sm text-amber-900 mb-2">
              Customer ID:{" "}
              <span className="font-semibold">{params.customerId}</span>
            </p>
          )} */}
          <p className="text-gray-600">Loading receipt…</p>
        </div>
      </div>
    );
  }

  if (shouldFetchReceipt && fetchError && !receiptApiData) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col">
        <div className="flex justify-between items-center px-4 py-4">
          <button
            type="button"
            onClick={goHomeOrBack}
            className="w-10 h-10 flex items-center justify-center"
          >
            {params.source === "transactions" ? <FaArrowLeft /> : <FaHome />}
          </button>
          <div className="w-10" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
          <p className="text-red-600 text-center mb-4">{fetchError}</p>
          <button
            type="button"
            onClick={() => navigate("/payment-success", { replace: true })}
            className="text-blue-600 underline text-sm"
          >
            Back to payment success
          </button>
        </div>
      </div>
    );
  }

  if (receiptApiData) {
    return (
      <ReceiptApiView
        receiptApiData={receiptApiData}
        params={params}
        onBack={goHomeOrBack}
      />
    );
  }

  const companyName =
    params.companyName || "Kalyan Jewellers India Limited";
  const schemeType = params.schemeType || "DHAN SAMRIDDHI";
  const customerId = params.customerId ?? "";
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
    params.identityProofType || "NO ID PROOF AVAILABLE";

  const modeOfPay = params.modeOfPay || "Online";
  const paymentGateway = params.paymentGateway || "";
  const source = params.source || "";
  const transactionStatus = params.transactionStatus || "Completed";
  const bankReferenceNo = params.bankReferenceNo;
  const paymentDate = params.paymentDate;

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
    ["Amount", `₹${Number(amount).toLocaleString("en-IN")}`],
    ["Transaction Reference", transactionRef],
    ["Transaction Status", transactionStatus],
    ...(bankReferenceNo ? [["Bank Reference No.", bankReferenceNo]] : []),
    ...(paymentDate ? [["Payment Date", paymentDate]] : []),
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
      <div className="flex justify-between items-center px-4 py-4">
        <button
          type="button"
          onClick={goHomeOrBack}
          className="w-10 h-10 flex items-center justify-center"
        >
          {source === "transactions" ? <FaArrowLeft /> : <FaHome />}
        </button>
        <div className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-10">
        <h1 className="text-center text-lg font-semibold text-amber-900 mb-4">
          {companyName}
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
                <span className="text-gray-600">{label}</span>
                <span className="font-medium text-gray-900 text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="mt-6 w-full bg-green-600 text-white py-4 rounded-lg font-semibold"
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
}
