import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStoreBasedSchemes } from "../store/scheme/schemeSlice";
import Constants from "../utils/constants";

const SCHEME_DATA = {
  "DHAN SAMRIDDHI": {
    tenure: "12",
    membershipFee: "3000",
    optedAmount: "5000",
    firstInstallment: "2000",
    color: "from-emerald-600 to-emerald-700",
  },
  "Gold Harvest Scheme": {
    tenure: "24",
    membershipFee: "6000",
    optedAmount: "10000",
    firstInstallment: "4000",
    color: "from-orange-600 to-orange-700",
  },
  "Smart Gold Saver Scheme": {
    tenure: "48",
    membershipFee: "12000",
    optedAmount: "20000",
    firstInstallment: "8000",
    color: "from-emerald-600 to-emerald-700",
  },
  "Golden Future Plan": {
    tenure: "96",
    membershipFee: "24000",
    optedAmount: "40000",
    firstInstallment: "16000",
    color: "from-orange-600 to-orange-700",
  },
};

const DEFAULT_COLORS = [
  "from-emerald-600 to-emerald-700",
  "from-orange-600 to-orange-700",
  "from-sky-600 to-sky-700",
  "from-amber-600 to-amber-700",
];

export default function Schemes() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId || "";
  const dispatch = useDispatch();

  const schemesState = useSelector((state) => state.scheme?.schemes || {});

  // On mount, fetch schemes for configured store id
  useEffect(() => {
    const storeId = Constants.mykalyanStoreId || 3;
    dispatch(fetchStoreBasedSchemes(storeId));
  }, [dispatch]);

  // Normalize API response to the UI shape used by the static SCHEME_DATA
  const transformedApiList = (schemesState.data && schemesState.data.length)
    ? schemesState.data.map((s, idx) => ({
        // incoming shape: { id, scheme_name, no_of_installment, min_installment_amount, max_instamment_amount, weight_allocation }
        name: s.scheme_name || `Scheme ${s.id}`,
        tenure: s.no_of_installment ? String(s.no_of_installment) : "-",
        // membershipFee / optedAmount / firstInstallment are approximated from returned fields
        membershipFee: s.min_installment_amount ?? 0,
        optedAmount: s.max_instamment_amount ?? s.min_installment_amount ?? 0,
        firstInstallment: s.min_installment_amount ?? 0,
        color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      }))
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col animate-fade-in">
      <div className="flex-1 overflow-y-auto px-4 pb-6 md:px-8">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mt-4 mb-6 md:mt-8 md:mb-10">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">
              Our Gold Saving Schemes
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-2 max-w-2xl mx-auto">
              Explore plans and enroll in the one that suits you best. Secure your future with our trusted gold schemes.
            </p>
          </div>

          {/* Scheme cards */}
          <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8">
            {(
              // prefer transformed API data when available, otherwise fallback to static SCHEME_DATA
              (transformedApiList && transformedApiList.length
                ? transformedApiList
                : Object.entries(SCHEME_DATA).map(([name, info]) => ({
                    name,
                    ...info,
                  })))
            ).map((item, i) => {
              const name = item.name || Object.keys(SCHEME_DATA)[i];
              const info = item?.tenure ? item : SCHEME_DATA[name];
              return (
                <div
                  key={name}
                  style={{ animationDelay: `${i * 0.1}s` }}
                  className="rounded-2xl bg-white mb-5 md:mb-0 border shadow-sm animate-slide-up opacity-0 [animation-fill-mode:forwards] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Gradient header */}
                  <div
                    className={`bg-gradient-to-r ${info.color} py-4 px-4`}
                  >
                    <h2 className="text-white font-bold text-center text-lg md:text-xl">
                      {name}
                    </h2>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <Row
                      label="Tenure"
                      value={`${info.tenure} months`}
                    />
                    <Row
                      label="Monthly Instalment"
                      value={`₹${Number(
                        info.optedAmount
                      ).toLocaleString("en-IN")}`}
                    />
                    <Row
                      label="Membership Fee"
                      value={`₹${Number(
                        info.membershipFee
                      ).toLocaleString("en-IN")}`}
                    />
                    <Row
                      label="1st Installment Payable"
                      value={`₹${Number(
                        info.firstInstallment
                      ).toLocaleString("en-IN")}`}
                    />

                    <div className="flex-1" />
                    <button
                      onClick={() =>
                        navigate("/enroll", {
                          state: {
                            scheme: name,
                            userId,
                          },
                        })
                      }
                      className={`w-full mt-4 py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${info.color} shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300`}
                    >
                      Enroll in this Scheme
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-none text-sm">
      <span className="text-gray-500">
        {label}
      </span>
      <span className="font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}
