import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchemeDetails } from "../store/scheme/schemesApi";
import Constants from "../utils/constants";
import Loader from "../components/Loader";

/* ───────────────────── Theme Config ───────────────────── */
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

/* Row field definitions */
const ROW_FIELDS = [
  { key: "tenureStr", label: "Tenure", icon: "📜", suffix: " months" },
  { key: "optedAmount", label: "Monthly Instalment", icon: "💳", isCurrency: true },
  { key: "membershipFee", label: "Membership Fee", icon: "👥", isCurrency: true },
  { key: "firstInstallment", label: "1st Installment", icon: "💰", isCurrency: true },
];

/* ───────────────────── Helpers ───────────────────── */
const formatCurrency = (val) => {
  if (val == null) return "N/A";
  const n = Number(val);
  return Number.isNaN(n) ? "N/A" : `₹${n.toLocaleString("en-IN")}`;
};

const transformScheme = (s, idx) => ({
  schemeId: s.id,
  name: s.scheme_name || `Scheme ${s.id}`,
  description: s.description || s.scheme_description || null,
  tenure: s.no_of_installment ? Number(s.no_of_installment) : 12,
  tenureStr: s.no_of_installment ? String(s.no_of_installment) : "-",
  membershipFee: s.min_installment_amount ?? null,
  optedAmount: s.max_instamment_amount ?? s.min_installment_amount ?? null,
  firstInstallment: s.min_installment_amount ?? null,
  theme: CARD_THEMES[idx % CARD_THEMES.length],
});

/* ───────────────────── Icon component ───────────────────── */
function ThemeIcon({ theme }) {
  return (
    <div className={`p-2 rounded-xl flex-shrink-0 flex items-center justify-center ${theme.subtleIcon}`}>
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
        <circle cx="24" cy="24" r="22" className="fill-current opacity-10" />
        {theme.iconPaths}
      </svg>
    </div>
  );
}

/* ───────────────────── InfoRow ───────────────────── */
function InfoRow({ label, value, accentClass, icon, isLast }) {
  return (
    <div className={`flex justify-between items-center py-2.5 gap-2 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-sm leading-none">{icon}</span>
        <span className="text-[13px] text-gray-500 font-medium">{label}</span>
      </div>
      <span className={`text-[14px] font-bold whitespace-nowrap ${accentClass}`}>
        {value}
      </span>
    </div>
  );
}

/* ───────────────────── SchemeCard ───────────────────── */
function SchemeCard({ item, index, onEnroll }) {
  const t = item.theme;
  const description = item.description || `Save with ₹${formatCurrency(item.optedAmount ?? item.firstInstallment)}/month for ${item.tenureStr} months.`;

  return (
    <div
      style={{ animationDelay: `${index * 0.06}s` }}
      className={`relative flex flex-col rounded-2xl shadow-md hover:shadow-xl border border-white/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-slideUp [animation-fill-mode:both] ${t.bg}`}
    >
      {/* Header */}
      <div className="p-5 pb-3 flex items-start gap-3">
        <ThemeIcon theme={t} />
        <div className="flex-1 min-w-0">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase mb-1.5 ${t.subtleIcon} ${t.accent}`}>
            {t.label}
          </span>
          <h2 className="text-base font-bold text-slate-800 m-0 leading-tight break-words">
            {item.name}
          </h2>
          <p className="text-slate-500 text-[13px] mt-1.5 line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-5 flex-1 flex flex-col">
        <div className="space-y-0 rounded-xl bg-white/40 border border-white/60 p-4">
          {ROW_FIELDS.map((field, i) => (
            <InfoRow
              key={field.key}
              label={field.label}
              value={field.isCurrency ? formatCurrency(item[field.key]) : `${item[field.key]}${field.suffix || ""}`}
              accentClass={t.accent}
              icon={field.icon}
              isLast={i === ROW_FIELDS.length - 1}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onEnroll}
          className={`w-full mt-5 py-3.5 rounded-xl text-sm font-bold tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${t.btn} ${t.btnText} ${t.btnHover}`}
        >
          Enroll in this Scheme
        </button>
      </div>
    </div>
  );
}

/* ───────────────────── Main component ───────────────────── */
export default function Schemes() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId || "";
  const dispatch = useDispatch();

  const schemesState = useSelector((state) => state.scheme?.schemes ?? { data: [], isLoading: false, error: null });

  useEffect(() => {
    dispatch(
      fetchSchemeDetails({
        request: { store_id: Constants.mykalyanStoreId || 3 },
        onSuccess: () => {},
      })
    );
  }, [dispatch]);

  const schemeList = useMemo(() => {
    const data = schemesState.data;
    return Array.isArray(data) ? data.map(transformScheme) : [];
  }, [schemesState.data]);

  const handleEnroll = useCallback(
    (item) =>
      navigate("/enroll", {
        state: {
          schemeId: item.schemeId,
          schemeName: item.name,
          tenure: item.tenure,
          membershipFee: item.membershipFee,
          defaultEmi: item.optedAmount ?? item.firstInstallment ?? 5000,
          userId,
        },
      }),
    [navigate, userId]
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans selection:bg-amber-100">
      {/* Decorative top bar */}
      <div className="bg-gray-300 h-0.5" />

      <div className="max-w-[1240px] mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2.5 bg-white border-2 border-amber-200 rounded-full py-2 px-6 mb-5 shadow-sm">
            <svg viewBox="0 0 32 32" className="w-6 h-6 fill-none">
              <circle cx="16" cy="16" r="15" className="fill-amber-50" stroke="#f5c842" strokeWidth="1.5" />
              <path d="M8 22l4-10 4 6 4-6 4 10H8z" fill="#f5c842" stroke="#d97706" strokeWidth="1.2" strokeLinejoin="round" />
              <circle cx="8" cy="12" r="2" fill="#d97706" />
              <circle cx="16" cy="10" r="2" fill="#d97706" />
              <circle cx="24" cy="12" r="2" fill="#d97706" />
            </svg>
            <span className="text-[13px] font-black text-amber-700 tracking-widest uppercase">
              Kalyan Gold Schemes
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-amber-700 mb-2.5 tracking-tight">
            Our Gold Saving Schemes
          </h1>
          <p className="text-slate-500 text-[15px] max-w-md mx-auto leading-relaxed">
            Explore our trusted gold plans and enroll in the one that suits you best.
          </p>
        </div>

        {/* Cards — full list from storeBasedSchemeData */}
        {schemesState.isLoading ? (
          <Loader message="Loading gold saving schemes..." />
        ) : schemesState.error ? (
          <div className="col-span-full bg-white rounded-2xl border border-amber-200 py-12 px-6 text-center">
            <p className="text-amber-700 font-medium mb-2">Unable to load schemes</p>
            <p className="text-slate-500 text-sm">
              {typeof schemesState.error === "string"
                ? schemesState.error
                : schemesState.error?.message ?? "Please try again later."}
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {schemeList.length > 0 ? (
            schemeList.map((item, i) => (
              <SchemeCard
                key={item.schemeId}
                item={item}
                index={i}
                onEnroll={() => handleEnroll(item)}
              />
            ))
          ) : (
            <div className="col-span-full bg-white rounded-2xl border-2 border-dashed border-slate-200 py-16 px-8 text-center">
              <h2 className="text-slate-700 font-bold text-lg mb-1.5">No Schemes Found</h2>
              <p className="text-slate-500 text-sm">No gold saving schemes available for this store. Please try again later.</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
