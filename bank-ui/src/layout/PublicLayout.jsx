import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faMoon,
  faSun,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { selectBank, setBank, selectAvailableBanks } from "../store/bankSlice";
import useTheme from "../hooks/useTheme";

const PublicLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);

  // ✅ Centralized theme — synced across all layouts
  const { isDark, toggleTheme } = useTheme();

  const selectedBank = useSelector(selectBank);
  const banks = useSelector(selectAvailableBanks);
  const dispatch = useDispatch();

  const handleBankSelect = (bank) => {
    dispatch(setBank(bank));
    setBankDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      {/* ============ NAVBAR ============ */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-50 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold text-blue-600 dark:text-blue-400"
            >
              <span className="text-2xl">🏦</span>
              <span>GrievanceHub</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
              >
                Contact
              </Link>

              {/* Bank Selector */}
              <div className="relative">
                <button
                  onClick={() => setBankDropdownOpen(!bankDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 transition border border-blue-200 dark:border-gray-600"
                  aria-label="Select bank"
                  aria-expanded={bankDropdownOpen}
                  aria-haspopup="listbox"
                >
                  <span className="text-sm">🏦</span>
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {selectedBank?.name}
                  </span>
                  <FontAwesomeIcon icon={faChevronDown} className="text-xs text-blue-600 dark:text-blue-400" />
                </button>

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

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                <FontAwesomeIcon
                  icon={isDark ? faSun : faMoon}
                  className={isDark ? "text-amber-400" : "text-gray-600"}
                />
              </button>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                >
                  Register
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                <FontAwesomeIcon
                  icon={isDark ? faSun : faMoon}
                  className={isDark ? "text-amber-400" : "text-gray-600"}
                />
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-gray-700 dark:text-gray-200"
                aria-label="Toggle mobile menu"
                aria-expanded={menuOpen}
              >
                <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden pb-4 space-y-1 border-t border-gray-100 dark:border-gray-700 pt-3">
              {["Home|/", "About|/about", "Contact|/contact"].map((item) => {
                const [label, path] = item.split("|");
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition font-medium"
                  >
                    {label}
                  </Link>
                );
              })}

              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Select Bank
                </p>
                <div className="space-y-1">
                  {banks.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => {
                        handleBankSelect(bank);
                        setMenuOpen(false);
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

              <div className="px-4 py-2 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-center border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ============ CONTENT ============ */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 mt-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4 flex items-center space-x-2 text-gray-900 dark:text-white">
                <span className="text-2xl">🏦</span>
                <span>GrievanceHub</span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enterprise bank grievance management system trusted by leading banks.
              </p>
              {selectedBank && (
                <div className="mt-3 inline-flex items-center space-x-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    {selectedBank.name}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {[
                  { label: "Home", to: "/" },
                  { label: "About", to: "/about" },
                  { label: "Contact", to: "/contact" },
                ].map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <a href="mailto:support@grievancehub.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                    Email Support
                  </a>
                </li>
                <li>
                  <a href="tel:+919876543210" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                    Call Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">FAQ</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; 2026 GrievanceHub. All rights reserved. | RBI Compliant Grievance Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
