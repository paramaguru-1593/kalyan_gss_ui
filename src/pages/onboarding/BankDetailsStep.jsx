import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaUpload } from "react-icons/fa";
import { updateCustomerBankDetails } from "../../api/apiHelper";
import OnboardingLayout from "../../components/onboarding/OnboardingLayout";
import FormFooterButtons from "../../components/onboarding/FormFooterButtons";
import { getInitialBankValues } from "./onboardingFormUtils";

const inputClass =
  "w-full h-12 px-4 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

const bankValidationSchema = Yup.object({
  mobile_no: Yup.string().required("Mobile number is required").matches(/^\d{10}$/, "Must be 10 digits"),
  bank_account_no: Yup.string().required("Bank account number is required").max(50),
  account_holder_name: Yup.string().required("Account holder name is required").max(255),
  account_holder_name_bank: Yup.string().required("Account holder name (bank) is required").max(255),
  ifsc_code: Yup.string().required("IFSC code is required").max(50),
  name_match_percentage: Yup.mixed()
    .required("Name match percentage is required")
    .test("range", "Must be 0–100", (v) => {
      const n = Number(v);
      return !Number.isNaN(n) && n >= 0 && n <= 100;
    }),
  file: Yup.string().required("Bank book image is required"),
});

export default function BankDetailsStep() {
  const navigate = useNavigate();
  const [bankBookFileName, setBankBookFileName] = useState("");
  const [apiError, setApiError] = useState("");
  const [apiLoading, setApiLoading] = useState(false);

  const formik = useFormik({
    initialValues: getInitialBankValues(),
    validationSchema: bankValidationSchema,
    onSubmit: async (values) => {
      setApiError("");
      setApiLoading(true);
      try {
        const num = Number(values.name_match_percentage);
        const res = await updateCustomerBankDetails({
          mobile_no: values.mobile_no,
          bank_account_no: values.bank_account_no.trim(),
          account_holder_name: values.account_holder_name.trim(),
          account_holder_name_bank: values.account_holder_name_bank.trim(),
          ifsc_code: values.ifsc_code.trim(),
          file: values.file,
          name_match_percentage: String(Number.isNaN(num) ? 0 : num),
        });
        if (res && res.status === 200) {
          navigate("/home", { replace: true });
        } else {
          setApiError(res?.data?.message || "Failed to update bank details.");
        }
      } catch (e) {
        setApiError(e?.message || "Failed to update bank details.");
      } finally {
        setApiLoading(false);
      }
    },
  });

  const handleBankBookFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBankBookFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      formik.setFieldValue("file", file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSkip = () => {
    navigate("/home", { replace: true });
  };

  const isLoading = apiLoading || formik.isSubmitting;

  return (
    <OnboardingLayout title="Bank Details" subtitle="Step 3 of 3" maxWidth="max-w-lg">
      <form onSubmit={formik.handleSubmit} className="bg-amber-50 rounded-xl p-5 shadow-md space-y-4">
        <div>
          <label className={labelClass}>Customer&apos;s Mobile Number <span className="text-red-500">*</span></label>
          <input
            type="tel"
            inputMode="numeric"
            name="mobile_no"
            value={formik.values.mobile_no}
            readOnly
            disabled
            className={`${inputClass} opacity-80 cursor-not-allowed`}
            maxLength={10}
          />
          {formik.touched.mobile_no && formik.errors.mobile_no && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.mobile_no}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Bank Account Number <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="bank_account_no"
            placeholder="Account number"
            value={formik.values.bank_account_no}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputClass}
          />
          {formik.touched.bank_account_no && formik.errors.bank_account_no && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.bank_account_no}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Account Holder Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="account_holder_name"
            placeholder="Name as in records"
            value={formik.values.account_holder_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputClass}
          />
          {formik.touched.account_holder_name && formik.errors.account_holder_name && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.account_holder_name}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Account Holder Name In Bank <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="account_holder_name_bank"
            placeholder="Name as per bank"
            value={formik.values.account_holder_name_bank}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputClass}
          />
          {formik.touched.account_holder_name_bank && formik.errors.account_holder_name_bank && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.account_holder_name_bank}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>IFSC Code <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="ifsc_code"
            placeholder="e.g. ICIC0001234"
            value={formik.values.ifsc_code}
            onChange={(e) => formik.setFieldValue("ifsc_code", e.target.value.toUpperCase())}
            onBlur={formik.handleBlur}
            className={inputClass}
          />
          {formik.touched.ifsc_code && formik.errors.ifsc_code && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.ifsc_code}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Name Match Percentage <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="name_match_percentage"
            min={0}
            max={100}
            step={0.01}
            placeholder="0–100"
            value={formik.values.name_match_percentage}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputClass}
          />
          {formik.touched.name_match_percentage && formik.errors.name_match_percentage && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.name_match_percentage}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Bank Book Image <span className="text-red-500">*</span></label>
          <label className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg cursor-pointer transition font-medium">
            <FaUpload /> Choose file
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleBankBookFile}
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">{bankBookFileName || "No file chosen"}</p>
          {formik.touched.file && formik.errors.file && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.file}</p>
          )}
        </div>

        {apiError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{apiError}</div>
        )}

        <FormFooterButtons
          onSubmit={() => formik.handleSubmit()}
          onSkip={handleSkip}
          submitLabel="Submit & Finish"
          skipLabel="Skip for now"
          isLoading={isLoading}
          submitDisabled={false}
        />
      </form>
    </OnboardingLayout>
  );
}
