import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated, selectUser, logout } from "../store/auth-slice";
import { normalizeRole } from "../utils/roleUtils";
import useTheme from "../hooks/useTheme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import NotificationBell from "./NotificationBell";

// ─── Shared nav link classes ───────────────────────────────────────────────
const navLinkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium no-underline hover:no-underline hover:text-blue-400 ${isActive ? "text-blue-500 dark:text-blue-400 font-semibold" : "text-gray-700 dark:text-gray-200"
  }`;

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ─── Auth ────────────────────────────────────────────────────────────────
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const reduxUser = useSelector(selectUser);

  // ─── Theme ───────────────────────────────────────────────────────────────
  const { isDark, toggleTheme } = useTheme();

  // ─── Mobile menu ─────────────────────────────────────────────────────────
  const [mobileOpen, setMobileOpen] = useState(false);

  // ─── Derived: role label ─────────────────────────────────────────────────
  const role = reduxUser ? normalizeRole(reduxUser.role) : null;
  const roleLabel = role || "";

  React.useEffect(() => {
    console.log("Header Auth State:", isAuthenticated);
  }, [isAuthenticated]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-50 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 focus:outline-none shrink-0"
            aria-label="Go to home"
          >
            <span className="text-2xl">🏦</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              BankResolve
            </span>
          </button>

          {/* ── Desktop nav links ─────────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main navigation">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>

            {!isAuthenticated && (
              <>
                <NavLink to="/about" className={navLinkClass}>About</NavLink>
                <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
              </>
            )}

            {isAuthenticated && (
              <>
                <NavLink
                  to={
                    role === "MANAGER" ? "/manager/dashboard" :
                      role === "STAFF" ? "/staff/dashboard" :
                        "/customer/dashboard"
                  }
                  className={navLinkClass}
                >
                  My Dashboard
                </NavLink>
                {role === "CUSTOMER" && (
                  <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
                )}
              </>
            )}
          </nav>

          {/* ── Right slot: bank + actions + auth ───────────────────────────── */}
          <div className="flex items-center space-x-2 sm:space-x-3">



            {/* SHARED ACTIONS: Single Mount Point (Phase 6) */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {isAuthenticated && <NotificationBell />}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                aria-label="Toggle theme"
              >
                <FontAwesomeIcon icon={isDark ? faSun : faMoon} className={isDark ? "text-amber-400" : "text-gray-600 dark:text-gray-300"} />
              </button>
            </div>

            {/* Desktop Only: Auth buttons */}
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                <button onClick={() => navigate("/login")} className="px-4 py-1.5 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-500 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition">Login</button>
                <button onClick={() => navigate("/register")} className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition">Register</button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex flex-col items-end mr-1">
                  <span className="text-sm font-semibold dark:text-white truncate max-w-[120px]">{reduxUser?.name || reduxUser?.fullName || "User"}</span>
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">{roleLabel}</span>
                </div>
                <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 border border-red-500 hover:bg-red-50 transition">Logout</button>
              </div>
            )}

            {/* Mobile Only: Hamburger Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 text-gray-700 dark:text-gray-200 ml-1"
                aria-label="Menu"
              >
                <FontAwesomeIcon icon={mobileOpen ? faTimes : faBars} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu panel ────────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-3 space-y-1 border-t border-gray-100 dark:border-gray-700">
            {/* Nav links */}
            {[
              { label: "Home", path: "/", end: true, show: true },
              { label: "About", path: "/about", show: !isAuthenticated },
              { label: "Contact", path: "/contact", show: !isAuthenticated || role === "CUSTOMER" },
              {
                label: "My Dashboard",
                path: role === "MANAGER" ? "/manager/dashboard" :
                  role === "STAFF" ? "/staff/dashboard" :
                    "/customer/dashboard",
                show: isAuthenticated
              },
            ]
              .filter((link) => link.show)
              .map(({ label, path, end }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors no-underline hover:no-underline hover:text-blue-400 ${isActive ? "text-blue-500 font-semibold" : "text-gray-700 dark:text-gray-300"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}



            <div className="px-4 py-2">
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/login");
                      setMobileOpen(false);
                    }}
                    className="px-4 py-2.5 text-center border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/register");
                      setMobileOpen(false);
                    }}
                    className="px-4 py-2.5 text-center rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {reduxUser?.name || reduxUser?.fullName || "User"}
                      </p>
                      {roleLabel && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                          {roleLabel}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="w-full px-4 py-3 text-center rounded-xl font-bold text-red-600 dark:text-red-400 border-2 border-red-500/20 dark:border-red-400/20 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-[0.98]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
