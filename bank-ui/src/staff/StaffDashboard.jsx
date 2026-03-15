import React from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import DashboardOverview from "../components/DashboardOverview";

const StaffDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const selectedBank = useSelector((state) => state.bank?.selectedBank);

  return (
    <div className="space-y-8 pt-2 pb-12">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Staff Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center space-x-2">
            <FontAwesomeIcon icon={faBuilding} className="text-blue-500" />
            <span>{user?.bankName || selectedBank?.name || "Bank"} — {user?.fullName || "Staff"}</span>
          </p>
        </div>
      </div>

      {/* ─── Unified Dashboard Overview ─── */}
      <DashboardOverview />
    </div>
  );
};

export default StaffDashboard;
