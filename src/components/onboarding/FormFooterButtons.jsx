/**
 * Reusable footer for onboarding step forms.
 * Submit: triggers form submit (validation + API). Skip: no validation, no API, just navigate.
 */
export default function FormFooterButtons({
  onSubmit,
  onSkip,
  submitLabel = "Submit",
  skipLabel = "Skip",
  isLoading = false,
  submitDisabled = false,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-3 mt-6 ${className}`}>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading || submitDisabled}
        className={`w-full h-14 rounded-xl text-white font-semibold transition ${
          !isLoading && !submitDisabled
            ? "bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {isLoading ? "Saving..." : submitLabel}
      </button>
      <button
        type="button"
        onClick={onSkip}
        disabled={isLoading}
        className="text-amber-800 font-medium underline hover:no-underline disabled:opacity-50"
      >
        {skipLabel}
      </button>
    </div>
  );
}
