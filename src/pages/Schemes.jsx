import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchemeDetails } from "../store/scheme/schemesApi";
import Constants from "../utils/constants";

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

  const schemesState = useSelector(
    (state) => state.scheme?.schemes?.data || {}
  );

  // On mount, fetch schemes for configured store id
  useEffect(() => {
    const storeId = Constants.mykalyanStoreId || 3;
    const request = { 
      store_id: storeId
    };

    dispatch(
      fetchSchemeDetails({
        request,
        onSuccess: (data) => {
          console.log("Schemes fetched successfully:", data);
        },
      })
    );
  }, [dispatch]);

  // Normalize API response
  const transformedApiList =
    schemesState.data && schemesState.data.length
      ? schemesState.data.map((s, idx) => ({
          schemeId: s.id,
          name: s.scheme_name || `Scheme ${s.id}`,
          tenure: s.no_of_installment
            ? Number(s.no_of_installment)
            : 12,
          tenureStr: s.no_of_installment ? String(s.no_of_installment) : "-",
          membershipFee: s.min_installment_amount ?? null,
          optedAmount:
            s.max_instamment_amount ??
            s.min_installment_amount ??
            null,
          firstInstallment: s.min_installment_amount ?? null,
          color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
        }))
      : [];

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return "N/A";
    const n = Number(val);
    if (Number.isNaN(n)) return "N/A";
    return `₹${n.toLocaleString("en-IN")}`;
  };

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
              Explore plans and enroll in the one that suits you best.
              Secure your future with our trusted gold schemes.
            </p>
          </div>

          {/* Scheme cards */}
          <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8">
            {transformedApiList.length > 0 ? (
              transformedApiList.map((item, i) => (
                <div
                  key={item.name}
                  style={{ animationDelay: `${i * 0.1}s` }}
                  className="rounded-2xl bg-white mb-5 md:mb-0 border shadow-sm animate-slide-up opacity-0 [animation-fill-mode:forwards] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Gradient header */}
                  <div
                    className={`bg-gradient-to-r ${item.color} py-4 px-4`}
                  >
                    <h2 className="text-white font-bold text-center text-lg md:text-xl">
                      {item.name}
                    </h2>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <Row
                      label="Tenure"
                      value={`${item.tenureStr} months`}
                    />
                    <Row
                      label="Monthly Instalment"
                      value={formatCurrency(item.optedAmount)}
                    />
                    <Row
                      label="Membership Fee"
                      value={formatCurrency(item.membershipFee)}
                    />
                    <Row
                      label="1st Installment Payable"
                      value={formatCurrency(item.firstInstallment)}
                    />

                    <div className="flex-1" />
                    <button
                      onClick={() =>
                        navigate("/enroll", {
                          state: {
                            schemeId: item.schemeId,
                            schemeName: item.name,
                            tenure: item.tenure,
                            membershipFee: item.membershipFee,
                            defaultEmi: item.optedAmount ?? item.firstInstallment ?? 5000,
                            userId,
                          },
                        })
                      }
                      className={`w-full mt-4 py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${item.color} shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300`}
                    >
                      Enroll in this Scheme
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex justify-center">
                <div className="w-full max-w-md rounded-2xl bg-white border shadow-sm p-8 text-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    No schemes found
                  </h2>
                  <p className="text-sm text-gray-500 mt-2">
                    Currently there are no schemes available. Please
                    try again later.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-none text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
