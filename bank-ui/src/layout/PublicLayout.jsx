import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectBank } from "../store/bankSlice";

/**
 * PublicLayout — wraps public pages (Home, About, Contact).
 *
 * The top Header is rendered by AppShell (the parent in the route tree)
 * so this layout must NOT add a second navbar.
 */
const PublicLayout = () => {
  const selectedBank = useSelector(selectBank);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200 flex flex-col">
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
                <span>BankResolve</span>
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
                    <NavLink
                      to={l.to}
                      className={({ isActive }) =>
                        `transition-colors no-underline hover:no-underline hover:text-blue-400 ${isActive ? "text-blue-500 font-semibold" : "text-gray-600 dark:text-gray-400"
                        }`
                      }
                    >
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <a href="mailto:support@bankresolve.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                    Email Support
                  </a>
                </li>
                <li>
                  <a href="tel:+919876543210" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                    Call Us
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => { }}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <button type="button" onClick={() => { }} className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => { }} className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">
                    Terms
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; 2026 BankResolve. All rights reserved. | RBI Compliant Grievance Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
