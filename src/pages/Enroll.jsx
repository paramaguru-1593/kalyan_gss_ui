import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { POST } from "../api/apiHelper";
import ApiEndpoints from "../api/apiEndPoints";
import Constants from "../utils/constants";

const inputClass =
  "w-full h-11 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

const MODES_OF_PAY = ["Online", "Offline", "Cash", "UPI", "Card", "Net Banking"];
const NOMINEE_RELATIONS = ["Spouse", "Parent", "Child", "Sibling", "Other"];

// Slider configuration (min, max and step). Adjust as needed.
const MIN_AMOUNT = 500;
const MAX_AMOUNT = 100000;
const STEP = 100;

export default function Enroll() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const [schemeId, setSchemeId] = useState(state.schemeId ?? "");
  const [customerId, setCustomerId] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [tenure, setTenure] = useState(state.tenure ?? 12);
  const [emiAmount, setEmiAmount] = useState(
    state.defaultEmi ? Number(state.defaultEmi) : 5000
  );
  const [modeOfPay, setModeOfPay] = useState("Online");

  const [nomineeFirstName, setNomineeFirstName] = useState("");
  const [nomineeLastName, setNomineeLastName] = useState("");
  const [nomineeMobileNo, setNomineeMobileNo] = useState("");
  const [nomineeRelation, setNomineeRelation] = useState("");
  const [nomineePincodeId, setNomineePincodeId] = useState("");
  const [nomineeState, setNomineeState] = useState("");
  const [nomineeDistrict, setNomineeDistrict] = useState("");
  const [nomineeCity, setNomineeCity] = useState("");
  const [nomineeStreet, setNomineeStreet] = useState("");
  const [nomineeHouseNo, setNomineeHouseNo] = useState("");

  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const schemeName = state.schemeName || "Scheme";

  useEffect(() => {
    const custId = localStorage.getItem(Constants.localStorageKey.userId) || "";
    const mobile = localStorage.getItem(Constants.localStorageKey.mobileNumber) || "";
    setCustomerId(custId);
    setMobileNo(mobile);
    if (state.schemeId != null && state.schemeId !== undefined) {
      setSchemeId(state.schemeId);
    }
    if (state.tenure != null && state.tenure !== undefined) {
      setTenure(Number(state.tenure));
    }
    if (state.defaultEmi != null && state.defaultEmi !== undefined) {
      setEmiAmount(Number(state.defaultEmi));
    }
  }, [state.schemeId, state.tenure, state.defaultEmi]);

  const handleNomineeMobileChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
    setNomineeMobileNo(v);
  };

  const handleNomineePincodeChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setNomineePincodeId(v);
  };

  const handleSliderChange = (e) => {
    const v = Number(e.target.value) || 0;
    // clamp to allowed bounds
    const clamped = Math.min(MAX_AMOUNT, Math.max(MIN_AMOUNT, v));
    setEmiAmount(clamped);
  };

  const isFormValid = () => {
    return (
      schemeId !== "" &&
      customerId !== "" &&
      mobileNo.length === 10 &&
      tenure > 0 &&
      emiAmount > 0 &&
      modeOfPay &&
      nomineeFirstName.trim() &&
      nomineeLastName.trim() &&
      nomineeMobileNo.length === 10 &&
      nomineeRelation &&
      nomineePincodeId.length >= 5 &&
      nomineeState.trim() &&
      nomineeDistrict.trim() &&
      nomineeCity.trim() &&
      nomineeStreet.trim() &&
      nomineeHouseNo.trim()
    );
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!isFormValid()) {
      setError("Please fill all mandatory fields correctly.");
      return;
    }
    setError("");
    setLoading(true);

    const payload = {
      scheme_id: Number(schemeId),
      customer_id: Number(customerId) || 0,
      mobile_no: mobileNo,
      tenure: Number(tenure),
      emi_amount: String(emiAmount),
      mode_of_pay: modeOfPay,
      nominee_first_name: nomineeFirstName.trim(),
      nominee_last_name: nomineeLastName.trim(),
      nominee_mobile_no: nomineeMobileNo,
      nominee_relation: nomineeRelation,
      nominee_pincode_id: Number(nomineePincodeId) || 0,
      nominee_state: nomineeState.trim(),
      nominee_district: nomineeDistrict.trim(),
      nominee_city: nomineeCity.trim(),
      nominee_street: nomineeStreet.trim(),
      nominee_house_no: nomineeHouseNo.trim(),
    };

    const response = await POST(ApiEndpoints.enrollNew, payload);
    setLoading(false);

    const ok = response?.status === 200 || response?.status === 201;
    if (ok && (response?.data?.status === 200 || response?.data?.status === 201 || response?.data?.account_no != null)) {
      navigate("/enroll-customer-info", {
        state: {
          account_no: response.data.account_no,
          receipt_no: response.data.receipt_no,
          message: response.data.message || "Success",
          emi_amount: emiAmount,
          mobile_no: mobileNo,
          scheme_name: schemeName,
          customer_id: customerId,
          tenure,
        },
      });
    } else {
      setError(response?.data?.message || "Enrollment failed. Please try again.");
    }
  };

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

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 md:px-6 pb-32">
        <div className="max-w-2xl mx-auto w-full">
          <div className="text-center mt-4 mb-6">
            <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-2xl">💰</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold">{schemeName}</h2>
            <p className="text-sm text-gray-500 mt-2">Enrollment form</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <section className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-2">
              Opted Amount for Month
            </h2>
            <div className="text-center py-4">
              <span className="text-3xl md:text-4xl font-bold text-gray-900">
                ₹{emiAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="px-1">
              <input
                type="range"
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                step={STEP}
                value={emiAmount}
                onChange={handleSliderChange}
                className="enroll-slider w-full h-2 rounded-full appearance-none cursor-pointer accent-[#00A86B]"
                style={{
                  background: `linear-gradient(to right, #00A86B 0%, #00A86B ${((emiAmount - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT)) * 100}%, #e5e7eb ${((emiAmount - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT)) * 100}%, #e5e7eb 100%)`,
                }}
                aria-valuemin={MIN_AMOUNT}
                aria-valuemax={MAX_AMOUNT}
                aria-valuenow={emiAmount}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1 px-0.5">
              <span>₹{MIN_AMOUNT.toLocaleString("en-IN")}</span>
              <span>₹{MAX_AMOUNT.toLocaleString("en-IN")}</span>
            </div>
          </section>

          {/* Scheme & customer info */}
          <section className="bg-gray-50 rounded-xl p-4 md:p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Scheme & Customer</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Scheme ID <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={1}
                  value={schemeId}
                  onChange={(e) => setSchemeId(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 1"
                />
              </div>
              <div>
                <label className={labelClass}>Customer ID <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={0}
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className={inputClass}
                  placeholder="From account"
                />
              </div>
              <div>
                <label className={labelClass}>Mobile Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className={inputClass}
                  placeholder="10-digit mobile"
                />
              </div>
              <div>
                <label className={labelClass}>Tenure (months) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={1}
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value) || 0)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>EMI Amount <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={1}
                  step={0.01}
                  value={emiAmount}
                  onChange={(e) => setEmiAmount(Number(e.target.value) || 0)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Mode of Pay <span className="text-red-500">*</span></label>
                <select
                  value={modeOfPay}
                  onChange={(e) => setModeOfPay(e.target.value)}
                  className={inputClass}
                >
                  {MODES_OF_PAY.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Nominee details */}
          <section className="bg-gray-50 rounded-xl p-4 md:p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Nominee Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nominee First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={nomineeFirstName}
                  onChange={(e) => setNomineeFirstName(e.target.value)}
                  className={inputClass}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className={labelClass}>Nominee Last Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={nomineeLastName}
                  onChange={(e) => setNomineeLastName(e.target.value)}
                  className={inputClass}
                  placeholder="Last name"
                />
              </div>
              <div>
                <label className={labelClass}>Nominee Mobile No <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={nomineeMobileNo}
                  onChange={handleNomineeMobileChange}
                  className={inputClass}
                  placeholder="10-digit mobile"
                />
              </div>
              <div>
                <label className={labelClass}>Nominee Relation <span className="text-red-500">*</span></label>
                <select
                  value={nomineeRelation}
                  onChange={(e) => setNomineeRelation(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  {NOMINEE_RELATIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Nominee Pincode <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={nomineePincodeId}
                  onChange={handleNomineePincodeChange}
                  className={inputClass}
                  placeholder="Pincode (numeric)"
                />
              </div>
              <div>
                <label className={labelClass}>Nominee State <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={nomineeState}
                  onChange={(e) => setNomineeState(e.target.value)}
                  className={inputClass}
                  placeholder="State"
                />
              </div>
              <div>
                <label className={labelClass}>Nominee District <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={nomineeDistrict}
                  onChange={(e) => setNomineeDistrict(e.target.value)}
                  className={inputClass}
                  placeholder="District"
                />
              </div>
              <div>
                <label className={labelClass}>Nominee City <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={nomineeCity}
                  onChange={(e) => setNomineeCity(e.target.value)}
                  className={inputClass}
                  placeholder="City"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Nominee Street <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={nomineeStreet}
                  onChange={(e) => setNomineeStreet(e.target.value)}
                  className={inputClass}
                  placeholder="Street"
                />
              </div>
              <div>
                <label className={labelClass}>Nominee House No <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={nomineeHouseNo}
                  onChange={(e) => setNomineeHouseNo(e.target.value)}
                  className={inputClass}
                  placeholder="House / Flat no"
                />
              </div>
            </div>
          </section>

          {/* Accordion */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between py-3 border p-4 rounded-xl hover:bg-gray-50 transition"
          >
            <span className="font-semibold text-gray-800">Scheme Information</span>
            {expanded ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
          </button>
          {expanded && (
            <div className="space-y-3 pb-2 mt-2 px-2 text-sm text-gray-600">
              <p>Complete all mandatory fields and submit to enroll in the scheme.</p>
              <p>Nominee details are required for gold scheme benefits.</p>
            </div>
          )}
        </div>
      </form>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isFormValid() || loading}
          className={`w-full max-w-2xl mx-auto block py-4 rounded-xl font-semibold transition ${
            isFormValid() && !loading
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? "Submitting..." : "Submit Enrollment"}
        </button>
      </div>
    </div>
  );
}
