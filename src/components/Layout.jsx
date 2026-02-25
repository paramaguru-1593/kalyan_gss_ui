import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      <main className="">
        <div key={location.pathname} className="animate-fade-in">
          <div className="min-h-screen w-full bg-gray-100">
            {/* Center Wrapper */}
            <div className="flex justify-center items-center px-4">
              {/* Glass Container */}
              <div className="w-full lg:w-[85vw] lg:h-[80vh] lg:bg-gray-50 lg:backdrop-blur-md lg:border border-gray-200 mb-10 flex flex-col rounded-t-xl shadow-lg overflow-y-auto">
                {/* MAIN CONTENT */}
                <div className="flex-1 px-4 py-6 lg:px-8 md:py-10">
                  <Outlet/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Optional Footer can go here */}
    </div>
  );
}
