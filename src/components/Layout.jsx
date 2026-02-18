
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      <main>
        {/* We use a key based on pathname to trigger animation on route change */}
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      {/* Optional Footer can go here */}
    </div>
  );
}
