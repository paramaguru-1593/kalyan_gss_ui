import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaUserCircle,
} from "react-icons/fa";
import { getStoreGoldRate, getSchemesByMobileNumber, getProfileCompleteness } from "../api/apiHelper";
import { fetchSchemeDetails } from "../store/scheme/schemesApi";
import Constants from "../utils/constants";
import CurrentSchemes from "../components/CurrentSchemes";
import Loader from "../components/Loader";

/* ───────────────────── Design Config (Synced with Schemes.jsx) ───────────────────── */
const CARD_THEMES = [
  {
    bg: "bg-gradient-to-br from-[#fffdf5] to-[#fff9e6]",
    accent: "text-[#d4a017]",
    subtle: "bg-[#f5c842]",
    subtleIcon: "bg-[#f5c842]/10",
    btn: "bg-gradient-to-r from-amber-300 to-amber-500",
    btnHover: "hover:from-amber-400 hover:to-amber-600",
    btnText: "text-[#5a3e00]",
    label: "Gold Plan",
    iconPaths: (
      <>
        <path d="M16 18h16l-4 12H20L16 18z" fill="#f5c842" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M13 18h22M20 18l2-5h4l2 5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="27" r="3" fill="#d97706" />
      </>
    ),
  },
  {
    bg: "bg-gradient-to-br from-[#f7fef9] to-[#eefbf2]",
    accent: "text-green-600",
    subtle: "bg-green-400",
    subtleIcon: "bg-green-400/10",
    btn: "bg-gradient-to-r from-green-400 to-green-600",
    btnHover: "hover:from-green-500 hover:to-green-700",
    btnText: "text-white",
    label: "Savings Plan",
    iconPaths: (
      <>
        <path d="M12 32c0-6 4-10 12-10s12 4 12 10" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="19" r="5" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5" />
        <path d="M21 28l3 4 3-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    bg: "bg-gradient-to-br from-[#f5f9ff] to-[#edf4ff]",
    accent: "text-blue-600",
    subtle: "bg-blue-400",
    subtleIcon: "bg-blue-400/10",
    btn: "bg-gradient-to-r from-blue-400 to-blue-600",
    btnHover: "hover:from-blue-500 hover:to-blue-700",
    btnText: "text-white",
    label: "Premium Plan",
    iconPaths: (
      <path d="M24 14l3.5 7 7.5 1-5.5 5.5 1.5 7.5L24 31l-7 4 1.5-7.5L13 22l7.5-1L24 14z" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.5" strokeLinejoin="round" />
    ),
  },
  {
    bg: "bg-gradient-to-br from-[#f5d0fe] via-[#bae6fd] to-[#c7d2fe]",
    accent: "text-purple-600",
    subtle: "bg-purple-400",
    subtleIcon: "bg-purple-400/10",
    btn: "bg-gradient-to-r from-purple-300 to-purple-500",
    btnHover: "hover:from-purple-400 hover:to-purple-600",
    btnText: "text-white",
    label: "Elite Plan",
    iconPaths: (
      <>
        <path d="M18 28V20a6 6 0 1112 0v8" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" />
        <rect x="14" y="27" width="20" height="8" rx="3" fill="#c084fc" stroke="#9333ea" strokeWidth="1.5" />
        <circle cx="24" cy="31" r="2" fill="#9333ea" />
      </>
    ),
  },
];

const ROW_FIELDS = [
  { key: "tenureStr", label: "Tenure", icon: "📜", suffix: " months" },
  { key: "monthlyAmount", label: "Monthly Instalment", icon: "💳" },
];

/* ───────────────────── Internal Components (Synced) ───────────────────── */
function ThemeIcon({ theme }) {
  return (
    <div className={`p-2 rounded-xl flex-shrink-0 flex items-center justify-center ${theme.subtleIcon}`}>
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <circle cx="24" cy="24" r="22" className="fill-current opacity-10" />
        {theme.iconPaths}
      </svg>
    </div>
  );
}

function RecommendCard({ item, index, onEnroll }) {
  const t = item.theme;
  return (
    <div
      style={{ animationDelay: `${index * 0.08}s` }}
      className={`min-w-[260px] md:min-w-0 flex flex-col rounded-[20px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden animate-slideUp fill-mode-both ${t.bg}`}
    >
      <div className="p-4 flex items-start gap-3">
        <ThemeIcon theme={t} />
        <div className="flex-1 min-w-0">
          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase mb-1 ${t.subtleIcon} ${t.accent}`}>
            {t.label}
          </span>
          <h2 className="text-[14px] font-bold text-slate-800 m-0 leading-tight">
            {item.name}
          </h2>
        </div>
      </div>

      <div className="px-4 pb-4 flex-1 flex flex-col">
        <div className="space-y-2 mb-4">
          {ROW_FIELDS.map((field) => (
            <div key={field.key} className="flex justify-between items-center text-[13px]">
              <span className="text-gray-500 font-medium flex items-center gap-1.5">
                {field.icon} {field.label}
              </span>
              <span className={`font-bold ${t.accent}`}>
                {field.key === "monthlyAmount" ? `₹${Number(item[field.key]).toLocaleString()}` : `${item[field.key]}${field.suffix || ""}`}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onEnroll}
          className={`w-full py-2.5 rounded-xl text-[13px] font-bold shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${t.btn} ${t.btnText} ${t.btnHover}`}
        >
          Enroll Now
        </button>
      </div>
    </div>
  );
}

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
  profileCompletion: 0,
};

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMounted = useRef(true);

  const [currentSchemes, setCurrentSchemes] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const schemesState = useSelector((state) => state.scheme?.schemes ?? { data: [], isLoading: false, error: null });

  useEffect(() => {
    const storeId = Constants.mykalyanStoreId || 3;
    const request = { store_id: storeId };
    dispatch(fetchSchemeDetails({ request, onSuccess: () => {} }));
  }, [dispatch]);

  // Load getSchemesByMobileNumber and getProfileCompleteness in parallel; single loader until both finish.
  useEffect(() => {
    isMounted.current = true;
    const mobileNumber = localStorage.getItem(Constants.localStorageKey.mobileNumber) || "";
    if (!mobileNumber) {
      setCurrentSchemes([]);
      setProfileData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchAll = async () => {
      try {
        const [schemesRes, profileRes] = await Promise.all([
          getSchemesByMobileNumber(mobileNumber),
          getProfileCompleteness(mobileNumber),
        ]);

        if (!isMounted.current) return;

        // Handle schemes response
        if (!schemesRes || schemesRes.status !== 200) {
          setCurrentSchemes([]);
          setError(schemesRes?.data?.error?.message || "Failed to load schemes");
        } else {
          const err = schemesRes.data?.error;
          if (err && err.status !== 200) {
            setCurrentSchemes([]);
            setError(err.message || "Failed to load schemes");
          } else {
            const responseData = schemesRes.data?.data?.Response?.data;
            const list = responseData?.enrollmentList ?? responseData?.profile?.enrollmentList;
            setCurrentSchemes(Array.isArray(list) ? list : []);
            setError(null);
          }
        }

        // Handle profile completeness response (don't override schemes error)
        if (profileRes && profileRes.status === 200) {
          const payload = profileRes.data?.profile_completeness ?? profileRes.data;
          setProfileData(payload || null);
        } else {
          setProfileData(null);
        }
      } catch {
        if (isMounted.current) {
          setCurrentSchemes([]);
          setProfileData(null);
          setError("Failed to load data");
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const transformRecommend = useCallback((s, i) => ({
    schemeId: s.id,
    name: s.scheme_name || `Scheme ${s.id}`,
    tenure: s.no_of_installment ? Number(s.no_of_installment) : 12,
    tenureStr: s.no_of_installment ? String(s.no_of_installment) : "-",
    monthlyAmount: s.min_installment_amount ?? s.max_instamment_amount ?? 0,
    membershipFee: s.min_installment_amount ?? null,
    theme: CARD_THEMES[i % CARD_THEMES.length],
  }), []);

  const recommendedSchemes = useMemo(() => {
    const data = schemesState.data;
    if (!Array.isArray(data) || data.length === 0) return [];
    return data.slice(0, 3).map(transformRecommend);
  }, [schemesState.data, transformRecommend]);

  return (
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
                  <h3 className="font-semibold">Complete Your Profile</h3>
                  <p className="text-gray-500 text-sm">
                    {loading
                      ? "Loading..."
                      : error
                      ? error
                      : profileData
                      ? `${profileData.score ?? 0}% completed`
                      : `${sampleUser.profileCompletion}% completed`}
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 h-2 rounded mt-4 overflow-hidden">
                <div
                  className="bg-amber-600 h-2 rounded transition-all duration-500"
                  style={{
                    width: `${profileData ? (profileData.score ?? 0) : sampleUser.profileCompletion}%`,
                  }}
                />
              </div>

              {/* {profileData && Array.isArray(profileData.missing_fields) && profileData.missing_fields.length > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  <div className="font-medium text-sm mb-1">Missing fields:</div>
                  <ul className="list-disc ml-5 text-xs text-rose-600">
                    {profileData.missing_fields.slice(0, 6).map((f) => (
                      <li key={f}>{f.replace(/_/g, " ")}</li>
                    ))}
                    {profileData.missing_fields.length > 6 && <li>and more...</li>}
                  </ul>
                </div>
              )} */}

              <button
                onClick={() => navigate("/profile-edit")}
                disabled={loading}
                className="mt-4 w-full bg-amber-600 text-white py-2.5 rounded-xl font-semibold hover:bg-amber-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Update Profile
              </button>
            </div>
          </div>

          {/* Right Column (Schemes) */}
          <div className="md:col-span-8 lg:col-span-9">
            {/* User flow: Home → View schemes → Select scheme → Enroll */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-lg mb-0">
                Current Schemes
              </h3>
              <button
                type="button"
                onClick={() => navigate("/schemes")}
                disabled={loading}
                className="px-4 py-2.5 bg-white text-amber-700 border-2 border-amber-600 text-[13px] font-black rounded-xl hover:bg-amber-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-sm uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                View all schemes
              </button>
            </div>

            {loading ? (
              <Loader message="Loading schemes and profile..." />
            ) : (
              <CurrentSchemes
                schemes={currentSchemes}
                loading={false}
                error={error}
              />
            )}

            {/* Recommended for You / Our Gold Saving Schemes — 3 cards from storeBasedSchemeData */}
            <div className="mt-10 mb-5">
              <h3 className="font-black text-xl text-slate-800 m-0">Recommended for You</h3>
              <p className="text-slate-500 text-sm mt-1 mb-0">Our Gold Saving Schemes</p>
            </div>

            {schemesState.isLoading ? (
              <Loader message="Loading schemes..." />
            ) : (
            <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 md:grid md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-visible md:mx-0 md:px-0">
              {recommendedSchemes.length > 0 ? (
                recommendedSchemes.map((item, i) => (
                  <RecommendCard
                    key={`${item.schemeId}-${item.name}-${i}`}
                    item={item}
                    index={i}
                    onEnroll={() =>
                      navigate("/enroll", {
                        state: {
                          schemeId: item.schemeId,
                          schemeName: item.name,
                          tenure: item.tenure,
                          membershipFee: item.membershipFee,
                          defaultEmi: item.monthlyAmount,
                        },
                      })
                    }
                  />
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
            )}
          </div>
        </div>
    
  );
}
