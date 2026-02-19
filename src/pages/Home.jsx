import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaUserCircle,
  FaCoins,
  FaChartLine,
} from "react-icons/fa";
import { getStoreGoldRate, getSchemesByMobileNumber } from "../api/apiHelper";
import { fetchSchemeDetails } from "../store/scheme/schemesApi";
import Constants from "../utils/constants";

function LiveGoldRate() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRate = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      const payload = {
        Date: `${dd}-${mm}-${yyyy}`,
        Region: "India",
        Location: "THRISSUR HO",
        Transaction_ID: String(Math.floor(10000000 + Math.random() * 90000000)),
      };

      const res = await getStoreGoldRate(payload);
      if (res && (res.status === 200 || res.status === 201)) {
        setData(res.data);
      } else {
        // backend may return 400 with message
        setError(res?.data?.message || "Unable to fetch rate");
      }
    } catch (e) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="text-center text-sm mb-4 md:text-left md:mb-6 md:bg-white md:p-4 md:rounded-xl md:shadow-sm md:border md:border-amber-100 animate-fade-in transition-shadow duration-300 hover:shadow-md">
      <span className="md:block md:font-semibold md:text-gray-500 md:mb-1">TODAY'S GOLD RATE</span>
      {loading ? (
        <span className="md:text-lg md:font-medium md:text-gray-600">Loading...</span>
      ) : error ? (
        <span className="md:text-sm md:font-medium md:text-red-500">{error}</span>
      ) : data ? (
        <>
          <span className="md:text-xl md:font-bold md:text-amber-600">₹{Number(data.NetRate).toLocaleString()}/gm</span>
          <span className="hidden md:inline text-gray-400 text-xs ml-2">({data.Purity})</span>
        </>
      ) : (
        <span className="md:text-sm md:font-medium md:text-gray-600">—</span>
      )}
    </div>
  );
}

const sampleUser = {
  name: "Arun Kumar",
  phone: "9876543210",
  profileCompletion: 60,
};

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentSchemes, setCurrentSchemes] = useState([]);
  const [schemesLoading, setSchemesLoading] = useState(true);
  const [schemesError, setSchemesError] = useState(null);

  const schemesState = useSelector((state) => state.scheme?.schemes?.data || {});

  useEffect(() => {
    const storeId = Constants.mykalyanStoreId || 3;
    const request = { store_id: storeId };
    dispatch(fetchSchemeDetails({ request, onSuccess: () => {} }));
  }, [dispatch]);

  useEffect(() => {
    const mobileNumber = localStorage.getItem(Constants.localStorageKey.mobileNumber);
    if (!mobileNumber) {
      setCurrentSchemes([]);
      setSchemesLoading(false);
      return;
    }
    setSchemesLoading(true);
    setSchemesError(null);
    getSchemesByMobileNumber(mobileNumber)
      .then((res) => {
        if (!res || res.status !== 200) {
          setCurrentSchemes([]);
          setSchemesError(res?.data?.error?.message || "Failed to load schemes");
          return;
        }
        const err = res.data?.error;
        if (err && err.status !== 200) {
          setCurrentSchemes([]);
          return;
        }
        const responseData = res.data?.data?.Response?.data;
        if (!responseData?.profile?.enrollmentList?.length) {
          setCurrentSchemes([]);
          return;
        }
        setCurrentSchemes(responseData.profile.enrollmentList);
      })
      .catch(() => {
        setCurrentSchemes([]);
        setSchemesError("Failed to load schemes");
      })
      .finally(() => setSchemesLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 to-white">
      {/* Main content - header is in Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:px-8">
        <div className="md:grid md:grid-cols-12 md:gap-8">
          {/* Left Column (Profile & Live Rate) */}
          <div className="md:col-span-4 lg:col-span-3">
             {/* Live rate */}
            <LiveGoldRate />

            {/* Profile completion */}
            <div className="bg-white rounded-xl shadow p-5 mb-6 md:sticky md:top-6 animate-slide-up hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3">
                <FaUserCircle size={28} className="text-gray-400" />
                <div>
                  <h3 className="font-semibold">
                    Complete Your Profile
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {sampleUser.profileCompletion}% completed
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 h-2 rounded mt-4">
                <div
                  className="bg-amber-600 h-2 rounded"
                  style={{
                    width: `${sampleUser.profileCompletion}%`,
                  }}
                />
              </div>

              <button
                onClick={() => navigate("/profile-edit")}
                className="mt-4 w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Update Profile
              </button>
            </div>
          </div>

          {/* Right Column (Schemes) */}
          <div className="md:col-span-8 lg:col-span-9">
            {/* Current schemes */}
            <h3 className="font-semibold text-lg mb-3">
              Current Schemes
            </h3>

            {schemesLoading ? (
              <div className="text-gray-500 py-8 text-center">Loading current schemes...</div>
            ) : schemesError ? (
              <div className="text-red-500 py-4 text-sm">{schemesError}</div>
            ) : currentSchemes.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
                No current schemes. Enroll to get started.
              </div>
            ) : (
              <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0">
                {currentSchemes.map((enrollment, i) => (
                  <button
                    type="button"
                    key={enrollment.EnrollmentID}
                    style={{ animationDelay: `${0.2 + i * 0.06}s` }}
                    onClick={() => navigate("/scheme-details", { state: { enrollment } })}
                    className="w-full text-left bg-white rounded-xl shadow p-4 animate-slide-up opacity-0 [animation-fill-mode:forwards] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-gray-100 cursor-pointer"
                  >
                    <h4 className="font-semibold mb-2 text-amber-900">
                      {enrollment.PlanType}
                    </h4>

                    <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span className="flex items-center gap-1 text-gray-500">
                        <FaCoins className="text-amber-500" /> Paid
                      </span>
                      <strong>
                        ₹{Number(enrollment.TotalPaidAmount || 0).toLocaleString()}
                      </strong>
                    </div>

                    <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-500">EMI</span>
                      <strong>₹{Number(enrollment.EMIAmount || 0).toLocaleString()}/mo</strong>
                    </div>

                    <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-500">Tenure</span>
                      <strong>{enrollment.NoMonths || 0} months</strong>
                    </div>

                    <div className="flex justify-between text-sm py-1 pt-2">
                      <span className="flex items-center gap-1 text-gray-500">
                        <FaChartLine className="text-green-500" /> Redeemable
                      </span>
                      <strong className="text-green-600">
                        ₹{Number(enrollment.FinalRedeemableAmount || 0).toLocaleString()}
                      </strong>
                    </div>

                    <div className="mt-2">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded ${enrollment.Status === "Open" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"}`}>
                        {enrollment.Status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Recommended schemes */}
            <h3 className="font-semibold text-lg mb-3 mt-6">
              Recommended Schemes
            </h3>

            <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-visible">
              {/** Use API-driven schemes if available, otherwise fallback to static SCHEME_DATA */}
              {schemesState?.data && schemesState.data.length > 0 ? (
                schemesState.data
                  .map((s, i) => ({
                    name: s.scheme_name || `Scheme ${s.id}`,
                    tenure: s.no_of_installment
                      ? String(s.no_of_installment)
                      : "-",
                    monthlyAmount:
                      s.min_installment_amount ??
                      s.max_instamment_amount ??
                      0,
                    gradient: [
                      "from-emerald-600 to-emerald-700",
                      "from-orange-600 to-orange-700",
                      "from-sky-600 to-sky-700",
                      "from-amber-600 to-amber-700",
                    ][i % 4],
                  }))
                  .map((item, i) => (
                    <div
                      key={`${item.name}-${i}`}
                      style={{ animationDelay: `${i * 0.08}s` }}
                      className="min-w-[220px] bg-white rounded-xl shadow md:min-w-0 flex flex-col h-full animate-slide-up opacity-0 [animation-fill-mode:forwards] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div
                        className={`bg-gradient-to-r ${item.gradient} text-white p-4 text-center font-semibold rounded-t-xl transition-transform duration-300 group-hover:scale-[1.02]`}
                      >
                        {item.name}
                      </div>

                      <div className="p-4 text-sm space-y-2 flex-1 flex flex-col">
                        <p>
                          Tenure:{" "}
                          <span className="font-medium text-gray-900">
                            {item.tenure} months
                          </span>
                        </p>
                        <p>
                          Monthly: ₹
                          <span className="font-medium text-gray-900">
                            {Number(item.monthlyAmount).toLocaleString()}
                          </span>
                        </p>

                        <div className="flex-1" />
                        <button
                          className="w-full bg-amber-600 text-white py-2 rounded-lg mt-2 hover:bg-amber-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                          onClick={() => navigate("/enroll")}
                        >
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="col-span-full flex justify-center w-full">
                  <div className="w-full max-w-md bg-white border rounded-xl shadow p-6 text-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                      No schemes found
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                      Currently there are no schemes available. Please try again later.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
