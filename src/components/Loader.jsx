/**
 * Centered full-area loader (spinner).
 * Used while APIs are loading to prevent UI flicker and block interactions.
 */
export default function Loader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div
        className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"
        aria-hidden
      />
      {message && (
        <p className="mt-4 text-slate-500 text-sm font-medium">{message}</p>
      )}
    </div>
  );
}
