import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen font-sans flex items-center justify-center lg:p-4 bg-[linear-gradient(to_bottom,theme(colors.amber.500)_0%,theme(colors.amber.700)_20%,theme(colors.gray.100)_20%)]">
      {/* Header + main = 90vh, centered; bg overlay like second image (orange top-right, gray left-bottom) */}
      <div className="h-screen lg:h-[90vh] w-full lg:w-[85vw] 2xl:w-[85vw] flex flex-col overflow-hidden lg:rounded-xl shadow-2xl">
        <Header />
        <main className="flex-1 min-h-0 flex flex-col bg-white">
          <div
            key={location.pathname}
            className="animate-fade-in flex-1 min-h-0 flex flex-col overflow-hidden"
          >
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
              <div className="px-4 py-6 lg:px-8 md:py-10 flex-1 bg-white">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
