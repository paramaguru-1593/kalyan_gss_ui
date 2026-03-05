import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaUpload, FaDownload } from "react-icons/fa";
import { updateCustomerKyc, getCustomerDetails } from "../../api/apiHelper";
import Constants from "../../utils/constants";
import OnboardingLayout from "../../components/onboarding/OnboardingLayout";
import FormFooterButtons from "../../components/onboarding/FormFooterButtons";
import { getInitialKycValues } from "./onboardingFormUtils";

const inputClass =
  "w-full h-12 px-4 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

const ID_PROOF_OPTIONS = [
  { value: 1, label: "Pan Card" },
  { value: 2, label: "Aadhar" },
  { value: 3, label: "Voter ID" },
  { value: 7, label: "Driving Licence" },
];

const kycValidationSchema = Yup.object({
  mobile_no: Yup.string().required("Mobile number is required").matches(/^\d{10}$/, "Must be 10 digits"),
  id_proof_type: Yup.number().oneOf([1, 2, 3, 7], "Invalid ID proof type").required("ID proof type is required"),
  id_proof_number: Yup.string().required("ID proof number is required").max(50, "Max 50 characters"),
  id_proof_front_side: Yup.string().required("ID proof front side image is required"),
});

const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function KycDetailsStep() {
  const navigate = useNavigate();
  const [idProofFrontFileName, setIdProofFrontFileName] = useState("");
  const [apiError, setApiError] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const [kycDocuments, setKycDocuments] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [kycPrefill, setKycPrefill] = useState(null);

  const formik = useFormik({
    initialValues: { ...getInitialKycValues(), ...(kycPrefill || {}) },
    validationSchema: kycValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setApiError("");
      setApiLoading(true);
      try {
        const res = await updateCustomerKyc({
          mobile_no: values.mobile_no,
          id_proof_type: values.id_proof_type,
          id_proof_front_side: values.id_proof_front_side,
          id_proof_back_side: values.id_proof_back_side || null,
          id_proof_number: values.id_proof_number.trim(),
        });
        if (res && res.status === 200) {
          const stored = localStorage.getItem("profile");
          const merged = stored
            ? {
                ...JSON.parse(stored),
                idProofType: values.id_proof_type,
                idProofNumber: values.id_proof_number.trim(),
                mobileNumber: values.mobile_no,
              }
            : {
                idProofType: values.id_proof_type,
                idProofNumber: values.id_proof_number.trim(),
                mobileNumber: values.mobile_no,
              };
          localStorage.setItem("profile", JSON.stringify(merged));
          navigate("/onboarding/bank-details", { replace: true });
        } else {
          setApiError(res?.data?.message || "KYC Details Not Updated!!");
        }
      } catch (e) {
        setApiError(e?.message || "KYC Details Not Updated!!");
      } finally {
        setApiLoading(false);
      }
    },
  });

  // Fetch getCustomerDetails on mount to prefill KYC and show uploaded documents (download)
  useEffect(() => {
    let mobile = "";
    try {
      const stored = localStorage.getItem("profile");
      if (stored) mobile = JSON.parse(stored).mobileNumber || "";
      if (!mobile) mobile = localStorage.getItem(Constants.localStorageKey.mobileNumber) || "";
    } catch (_) {}
    if (!mobile || mobile.length < 10) {
      setDetailsLoading(false);
      return;
    }
    setDetailsLoading(true);
    getCustomerDetails({ MobileNo: mobile })
      .then((res) => {
        if (res && res.status === 200 && res.data?.StatusCode === 200 && Array.isArray(res.data.Data) && res.data.Data.length > 0) {
          const docs = res.data.Data[0].Documents || [];
          setKycDocuments(docs);
          if (docs.length > 0) {
            const doc = docs[0];
            const docTypeMap = { PanCard: 1, Aadhar: 2, "Voter ID": 3, DrivingLicence: 7 };
            const idProofTypeNum = docTypeMap[doc.DocumentType] ?? 1;
            setKycPrefill({
              id_proof_type: idProofTypeNum,
              id_proof_number: doc.DocumentNo ?? "",
              id_proof_front_side: doc.DocumentUrlFront ?? "",
            });
          }
        }
      })
      .catch(() => {})
      .finally(() => setDetailsLoading(false));
  }, []);

  const handleFrontFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setApiError("");
    try {
      const base64 = await readFileAsBase64(file);
      formik.setFieldValue("id_proof_front_side", file.name);
      setIdProofFrontFileName(file.name);
    } catch (_) {
      setApiError("Failed to read front image.");
    }
  };

  const handleBackFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setApiError("");
    try {
      const base64 = await readFileAsBase64(file);
      formik.setFieldValue("id_proof_back_side", typeof base64 === "string" ? base64 : "");
    } catch (_) {
      setApiError("Failed to read back image.");
    }
  };

  const handleSkip = () => {
    navigate("/onboarding/bank-details", { replace: true });
  };

  const isLoading = apiLoading || formik.isSubmitting;

  const frontSideDisplay = idProofFrontFileName
    ? idProofFrontFileName
    : formik.values.id_proof_front_side && (formik.values.id_proof_front_side.startsWith("http") || formik.values.id_proof_front_side.startsWith("data:"))
      ? "Already uploaded"
      : "No file chosen";

  return (
    <OnboardingLayout title="KYC Details" subtitle="Step 2 of 3">
      {detailsLoading ? (
        <div className="bg-amber-50 rounded-xl p-8 shadow-md text-center text-gray-500">Loading KYC details...</div>
      ) : (
      <form onSubmit={formik.handleSubmit} className="bg-amber-50 rounded-xl p-5 shadow-md space-y-4">
        <div>
          <label className={labelClass}>Customer&apos;s Mobile Number <span className="text-red-500">*</span></label>
          <input
            type="tel"
            inputMode="numeric"
            value={formik.values.mobile_no}
            onChange={(e) => formik.setFieldValue("mobile_no", e.target.value.replace(/\D/g, "").slice(0, 10))}
            onBlur={formik.handleBlur}
            className={`${inputClass} opacity-80 cursor-not-allowed`}
            readOnly
            disabled
            maxLength={10}
          />
          {formik.touched.mobile_no && formik.errors.mobile_no && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.mobile_no}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>ID Proof Type <span className="text-red-500">*</span></label>
          <select
            name="id_proof_type"
            value={formik.values.id_proof_type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`${inputClass} appearance-none`}
          >
            {ID_PROOF_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {formik.touched.id_proof_type && formik.errors.id_proof_type && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.id_proof_type}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>ID Proof Number <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="id_proof_number"
            placeholder="e.g. PAN / Aadhar number"
            value={formik.values.id_proof_number}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputClass}
            maxLength={50}
          />
          {formik.touched.id_proof_number && formik.errors.id_proof_number && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.id_proof_number}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>ID Proof Front Side Image <span className="text-red-500">*</span></label>
          <label className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg cursor-pointer transition font-medium">
            <FaUpload /> Choose file
            <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleFrontFile} />
          </label>
          <p className="text-xs text-gray-500 mt-2">{frontSideDisplay}</p>
          {formik.touched.id_proof_front_side && formik.errors.id_proof_front_side && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.id_proof_front_side}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>ID Proof Back Side Image (optional)</label>
          <label className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg cursor-pointer transition font-medium">
            <FaUpload /> Choose file
            <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleBackFile} />
          </label>
        </div>

        {apiError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{apiError}</div>
        )}

        {kycDocuments.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Uploaded documents</h3>
            <ul className="space-y-2">
              {kycDocuments
                .filter((doc) => doc.DocumentUrlFront)
                .map((doc, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-sm text-gray-700">
                      {doc.DocumentType || "Document"} {doc.DocumentNo ? `(${doc.DocumentNo})` : ""}
                    </span>
                    <a
                      href={doc.DocumentUrlFront}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-amber-600 hover:bg-amber-700 transition"
                    >
                      <FaDownload /> Download
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <FormFooterButtons
          onSubmit={() => formik.handleSubmit()}
          onSkip={handleSkip}
          submitLabel="Submit & Continue"
          skipLabel="Skip for now"
          isLoading={isLoading}
          submitDisabled={false}
        />
      </form>
      )}
    </OnboardingLayout>
  );
}
