import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { logoutApp } from "../store/auth/authApi";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileName, setProfileName] = useState("Profile");

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("profile");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.fullName) setProfileName(data.fullName);
      }
    } catch (_) {}
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () =>
        document.removeEventListener("click", handleClickOutside);
    }
  }, [profileDropdownOpen]);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    dispatch(logoutApp({}, navigate));
  };

  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "Schemes", path: "/schemes" },
    { name: "Transactions", path: "/transactions" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* WHITE HEADER */}
      <div className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className=" mx-auto px-4 md:px-8 py-3 flex items-center justify-between">

          {/* LEFT LOGO */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/home")}
          >
            <div className="w-10 h-10 bg-amber-600 rounded flex items-center justify-center text-white font-bold text-xl shadow">
              K
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-800 leading-tight">
                Kalyan
              </h1>
              <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">
                GSS
              </p>
            </div>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive(link.path)
                    ? "bg-amber-100 text-amber-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4 relative">

            {/* PROFILE DESKTOP */}
            <div
              className="hidden md:block relative"
              ref={profileDropdownRef}
            >
              <button
                onClick={() =>
                  setProfileDropdownOpen((prev) => !prev)
                }
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
              >
                <FaUserCircle size={18} />
                <span className="text-sm font-medium">
                  Profile
                </span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {profileName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Account
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate("/profile-edit");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setMenuOpen(true)}
            >
              <FaBars size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      >
        <div
          className={`fixed top-0 right-0 w-[80%] max-w-sm h-full bg-white shadow-2xl transform transition-transform duration-500 ease-out p-6 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">Menu</h2>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  navigate(link.path);
                  setMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-xl font-medium transition ${
                  isActive(link.path)
                    ? "bg-amber-100 text-amber-800"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.name}
              </button>
            ))}

            <div className="border-t border-gray-100 my-4 pt-4" />

            <button
              onClick={() => {
                navigate("/profile-edit");
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
            >
              <FaUserCircle size={18} />
              My Profile
            </button>

            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50"
            >
              <FaSignOutAlt size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}