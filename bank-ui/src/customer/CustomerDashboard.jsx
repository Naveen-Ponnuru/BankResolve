import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolderOpen,
  faFileCircleCheck,
  faHourglassHalf,
  faExclamationCircle,
  faPlus,
  faClipboardList,
  faLineChart,
  faBuilding,
  faShield,
  faArrowTrendUp,
} from "@fortawesome/free-solid-svg-icons";
import KPICard from "../ui/KPICard";
import ComplaintsTable from "../ui/ComplaintsTable";
import StatusBadgeWithLabel from "../ui/StatusBadgeWithLabel";
import QuickActionCard from "../ui/QuickActionCard";
import SkeletonLoader from "../ui/SkeletonLoader";
import EmptyState from "../ui/EmptyState";
import { selectBank } from "../store/bankSlice";
import { selectUser } from "../store/auth-slice";
import { toast } from "react-toastify";

// ─── SLA Progress Bar Component ──────────────────────────────────────────────
const SLAIndicator = ({ percentage, label }) => {
  const color =
    percentage >= 90
      ? "bg-green-500"
      : percentage >= 70
        ? "bg-yellow-500"
        : "bg-red-500";
  return (
    <div>
      <div className="flex justify-between text-xs font-medium mb-1.5">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span
          className={
            percentage >= 90
              ? "text-green-600 dark:text-green-400"
              : percentage >= 70
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-red-600 dark:text-red-400"
          }
        >
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  );
};

const CustomerDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const selectedBank = useSelector(selectBank);
  const user = useSelector(selectUser);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMetrics({
        total: 12,
        pending: 3,
        inProgress: 4,
        resolved: 5,
        trend: "+2 this week",
        slaCompliance: 92,
        avgResolutionDays: 2.4,
      });

      setRecentComplaints([
        {
          id: "GRV-2026-001",
          category: "Credit Card",
          subject: "Unauthorized transaction of ₹15,000",
          status: "open",
          date: "2026-02-24",
          priority: "HIGH",
        },
        {
          id: "GRV-2026-002",
          category: "Personal Loan",
          subject: "Interest rate dispute - incorrect calculation",
          status: "in-progress",
          date: "2026-02-23",
          priority: "MEDIUM",
        },
        {
          id: "GRV-2026-003",
          category: "Account Service",
          subject: "Unable to download monthly statement",
          status: "resolved",
          date: "2026-02-20",
          priority: "LOW",
        },
        {
          id: "GRV-2026-004",
          category: "Debit Card",
          subject: "Card declined at merchant despite sufficient balance",
          status: "in-progress",
          date: "2026-02-19",
          priority: "MEDIUM",
        },
      ]);

      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const priorityColors = {
    HIGH: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800",
    MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
    LOW: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800",
  };

  const columns = [
    { key: "id", label: "Grievance ID" },
    { key: "category", label: "Category" },
    {
      key: "subject",
      label: "Subject",
      render: (value) => (
        <span className="truncate max-w-xs block" title={value}>
          {value}
        </span>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (value) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${priorityColors[value] || ""}`}>
          {value}
        </span>
      ),
    },
    { key: "date", label: "Filed On" },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadgeWithLabel status={value} size="sm" />,
    },
  ];

  if (isLoading) {
    return <SkeletonLoader count={4} />;
  }

  return (
    <div className="space-y-8 pt-2 pb-12">
      {/* ─── Header with Bank Context ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0] || "Customer"}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm flex items-center space-x-2">
            <FontAwesomeIcon icon={faBuilding} className="text-blue-500" />
            <span>
              {selectedBank?.name || "Bank"} — Grievance Dashboard
            </span>
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
      {selectedBank && (
        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faBuilding} className="text-white text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-blue-900 dark:text-blue-100">{selectedBank.name}</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Bank Code: {selectedBank.code} · {selectedBank.branchCount?.toLocaleString()} Branches · RBI Compliant
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900/40 rounded-full">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-green-700 dark:text-green-300">Active</span>
          </div>
        </div>
      )}

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Complaints"
          value={metrics?.total || 0}
          icon={faFolderOpen}
          bgColor="bg-blue-50"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          darkBgColor="dark:bg-blue-900/30"
          darkIconBgColor="dark:bg-blue-800"
          darkIconColor="dark:text-blue-400"
          trend={metrics?.trend}
          trendUp={true}
        />
        <KPICard
          title="Open"
          value={metrics?.pending || 0}
          icon={faExclamationCircle}
          bgColor="bg-yellow-50"
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          darkBgColor="dark:bg-yellow-900/30"
          darkIconBgColor="dark:bg-yellow-800"
          darkIconColor="dark:text-yellow-400"
          subtitle="Requires attention"
        />
        <KPICard
          title="In Progress"
          value={metrics?.inProgress || 0}
          icon={faHourglassHalf}
          bgColor="bg-purple-50"
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          darkBgColor="dark:bg-purple-900/30"
          darkIconBgColor="dark:bg-purple-800"
          darkIconColor="dark:text-purple-400"
          subtitle="Being processed"
        />
        <KPICard
          title="Resolved"
          value={metrics?.resolved || 0}
          icon={faFileCircleCheck}
          bgColor="bg-green-50"
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          darkBgColor="dark:bg-green-900/30"
          darkIconBgColor="dark:bg-green-800"
          darkIconColor="dark:text-green-400"
          trend="95% satisfaction"
          trendUp={true}
        />
      </div>

      {/* ─── Quick Actions ─── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="File New Grievance"
            description="Report a new banking issue or complaint"
            icon={faPlus}
            link="/customer/file-grievance"
            bgColor="bg-blue-50"
            darkBgColor="dark:bg-blue-900/30"
            iconColor="text-blue-600"
            darkIconColor="dark:text-blue-400"
          />
          <QuickActionCard
            title="Track Complaint"
            description="Check status of your ongoing complaints"
            icon={faClipboardList}
            link="/customer/track"
            bgColor="bg-green-50"
            darkBgColor="dark:bg-green-900/30"
            iconColor="text-green-600"
            darkIconColor="dark:text-green-400"
          />
          <QuickActionCard
            title="View Reports"
            description="Analytics and resolution trends"
            icon={faLineChart}
            bgColor="bg-purple-50"
            darkBgColor="dark:bg-purple-900/30"
            iconColor="text-purple-600"
            darkIconColor="dark:text-purple-400"
            onClick={() => toast.info("Reports feature coming soon!")}
          />
        </div>
      </div>

      {/* ─── Recent Complaints Table ─── */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Recent Complaints
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Your latest grievances and their current status
            </p>
          </div>
          <Link
            to="/customer/track"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition flex items-center space-x-1"
          >
            <span>View All</span>
            <FontAwesomeIcon icon={faArrowTrendUp} className="text-xs" />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <EmptyState
            message="No complaints filed yet"
            description="File your first grievance to get started!"
            icon={faFolderOpen}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <ComplaintsTable
              data={recentComplaints}
              columns={columns}
              loading={false}
              onViewClick={(c) => toast.info(`Viewing complaint: ${c.id}`)}
              emptyMessage="No complaints filed yet. File your first grievance to get started!"
              pageSize={5}
            />
          </div>
        )}
      </div>

      {/* ─── SLA Commitment Panel ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faShield} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">SLA Commitment</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedBank?.name || "Bank"} resolution targets
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <SLAIndicator percentage={metrics?.slaCompliance || 92} label="Overall SLA Compliance" />
          <SLAIndicator percentage={88} label="Credit Card Disputes (Target: 2 days)" />
          <SLAIndicator percentage={95} label="Account Services (Target: 1 day)" />
          <SLAIndicator percentage={76} label="Loan Queries (Target: 3 days)" />
        </div>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1.5">
          <FontAwesomeIcon icon={faShield} className="text-green-500" />
          <span>Average resolution: <strong>{metrics?.avgResolutionDays} business days</strong></span>
        </p>
      </div>
    </div>
  );
};

export default CustomerDashboard;
