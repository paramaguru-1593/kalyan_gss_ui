import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchTermsAndCondition } from "../store/scheme/schemesApi";
import { fetchTermsSuccess, fetchTermsStart, fetchTermsFailure } from "../store/scheme/schemeSlice";
import { FaArrowLeft, FaCheck } from "react-icons/fa";

export default function Terms() {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [agreed, setAgreed] = useState(false);

  // If a caller preloaded the terms payload, use it to avoid refetch
  const preloaded = location.state?.preloaded;

  const termsState = useSelector((s) => s.scheme.terms || {});
  console.log(termsState,'termsState');

  useEffect(() => {
    if (!schemeId) return;
    if (preloaded) {
      dispatch(fetchTermsSuccess(preloaded));
      return;
    }

    dispatch(
      fetchTermsStart({ request: { scheme_id: String(schemeId) } })
    );
  }, [dispatch, schemeId, preloaded]);

  // Helper to parse HTML/Text into points if it's currently a blob of text or <li> tags
  const renderTerms = (data) => {
    if (!data) return null;

    // If data contains <li> tags, it's likely already a list
    if (data.includes("<li") || data.includes("<ul") || data.includes("<ol")) {
      return (
        <div
          className="prose max-w-none text-gray-700 space-y-4"
          dangerouslySetInnerHTML={{ __html: data }}
        />
      );
    }

    // Otherwise, try to split by common delimiters (newlines or numbered points)
    const points = data
      .split(/\n|<br\s*\/?>/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (points.length > 1) {
      return (
        <ul className="space-y-4">
          {points.map((point, idx) => (
            <li key={idx} className="flex gap-3 text-gray-700">
              <span
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: point.replace(/^\d+[\.\)]\s*/, "") }}
              />
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div
        className="text-gray-700 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: data }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pt-4">
      {/* Navbar section */}
      <div className="flex items-center justify-between px-4 pb-4 border-b">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Terms & Conditions</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 max-w-2xl mx-auto w-full">
        {/* Header Section */}
        {/* <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Scheme Agreement</h2>
          <p className="text-sm text-gray-500">Please read carefully before proceeding</p>
        </div> */}

        {/* Content Section */}
        <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
          {termsState.isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Loading terms...</p>
            </div>
          ) : termsState.error ? (
            <div className="text-center py-10">
              <p className="text-red-500 font-medium">Failed to load terms.</p>
              <button
                onClick={() => dispatch(fetchTermsAndCondition({ request: { scheme_id: String(schemeId) } }))}
                className="mt-4 text-sm text-blue-600 font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : termsState.data ? (
            renderTerms(termsState.data)
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No terms available for this scheme.</p>
            </div>
          )}
        </div>

        {/* Agreement Checkbox */}
        {termsState.data && !termsState.isLoading && (
          <div className="space-y-6 pb-10">
            {/* <div
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${agreed ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                }`}
              onClick={() => setAgreed(!agreed)}
            >
              <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-colors ${agreed ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                }`}>
                {agreed && <FaCheck className="text-white text-xs" />}
              </div>
              <p className="text-sm text-gray-700 leading-snug">
                I have read and agree to all the terms and conditions mentioned above for this scheme enrollment.
              </p>
            </div> */}

            {/* <button
              onClick={() => agreed && navigate(-1)}
              disabled={!agreed}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform active:scale-95 ${agreed
                ? "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                }`}
            >
              Accept & Continue
            </button> */}
          </div>
        )}
      </div>
    </div>
  );
}
