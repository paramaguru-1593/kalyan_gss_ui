import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-100 to-white px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">
          Oops!
        </h1>

        <p className="text-gray-600 mb-6">
          This screen doesn't exist.
        </p>

        <button
          onClick={() => navigate("/")}
          className="bg-amber-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          Go to home screen
        </button>
      </div>
    </div>
  );
}
