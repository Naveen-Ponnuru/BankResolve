import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faCheckDouble,
  faBriefcase,
  faArrowRightArrowLeft,
  faChartLine,
  faBell,
  faFileCircleCheck,
  faBuilding,
  faArrowTrendUp,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import KPICard from "../ui/KPICard";
import ComplaintsTable from "../ui/ComplaintsTable";
import StatusBadgeWithLabel from "../ui/StatusBadgeWithLabel";
import QuickActionCard from "../ui/QuickActionCard";
import Modal from "../ui/Modal";
import SLATimer from "../ui/SLATimer";
import SkeletonLoader from "../ui/SkeletonLoader";
import EmptyState from "../ui/EmptyState";
import { selectBank } from "../store/bankSlice";
import { selectUser } from "../store/auth-slice";
import { toast } from "react-toastify";

// ─── Priority Badge ───────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const colors = {
    HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border uppercase ${colors[priority] || ""}`}>
      {priority}
    </span>
  );
};

// ─── Mock SVG Bar Chart ───────────────────────────────────────────────────────
const TrendChart = ({ data }) => {
  const maxVal = Math.max(...data.map((d) => d.total));
  return (
    <div>
      <div className="flex items-end space-x-2 h-32">
        {data.map((item) => {
          const heightPct = maxVal > 0 ? (item.total / maxVal) * 100 : 0;
          const resolvedPct = item.total > 0 ? (item.resolved / item.total) * 100 : 0;
          return (
            <div key={item.month} className="flex-1 flex flex-col items-center space-y-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.total}</span>
              <div
                className="w-full rounded-t-md relative overflow-hidden bg-blue-100 dark:bg-blue-900/30 min-h-[4px]"
                style={{ height: `${Math.max(heightPct, 8)}%` }}
                title={`${item.month}: ${item.total} total, ${item.resolved} resolved`}
              >
                <div
                  className="absolute bottom-0 w-full bg-blue-500 dark:bg-blue-400 rounded-t-md transition-all"
                  style={{ height: `${resolvedPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex space-x-2 mt-2">
        {data.map((item) => (
          <div key={item.month} className="flex-1 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">{item.month}</span>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center space-x-4 mt-3">
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Total Cases</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500 dark:bg-blue-400"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Resolved</span>
        </div>
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const ManagerDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionType, setActionType] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedBank = useSelector(selectBank);
  const user = useSelector(selectUser);

  const trendData = [
    { month: "Sep", total: 89, resolved: 72 },
    { month: "Oct", total: 105, resolved: 91 },
    { month: "Nov", total: 118, resolved: 98 },
    { month: "Dec", total: 97, resolved: 84 },
    { month: "Jan", total: 134, resolved: 119 },
    { month: "Feb", total: 121, resolved: 107 },
  ];

  const mockEscalated = [
    {
      id: "GRV-2026-105",
      customerName: "Chris Evans",
      category: "Credit Card",
      assignedStaff: "Robert Smith",
      subject: "Unauthorized transaction dispute - escalated",
      targetSLA: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: "in-progress",
      priority: "HIGH",
      reason: "SLA Breached limit. Staff unresponsive.",
      date: "2026-02-20",
    },
    {
      id: "GRV-2026-112",
      customerName: "Anna Taylor",
      category: "Fraud",
      assignedStaff: "Jane Doe",
      subject: "Large unauthorized withdrawal - ₹25,000",
      targetSLA: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      status: "open",
      priority: "CRITICAL",
      reason: "Fraud allegation > ₹20,000",
      date: "2026-02-24",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setComplaints(mockEscalated);
      setMetrics({
        escalations: mockEscalated.length,
        compliance: "94.2%",
        complianceTrend: "+1.2%",
        totalCases: "1,284",
        caseTrend: "-54",
        resolution: "89%",
        resolutionTrend: "+2.1%",
      });
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (complaint, type) => {
    setSelectedComplaint(complaint);
    setActionType(type);
    setIsModalOpen(true);
  };

  const submitAction = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setComplaints((prev) => prev.filter((c) => c.id !== selectedComplaint.id));
      setIsProcessing(false);
      setIsModalOpen(false);
      toast.success(
        actionType === "REASSIGN"
          ? `Grievance #${selectedComplaint.id} has been reassigned.`
          : `Resolution approved for #${selectedComplaint.id}.`
      );
    }, 1000);
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "priority", label: "Priority", render: (v) => <PriorityBadge priority={v} /> },
    { key: "customerName", label: "Customer" },
    { key: "assignedStaff", label: "Staff" },
    {
      key: "subject",
      label: "Subject",
      render: (value) => (
        <span className="truncate max-w-xs block" title={value}>{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadgeWithLabel status={v} size="sm" />,
    },
    {
      key: "id",
      label: "Actions",
      render: (value) => {
        const complaint = complaints.find((c) => c.id === value);
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleAction(complaint, "REASSIGN")}
              className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 text-xs px-2 py-1 rounded border border-orange-200 dark:border-orange-800 transition-colors font-medium"
              title="Reassign to another staff"
              aria-label={`Reassign ${value}`}
            >
              <FontAwesomeIcon icon={faArrowRightArrowLeft} />
            </button>
            <button
              onClick={() => handleAction(complaint, "APPROVE")}
              className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 text-xs px-2 py-1 rounded border border-green-200 dark:border-green-800 transition-colors font-medium"
              title="Approve Resolution"
              aria-label={`Approve ${value}`}
            >
              <FontAwesomeIcon icon={faCheckDouble} />
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <SkeletonLoader count={3} />;

  return (
    <div className="space-y-8 pt-2 pb-12">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manager Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center space-x-2">
            <FontAwesomeIcon icon={faBuilding} className="text-blue-500" />
            <span>{selectedBank?.name || "Bank"} — {user?.name || "Manager"}</span>
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md">
          <FontAwesomeIcon icon={faChartLine} className="mr-2" />
          Full Reports
        </button>
      </div>

      {/* ─── KPI Cards (4 cards) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Escalations"
          value={metrics?.escalations || 0}
          icon={faExclamationCircle}
          bgColor="bg-red-50"
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          darkBgColor="dark:bg-red-900/30"
          darkIconBgColor="dark:bg-red-800"
          darkIconColor="dark:text-red-400"
          subtitle="Needs intervention"
        />
        <KPICard
          title="SLA Compliance"
          value={metrics?.compliance}
          icon={faShieldHalved}
          bgColor="bg-green-50"
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          darkBgColor="dark:bg-green-900/30"
          darkIconBgColor="dark:bg-green-800"
          darkIconColor="dark:text-green-400"
          trend={metrics?.complianceTrend}
          trendUp={true}
        />
        <KPICard
          title="Total Cases (Month)"
          value={metrics?.totalCases}
          icon={faBriefcase}
          bgColor="bg-blue-50"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          darkBgColor="dark:bg-blue-900/30"
          darkIconBgColor="dark:bg-blue-800"
          darkIconColor="dark:text-blue-400"
          subtitle="Branch total"
        />
        <KPICard
          title="Resolution Rate"
          value={metrics?.resolution}
          icon={faCheckDouble}
          bgColor="bg-purple-50"
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          darkBgColor="dark:bg-purple-900/30"
          darkIconBgColor="dark:bg-purple-800"
          darkIconColor="dark:text-purple-400"
          trend={metrics?.resolutionTrend}
          trendUp={true}
        />
      </div>

      {/* ─── Quick Actions ─── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickActionCard
            title="Active Escalations"
            description="Review grievances requiring intervention"
            icon={faBell}
            onClick={() => { }}
            bgColor="bg-red-50"
            darkBgColor="dark:bg-red-900/30"
            iconColor="text-red-600"
            darkIconColor="dark:text-red-400"
          />
          <QuickActionCard
            title="Performance Analytics"
            description="View team and branch metrics"
            icon={faChartLine}
            onClick={() => toast.info("Full analytics coming soon!")}
            bgColor="bg-purple-50"
            darkBgColor="dark:bg-purple-900/30"
            iconColor="text-purple-600"
            darkIconColor="dark:text-purple-400"
          />
          <QuickActionCard
            title="Resolution Trends"
            description="Check improvement patterns over time"
            icon={faFileCircleCheck}
            onClick={() => toast.info("Trend analysis coming soon!")}
            bgColor="bg-green-50"
            darkBgColor="dark:bg-green-900/30"
            iconColor="text-green-600"
            darkIconColor="dark:text-green-400"
          />
        </div>
      </div>

      {/* ─── Trend Chart + SLA Panel Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaint Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Complaint Trend
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last 6 months</p>
            </div>
            <div className="flex items-center space-x-1.5 text-green-600 dark:text-green-400">
              <FontAwesomeIcon icon={faArrowTrendUp} className="text-sm" />
              <span className="text-xs font-semibold">+12% resolved</span>
            </div>
          </div>
          <TrendChart data={trendData} />
        </div>

        {/* SLA Compliance Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <FontAwesomeIcon icon={faShieldHalved} className="text-green-500" />
            <span>SLA Compliance by Category</span>
          </h3>
          <div className="space-y-4">
            {[
              { label: "Credit Card Disputes", pct: 91 },
              { label: "Fraud Cases", pct: 78 },
              { label: "Loan Queries", pct: 96 },
              { label: "Account Services", pct: 98 },
            ].map(({ label, pct }) => {
              const color = pct >= 90 ? "bg-green-500" : pct >= 75 ? "bg-yellow-500" : "bg-red-500";
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{label}</span>
                    <span className={pct >= 90 ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${color} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Escalated Table ─── */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Escalated Grievances Action Queue
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Complaints requiring managerial review and action
          </p>
        </div>

        {complaints.length === 0 ? (
          <EmptyState
            message="No escalated complaints"
            description="Excellent branch performance!"
            icon={faCheckDouble}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <ComplaintsTable
              data={complaints}
              columns={columns}
              loading={false}
              onViewClick={(c) => handleAction(c, "REASSIGN")}
              emptyMessage="No escalated complaints — excellent branch performance!"
              pageSize={5}
            />
          </div>
        )}
      </div>

      {/* ─── Action Modal ─── */}
      {isModalOpen && selectedComplaint && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => !isProcessing && setIsModalOpen(false)}
          title={actionType === "REASSIGN" ? "Reassign Grievance" : "Approve Resolution"}
        >
          <form onSubmit={submitAction} className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  #{selectedComplaint.id} — {selectedComplaint.customerName}
                </p>
                <PriorityBadge priority={selectedComplaint.priority} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{selectedComplaint.subject}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium bg-red-50 dark:bg-red-900/20 inline-block px-2 py-0.5 rounded">
                Reason: {selectedComplaint.reason}
              </p>
              <div className="mt-2">
                <SLATimer targetDate={selectedComplaint.targetSLA} compact />
              </div>
            </div>

            {actionType === "REASSIGN" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select New Staff Member
                </label>
                <select
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                >
                  <option value="">Select a staff member...</option>
                  <option value="1">John Smith (Senior Level 2)</option>
                  <option value="2">Sarah Jenkins (Fraud Expert)</option>
                  <option value="3">Mike Wilson (Credit Specialist)</option>
                </select>
              </div>
            )}

            {actionType === "APPROVE" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Approval Notes (Internal)
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Document the resolution and any follow-ups..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-500 resize-y"
                />
              </div>
            )}

            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isProcessing}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${isProcessing ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                {isProcessing ? "Processing..." : "Confirm Action"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManagerDashboard;
