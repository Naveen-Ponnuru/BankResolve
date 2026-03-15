import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faBuilding } from "@fortawesome/free-solid-svg-icons";
import DashboardOverview from "../components/DashboardOverview";

const CustomerDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const selectedBank = useSelector((state) => state.bank?.selectedBank);

  return (
    <div className="space-y-8 pt-2 pb-12">
      {/* ─── Header with Bank Context ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.fullName?.split(" ")[0] || "Customer"}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm flex items-center space-x-2">
            <FontAwesomeIcon icon={faBuilding} className="text-blue-500" />
            <span>{user?.bankName || selectedBank?.name || "Bank"} — Grievance Dashboard</span>
          </p>
        </div>
        <Link
          to="/customer/file-grievance"
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          aria-label="File a new grievance"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>File Grievance</span>
        </Link>
      </div>

      {/* ─── Bank Context Card ─── */}
      {(user?.bankName || selectedBank) && (
        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faBuilding} className="text-white text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-blue-900 dark:text-blue-100">
              {user?.bankName || selectedBank?.name}
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Bank Code: {user?.bankCode || selectedBank?.code} ·{" "}
              {selectedBank?.branchCount?.toLocaleString() || "N/A"} Branches · RBI
              Compliant
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900/40 rounded-full">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-green-700 dark:text-green-300">
              Active
            </span>
          </div>
        </div>
      )}

      {/* ─── Unified Dashboard Overview (Metrics, Charts, Filters, Table) ─── */}
      <DashboardOverview />
    </div>
  );
};

export default CustomerDashboard;
