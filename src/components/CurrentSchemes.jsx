import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaCoins, FaChartLine, FaSearch } from "react-icons/fa";

const INITIAL_DISPLAY_COUNT = 3;

const BADGE_STYLES = {
  New: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Popular: "bg-amber-100 text-amber-700 border-amber-200",
  "Limited Offer": "bg-rose-100 text-rose-700 border-rose-200",
};

/**
 * Optional badge: New / Popular / Limited Offer.
 */
function SchemeBadge({ badge }) {
  if (!badge || !BADGE_STYLES[badge]) return null;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${BADGE_STYLES[badge]}`}
    >
      {badge}
    </span>
  );
}

/**
 * Single scheme card: title, description, optional badge, View Details CTA.
 * Hover: soft shadow, subtle scale. Rounded corners, spacing via Tailwind.
 */
function SchemeCard({ scheme, onViewDetails, index }) {
  const badge = scheme.badge ?? (scheme.Status === "Open" ? "Popular" : null);
  const description =
    scheme.description ||
    `EMI ₹${Number(scheme.EMIAmount || 0).toLocaleString()}/mo · ${scheme.NoMonths || 0} months tenure. Redeemable ₹${Number(scheme.FinalRedeemableAmount || 0).toLocaleString()}.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="group flex flex-col h-full rounded-2xl bg-white border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02] active:scale-[0.99]"
    >
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-3">
          <h4 className="font-bold text-[15px] text-slate-800 line-clamp-2 flex-1">
            {scheme.PlanType}
          </h4>
          <SchemeBadge badge={badge} />
        </div>

        <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">
          {description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-500 flex items-center gap-1.5">
              <FaCoins className="text-amber-500" /> Paid
            </span>
            <span className="font-semibold text-slate-900">
              ₹{Number(scheme.TotalPaidAmount || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-500 flex items-center gap-1.5">💳 EMI</span>
            <span className="font-semibold text-slate-900">
              ₹{Number(scheme.EMIAmount || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-500 flex items-center gap-1.5">
              <FaChartLine className="text-green-500" /> Redeemable
            </span>
            <span className="font-semibold text-green-600">
              ₹{Number(scheme.FinalRedeemableAmount || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(scheme)}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 shadow-sm hover:shadow-md transition-all duration-200 mt-auto"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Reusable Current Schemes section.
 *
 * - Initially shows first 3 schemes (slice).
 * - "Show All" expands to full list; "Show Less" collapses back to 3.
 * - Responsive: 1 col mobile, 2 col tablet, 3 col desktop (Tailwind).
 * - Toggle via useState; smooth expand/collapse and fade-in (framer-motion).
 * - Smooth scroll into view when expanding.
 * - Cards: title, description, optional badge (New / Popular / Limited Offer), CTA.
 */
export default function CurrentSchemes({ schemes = [], onViewDetails, loading, error }) {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const expandRef = useRef(null);

  const isExpandable = schemes.length > INITIAL_DISPLAY_COUNT;
  const baseList = showAll ? schemes : schemes.slice(0, INITIAL_DISPLAY_COUNT);

  // When showAll: filter by PlanType or EnrollmentID (case-insensitive)
  const displayList =
    showAll && searchTerm.trim()
      ? baseList.filter((scheme) => {
          const term = searchTerm.trim().toLowerCase();
          const planType = String(scheme.PlanType || "").toLowerCase();
          const enrollmentId = String(scheme.EnrollmentID ?? "").toLowerCase();
          return planType.includes(term) || enrollmentId.includes(term);
        })
      : baseList;

  const handleViewDetails = (scheme) => {
    if (onViewDetails) {
      onViewDetails(scheme);
    } else {
      navigate("/scheme-details", { state: { enrollment: scheme } });
    }
  };

  useEffect(() => {
    if (showAll && expandRef.current) {
      expandRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [showAll]);

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading current schemes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center">
        <p className="text-rose-500 font-medium">{error}</p>
      </div>
    );
  }

  if (!Array.isArray(schemes) || schemes.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-500 font-medium">
        No current schemes. Enroll to get started.
      </div>
    );
  }

  return (
    <div ref={expandRef} className="space-y-6">
      {showAll && (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Plan Type or Enrollment ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-slate-800 placeholder:text-slate-400 transition-all"
            />
          </div>
          {searchTerm.trim() && (
            <span className="text-sm text-slate-500">
              {displayList.length} result{displayList.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={showAll ? "expanded" : "collapsed"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {displayList.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
              <p className="font-medium">No schemes match your search.</p>
              <p className="text-sm mt-1">Try a different Plan Type or Enrollment ID.</p>
            </div>
          ) : (
            displayList.map((scheme, index) => (
              <SchemeCard
                key={scheme.EnrollmentID}
                scheme={scheme}
                index={index}
                onViewDetails={handleViewDetails}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {isExpandable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-1"
        >
          <button
            type="button"
            onClick={() => {
              setShowAll((prev) => !prev);
              if (showAll) setSearchTerm("");
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 transition-all duration-200"
          >
            {showAll ? "Show Less" : "Show All"}
          </button>
        </motion.div>
      )}
    </div>
  );
}
