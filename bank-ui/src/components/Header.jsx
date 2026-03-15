import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated, selectUser, logout } from "../store/auth-slice";
import { selectBank, selectAvailableBanks, setBank } from "../store/bankSlice";
import { normalizeRole } from "../utils/roleUtils";
import useTheme from "../hooks/useTheme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faChevronDown,
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

  // ─── Bank ────────────────────────────────────────────────────────────────
  const selectedBank = useSelector(selectBank);
  const banks = useSelector(selectAvailableBanks);
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);

  // ─── Theme ───────────────────────────────────────────────────────────────
  const { isDark, toggleTheme } = useTheme();

  // ─── Mobile menu ─────────────────────────────────────────────────────────
  const [mobileOpen, setMobileOpen] = useState(false);

  // ─── Derived: role label ─────────────────────────────────────────────────
  const role = reduxUser ? normalizeRole(reduxUser.role) : null;
  const roleLabel = role || "";

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleBankSelect = (bank) => {
    dispatch(setBank(bank));
    setBankDropdownOpen(false);
  };

  const authenticatedBankName = reduxUser?.bankName || reduxUser?.bank?.name || selectedBank?.name;
  // Move logging to useEffect to avoid React render errors
  React.useEffect(() => {
    if (isAuthenticated && reduxUser) {
      console.log("Authenticated Bank:", reduxUser.bankName);
    }
    console.log("Header Auth State:", isAuthenticated);
  }, [isAuthenticated, reduxUser]);

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
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main navigation">
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
                        role === "ADMIN" ? "/admin/dashboard" :
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

          {/* ── Right slot: bank + theme + auth ───────────────────────────── */}
          <div className="hidden md:flex items-center space-x-3">

            {/* Bank Selector */}
            {!isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBankDropdownOpen((o) => !o)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 border border-blue-200 dark:border-gray-600 transition"
                  aria-haspopup="listbox"
                  aria-expanded={bankDropdownOpen}
                  aria-label="Select bank"
                >
                  <span className="text-sm">🏦</span>
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 max-w-[120px] truncate">
                    {selectedBank?.name ?? "Select Bank"}
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-xs text-blue-600 dark:text-blue-400 transition-transform duration-200 ${bankDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Dropdown */}
                {bankDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setBankDropdownOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden"
                      role="listbox"
                      aria-label="Available banks"
                    >
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                        Select Bank
                      </div>
                      {banks.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => handleBankSelect(bank)}
                          role="option"
                          aria-selected={selectedBank?.id === bank.id}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition flex justify-between items-center ${selectedBank?.id === bank.id
                            ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold"
                            : "text-gray-700 dark:text-gray-200"
                            }`}
                        >
                          <span>{bank.name}</span>
                          {selectedBank?.id === bank.id && (
                            <span className="text-blue-600 dark:text-blue-400 text-xs">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 opacity-90 cursor-default" title="Your Bank">
                <span className="text-sm">🏦</span>
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 max-w-[200px] truncate">
                  Authenticated Bank: {authenticatedBankName || "Bank"}
                </span>
              </div>
            )}

            {/* Notifications */}
            {isAuthenticated && <NotificationBell />}

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <FontAwesomeIcon
                icon={isDark ? faSun : faMoon}
                className={isDark ? "text-amber-400" : "text-gray-600"}
              />
            </button>

            {/* ─── Auth: Login/Register OR User+Logout ─── */}
            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-500 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {reduxUser?.username || reduxUser?.name || "User"}
                  </span>
                  {roleLabel && (
                    <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {roleLabel}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 border border-red-500 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* ── Mobile: theme toggle + hamburger ─────────────────────────── */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <FontAwesomeIcon
                icon={isDark ? faSun : faMoon}
                className={isDark ? "text-amber-400" : "text-gray-600 dark:text-gray-300"}
              />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="p-2 text-gray-700 dark:text-gray-200"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
            >
              <FontAwesomeIcon icon={mobileOpen ? faTimes : faBars} />
            </button>
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
                    role === "ADMIN" ? "/admin/dashboard" :
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

            {/* Bank Selector (mobile) */}
            {!isAuthenticated ? (
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Select Bank
                </p>
                <div className="space-y-1">
                  {banks.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => {
                        handleBankSelect(bank);
                        setMobileOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedBank?.id === bank.id
                        ? "bg-blue-600 text-white font-semibold"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        }`}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Your Bank
                </p>
                <div className="w-full text-left px-3 py-2.5 rounded-lg text-sm bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300 font-semibold border border-blue-100 dark:border-gray-600 cursor-default flex items-center space-x-2">
                  <span>🏦</span>
                  <span className="truncate">{authenticatedBankName || "Bank"}</span>
                </div>
              </div>
            )}

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
                        {reduxUser?.username || reduxUser?.name || "User"}
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
