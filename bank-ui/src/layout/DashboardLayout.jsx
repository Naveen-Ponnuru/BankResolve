import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, logout } from "../store/auth-slice";
import { selectBank } from "../store/bankSlice";
import { ROLES } from "../constants/roles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faFilePen,
  faListCheck,
  faUsersCog,
  faSignOutAlt,
  faBars,
  faTimes,
  faMoon,
  faSun,
  faBell,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import useTheme from "../hooks/useTheme";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector(selectUser);
  const selectedBank = useSelector(selectBank);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Centralized theme — synced across all layouts
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Normalize role from either user.role or user.roles[]
  let role = ROLES.CUSTOMER;
  if (user) {
    if (Array.isArray(user.roles) && user.roles.length > 0) {
      role = user.roles[0].replace(/^ROLE_/i, "").toUpperCase();
    } else if (typeof user.role === "string") {
      role = user.role.replace(/^ROLE_/i, "").toUpperCase();
    }
  }

  const getRoleBadgeColor = (r) => {
    switch (r) {
      case "ADMIN": return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300";
      case "MANAGER": return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "STAFF": return "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getNavigation = () => {
    switch (role) {
      case ROLES.CUSTOMER:
        return [
          { name: "Dashboard", href: "/customer/dashboard", icon: faChartPie },
          { name: "File Grievance", href: "/customer/file-grievance", icon: faFilePen },
          { name: "Track Complaints", href: "/customer/track", icon: faListCheck },
        ];
      case ROLES.STAFF:
        return [
          { name: "Staff Dashboard", href: "/staff/dashboard", icon: faChartPie },
          { name: "Assigned Complaints", href: "/staff/dashboard", icon: faListCheck },
        ];
      case ROLES.MANAGER:
        return [
          { name: "Manager Dashboard", href: "/manager/dashboard", icon: faChartPie },
          { name: "Escalated Cases", href: "/manager/dashboard", icon: faListCheck },
          { name: "Reports", href: "/manager/dashboard", icon: faFilePen },
        ];
      case ROLES.ADMIN:
        return [
          { name: "Admin Dashboard", href: "/admin/dashboard", icon: faChartPie },
          { name: "User Management", href: "/admin/dashboard", icon: faUsersCog },
          { name: "System Config", href: "/admin/dashboard", icon: faListCheck },
        ];
      default:
        return [];
    }
  };

  const navigation = getNavigation();
  const currentPage =
    navigation.find((n) => location.pathname.startsWith(n.href))?.name ||
    "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* =========== SIDEBAR =========== */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        aria-label="Sidebar navigation"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
            GrievanceHub
          </span>
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getRoleBadgeColor(role)}`}
          >
            {role}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  }`}
                aria-current={isActive ? "page" : undefined}
              >
                <FontAwesomeIcon icon={item.icon} className="w-4 h-4 mr-3 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer — Bank Context */}
        {selectedBank && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-2 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <FontAwesomeIcon icon={faBuilding} className="text-blue-600 dark:text-blue-400 text-sm flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold truncate">
                  {selectedBank.name}
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-400">
                  Code: {selectedBank.code}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* =========== MAIN CONTENT =========== */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* ===== TOPBAR ===== */}
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors duration-200">
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <FontAwesomeIcon icon={faBars} size="lg" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                {currentPage}
              </h1>
              {selectedBank && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                  <FontAwesomeIcon icon={faBuilding} className="text-blue-500" />
                  <span>{selectedBank.name}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button
              className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Notifications"
            >
              <FontAwesomeIcon icon={faBell} />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" aria-hidden="true"></span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <FontAwesomeIcon icon={isDark ? faSun : faMoon} className={isDark ? "text-amber-400" : ""} />
            </button>

            {/* User Info + Logout */}
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {user?.name || "User"}
                </p>
                <p className={`text-xs font-medium px-2 py-0.5 rounded-full ${getRoleBadgeColor(role)}`}>
                  {role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                aria-label="Logout"
                title="Logout"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            </div>
          </div>
        </header>

        {/* ===== DASHBOARD CONTENT ===== */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
