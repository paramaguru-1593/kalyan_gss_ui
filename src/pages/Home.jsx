import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaCoins,
  FaChartLine,
} from "react-icons/fa";

const SCHEME_DATA = {
  "DHAN SAMRIDDHI": {
    tenure: "12",
    monthlyAmount: 5000,
    gradient: "from-emerald-600 to-emerald-700",
  },
  "Gold Harvest Scheme": {
    tenure: "24",
    monthlyAmount: 10000,
    gradient: "from-orange-600 to-orange-700",
  },
  "DHAN SAMRIDDHI": {
    tenure: "12",
    monthlyAmount: 5000,
    gradient: "from-emerald-600 to-emerald-700",
  },
};

const sampleUser = {
  name: "Arun Kumar",
  phone: "9876543210",
  profileCompletion: 60,
};

const sampleSchemes = [
  {
    id: "1",
    schemeType: "DHAN SAMRIDDHI",
    invested: 15000,
    grams: 2.4,
    currentValue: 14800,
  },
  {
    id: "2",
    schemeType: "Gold Harvest Scheme",
    invested: 40000,
    grams: 6.3,
    currentValue: 39000,
  },
  {
    id: "3",
    schemeType: "DHAN SAMRIDDHI",
    invested: 15000,
    grams: 2.4,
    currentValue: 14800,
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 to-white">
      {/* Main content - header is in Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:px-8">
        <div className="md:grid md:grid-cols-12 md:gap-8">
          {/* Left Column (Profile & Live Rate) */}
          <div className="md:col-span-4 lg:col-span-3">
             {/* Live rate */}
            <div className="text-center text-sm mb-4 md:text-left md:mb-6 md:bg-white md:p-4 md:rounded-xl md:shadow-sm md:border md:border-amber-100 animate-fade-in transition-shadow duration-300 hover:shadow-md">
              <span className="md:block md:font-semibold md:text-gray-500 md:mb-1">TODAY'S GOLD RATE</span>
              <span className="md:text-xl md:font-bold md:text-amber-600">₹6,182/gm</span>
              <span className="hidden md:inline text-gray-400 text-xs ml-2">(24k)</span>
            </div>

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
            {/* Recommended schemes */}
            <h3 className="font-semibold text-lg mb-3">
              Recommended Schemes
            </h3>

            <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-visible">
              {Object.keys(SCHEME_DATA).map((name, i) => (
                <div
                  key={name}
                  style={{ animationDelay: `${i * 0.08}s` }}
                  className="min-w-[220px] bg-white rounded-xl shadow md:min-w-0 flex flex-col h-full animate-slide-up opacity-0 [animation-fill-mode:forwards] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={`bg-gradient-to-r ${SCHEME_DATA[name].gradient} text-white p-4 text-center font-semibold rounded-t-xl transition-transform duration-300 group-hover:scale-[1.02]`}
                  >
                    {name}
                  </div>

                  <div className="p-4 text-sm space-y-2 flex-1 flex flex-col">
                    <p>
                      Tenure:{" "}
                      <span className="font-medium text-gray-900">{SCHEME_DATA[name].tenure} months</span>
                    </p>
                    <p>
                      Monthly: ₹
                      <span className="font-medium text-gray-900">{SCHEME_DATA[name].monthlyAmount.toLocaleString()}</span>
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
              ))}
            </div>

            {/* Current schemes */}
            <h3 className="font-semibold text-lg mb-3 mt-6">
              Current Schemes
            </h3>

            <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0">
              {sampleSchemes.map((scheme, i) => (
                <div
                  key={scheme.id}
                  style={{ animationDelay: `${0.2 + i * 0.06}s` }}
                  className="bg-white rounded-xl shadow p-4 animate-slide-up opacity-0 [animation-fill-mode:forwards] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-gray-100"
                >
                  <h4 className="font-semibold mb-2 text-amber-900">
                    {scheme.schemeType}
                  </h4>

                  <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                    <span className="flex items-center gap-1 text-gray-500">
                      <FaCoins className="text-amber-500" /> Invested
                    </span>
                    <strong>
                      ₹{scheme.invested.toLocaleString()}
                    </strong>
                  </div>

                  <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                    <span className="text-gray-500">⚖️ Gms</span>
                    <strong>{scheme.grams}</strong>
                  </div>

                  <div className="flex justify-between text-sm py-1 pt-2">
                    <span className="flex items-center gap-1 text-gray-500">
                      <FaChartLine className="text-green-500" /> Current
                    </span>
                    <strong className="text-green-600">
                      ₹{scheme.currentValue.toLocaleString()}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
