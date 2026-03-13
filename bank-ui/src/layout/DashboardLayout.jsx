import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../store/auth-slice";
import { selectBank } from "../store/bankSlice";
import { ROLES } from "../constants/roles";
import { normalizeRole } from "../utils/roleUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faFilePen,
  faListCheck,
  faUsersCog,
  faTimes,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector(selectUser);
  const selectedBank = useSelector(selectBank);
  const location = useLocation();

  // Normalize role from either user.role or user.roles[]
  let role = ROLES.CUSTOMER;
  if (user) {
    if (Array.isArray(user.roles) && user.roles.length > 0) {
      const firstRole = user.roles.find((r) => typeof r === "string");
      if (firstRole) {
        role = normalizeRole(firstRole);
      }
    } else if (typeof user.role === "string") {
      role = normalizeRole(user.role);
    }
  }

  useEffect(() => {
    const rawUserFromStorage =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let userRoles = [];
    if (user) {
      if (Array.isArray(user.roles) && user.roles.length > 0) {
        userRoles = user.roles
          .filter((r) => typeof r === "string")
          .map((r) => normalizeRole(r));
      } else if (typeof user.role === "string") {
        userRoles = [normalizeRole(user.role)];
      }
    }

    console.log("[DashboardLayout] mount/effect", {
      pathname: location.pathname,
      user,
      derivedRole: role,
      userRoles,
      rawUserFromStorage,
    });
  }, [location.pathname, role, user]);

  const getRoleBadgeColor = (r) => {
    switch (r) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300";
      case "MANAGER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "STAFF":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getNavigation = () => {
    switch (role) {
      case ROLES.CUSTOMER:
        return [
          { name: "Dashboard", href: "/customer/dashboard", icon: faChartPie },
          {
            name: "File Grievance",
            href: "/customer/file-grievance",
            icon: faFilePen,
          },
          {
            name: "Track Complaints",
            href: "/customer/track",
            icon: faListCheck,
          },
        ];
      case ROLES.STAFF:
        return [
          {
            name: "Staff Dashboard",
            href: "/staff/dashboard",
            icon: faChartPie,
          },
          {
            name: "Assigned Complaints",
            href: "/staff/dashboard",
            icon: faListCheck,
          },
        ];
      case ROLES.MANAGER:
        return [
          {
            name: "Manager Dashboard",
            href: "/manager/dashboard",
            icon: faChartPie,
          },
          {
            name: "Escalated Cases",
            href: "/manager/dashboard",
            icon: faListCheck,
          },
          {
            name: "Reports",
            href: "/manager/dashboard",
            icon: faFilePen,
          },
        ];
      case ROLES.ADMIN:
        return [
          {
            name: "Admin Dashboard",
            href: "/admin/dashboard",
            icon: faChartPie,
          },
          {
            name: "User Management",
            href: "/admin/dashboard",
            icon: faUsersCog,
          },
          {
            name: "System Config",
            href: "/admin/dashboard",
            icon: faListCheck,
          },
        ];
      default:
        return [];
    }
  };

  const navigation = getNavigation();

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
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
            BankResolve
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
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getRoleBadgeColor(
              role,
            )}`}
          >
            {role}
          </span>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 p-4 space-y-1 overflow-y-auto"
          aria-label="Main navigation"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors no-underline hover:no-underline hover:text-blue-400 ${isActive ? "text-blue-500 font-semibold" : "text-gray-700 dark:text-gray-300"
                }`
              }
            >
              <FontAwesomeIcon
                icon={item.icon}
                className="w-4 h-4 mr-3 flex-shrink-0"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer — Bank Context */}
        {selectedBank && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-2 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <FontAwesomeIcon
                icon={faBuilding}
                className="text-blue-600 dark:text-blue-400 text-sm flex-shrink-0"
              />
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
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8 transition-colors duration-200">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
