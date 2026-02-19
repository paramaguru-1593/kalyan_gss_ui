import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchTermsAndCondition } from "../store/scheme/schemesApi";
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { logout } from "../store/auth/authSlice";
import Constants from "../utils/constants";
import { POST } from "../api/apiHelper";
import ApiEndpoints from "../api/apiEndPoints";
import Images from "../images/images";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileName, setProfileName] = useState("Profile");
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profileDropdownRef = useRef(null);

  // Profile name from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("profile");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.fullName) setProfileName(data.fullName);
      }
    } catch (_) {}
  }, [location.pathname]);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [profileDropdownOpen]);

  // Detect scroll for styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    const mobileNumber = localStorage.getItem(Constants.localStorageKey.mobileNumber);
    if (mobileNumber) {
      try {
        await POST(ApiEndpoints.logout, { mobile_number: mobileNumber });
      } catch (_) {}
    }
    localStorage.removeItem(Constants.localStorageKey.accessToken);
    localStorage.removeItem(Constants.localStorageKey.tokenType);
    localStorage.removeItem(Constants.localStorageKey.mobileNumber);
    localStorage.removeItem(Constants.localStorageKey.userId);
    localStorage.removeItem(Constants.localStorageKey.loginEmail);
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "Schemes", path: "/schemes" },
    { name: "Transactions", path: "/transactions" },
  ];

  const isActive = (path) => location.pathname === path;

  // Optimized terms fetch logic
  const handleTermsClick = async () => {
    try {
      setMenuOpen(false);
      const stored = localStorage.getItem("transactions");
      let schemeId = "1035"; // Default fallback

      if (stored) {
        const list = JSON.parse(stored);
        const last = Array.isArray(list) && list.length ? list[0] : null;
        schemeId = last?.scheme_id || last?.schemeId || schemeId;
      }

      const payload = await dispatch(
        fetchTermsAndCondition({ request: { scheme_id: String(schemeId) } })
      ).unwrap();

      navigate(`/terms/${encodeURIComponent(String(schemeId))}`, {
        state: { preloaded: payload },
      });
    } catch (err) {
      console.error("Terms load error:", err);
      // Optional: use a toast instead of alert for better premium feel
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-lg py-2 border-b border-amber-100/50"
            : "bg-white py-4 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/home")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 animate-header-logo">
              K
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900 leading-tight group-hover:text-amber-700 transition-colors duration-300">
                Kalyan
              </h1>
              <p className="text-[10px] text-amber-600 font-semibold tracking-wider uppercase">
                Jewellers
              </p>
            </div>
          </div>

          {/* <div className="flex justify-center mb-6 md:mb-8">
            <div className="w-40 h-20 md:w-56 md:h-28 flex items-center justify-center transition-transform hover:scale-105 duration-300">
              <img
                src={Images.KJLogo}
                alt="Logo"
                className=" w-[5rem] h-[5rem] md:w-[6rem] md:h-[6rem] object-contain"
              />
            </div>
          </div> */}

          {/* Desktop Nav - active route highlighted */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  isActive(link.path)
                    ? "text-amber-800 bg-gradient-to-r from-amber-100 to-amber-50 shadow-sm ring-1 ring-amber-200/60 scale-[1.02]"
                    : "text-gray-600 hover:text-amber-700 hover:bg-amber-50/80 hover:scale-[1.02]"
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-500 rounded-full animate-nav-underline" />
                )}
              </button>
            ))}

            {/* Terms button (desktop) - Styled same as other nav buttons */}
            <button
              onClick={handleTermsClick}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${location.pathname.startsWith("/terms")
                ? "text-amber-800 bg-gradient-to-r from-amber-100 to-amber-50 shadow-sm ring-1 ring-amber-200/60 scale-[1.02]"
                : "text-gray-600 hover:text-amber-700 hover:bg-amber-50/80 hover:scale-[1.02]"
                }`}
            >
              Terms & Conditions
              {location.pathname.startsWith("/terms") && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-500 rounded-full animate-nav-underline" />
              )}
            </button>
          </nav>

          {/* User & Mobile Toggle */}
          <div className="flex items-center gap-4" ref={profileDropdownRef}>
             {/* Desktop Profile Button - opens dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileDropdownOpen((o) => !o)}
                className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-gradient-to-r from-gray-50 to-white text-gray-700 rounded-full hover:shadow-md hover:scale-105 transition-all duration-300 border border-gray-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <FaUserCircle size={18} />
                </div>
                <span className="text-sm font-medium">Profile</span>
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate" title={profileName}>
                      {profileName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Account</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate("/profile-edit");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2"
                  >
                    <FaUserCircle size={14} />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <FaSignOutAlt size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setMenuOpen(true)}
            >
              <FaBars size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className={`transition-all duration-300 ${scrolled ? "h-20" : "h-20"}`} />

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      >
        {/* Sidebar */}
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
            {navLinks.map((link, idx) => (
              <button
                key={link.name}
                onClick={() => {
                  navigate(link.path);
                  setMenuOpen(false);
                }}
                style={{ animationDelay: `${idx * 0.08}s` }}
                className={`block w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300 animate-slide-up opacity-0 [animation-fill-mode:forwards] ${
                  isActive(link.path)
                    ? "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-l-4 border-amber-500 shadow-sm font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:pl-6"
                }`}
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={handleTermsClick}
              className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-amber-50 hover:text-amber-800 transition animate-slide-up opacity-0 [animation-fill-mode:forwards] delay-300"
            >
              <span className="text-gray-600">Terms & Conditions</span>
            </button>

            <div className="border-t border-gray-100 my-4 pt-4" />
            
            <button
              onClick={() => {
                navigate("/profile-edit");
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-amber-700 transition animate-slide-up opacity-0 fill-mode-forwards delay-300"
            >
              <FaUserCircle size={20} />
              My Profile
            </button>
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition"
            >
              <FaSignOutAlt size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
