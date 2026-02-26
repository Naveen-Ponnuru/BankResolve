import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListCheck,
  faExclamationCircle,
  faCheckDouble,
  faBell,
  faChartLine,
  faPenToSquare,
  faUpload,
  faBuilding,
  faUsers,
  faFlag,
} from "@fortawesome/free-solid-svg-icons";
import KPICard from "../ui/KPICard";
import ComplaintsTable from "../ui/ComplaintsTable";
import StatusBadgeWithLabel from "../ui/StatusBadgeWithLabel";
import QuickActionCard from "../ui/QuickActionCard";
import Modal from "../ui/Modal";
import FormSelect from "../ui/FormSelect";
import SLATimer from "../ui/SLATimer";
import SkeletonLoader from "../ui/SkeletonLoader";
import EmptyState from "../ui/EmptyState";
import { selectBank } from "../store/bankSlice";
import { selectUser } from "../store/auth-slice";
import { toast } from "react-toastify";

const PRIORITY_COLORS = {
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
  LOW: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
};

const PriorityBadge = ({ priority }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${PRIORITY_COLORS[priority] || ""}`}>
    {priority}
  </span>
);

const StaffDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedBank = useSelector(selectBank);
  const user = useSelector(selectUser);

  const mockComplaints = [
    {
      id: "GRV-2026-001",
      category: "Credit Card",
      subject: "Unauthorized transaction of ₹15,000",
      status: "open",
      date: "2026-02-24",
      customerName: "Jane Doe",
      priority: "HIGH",
      targetSLA: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      description: "I am reporting an unauthorized transaction of ₹15,000 on my credit card.",
    },
    {
      id: "GRV-2026-002",
      category: "Personal Loan",
      subject: "Interest rate dispute - incorrect calculation",
      status: "in-progress",
      date: "2026-02-23",
      customerName: "Robert Smith",
      priority: "MEDIUM",
      targetSLA: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      description: "The interest rate charged this month does not match my agreement.",
    },
    {
      id: "GRV-2026-003",
      category: "Account Service",
      subject: "Unable to download monthly statement",
      status: "resolved",
      date: "2026-02-20",
      customerName: "Alice Johnson",
      priority: "LOW",
      targetSLA: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      description: "I keep getting a 404 error when trying to download my account statement.",
    },
    {
      id: "GRV-2026-004",
      category: "Debit Card",
      subject: "Card declined at merchant despite sufficient balance",
      status: "in-progress",
      date: "2026-02-19",
      customerName: "Michael Chen",
      priority: "MEDIUM",
      targetSLA: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      description: "My debit card was declined even though I have sufficient balance.",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setComplaints(mockComplaints);
      const openCount = mockComplaints.filter((c) => c.status === "open").length;
      const slaBreached = mockComplaints.filter(
        (c) => new Date(c.targetSLA) < new Date() && c.status !== "resolved"
      ).length;
      const resolved = mockComplaints.filter((c) => c.status === "resolved").length;
      setMetrics({
        assigned: mockComplaints.length,
        open: openCount,
        slaBreach: slaBreached,
        resolved,
        trend: "+1 this week",
      });
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenModal = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateStatus(complaint.status);
    setResolutionNotes("");
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (!updateStatus || updateStatus === selectedComplaint.status) {
      toast.info("Status is already set to this value.");
      return;
    }
    setIsUpdating(true);
    setTimeout(() => {
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === selectedComplaint.id ? { ...c, status: updateStatus } : c
        )
      );
      setIsUpdating(false);
      setIsModalOpen(false);
      toast.success(`Complaint #${selectedComplaint.id} marked as ${updateStatus}`);
      setUpdateStatus("");
      setResolutionNotes("");
    }, 1000);
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filter === "ALL") return true;
    if (filter === "SLA_BREACHED")
      return new Date(c.targetSLA) < new Date() && c.status !== "resolved";
    return c.status === filter;
  });

  const filterTabs = [
    { key: "ALL", label: "All" },
    { key: "open", label: "Open" },
    { key: "in-progress", label: "In Progress" },
    { key: "SLA_BREACHED", label: "SLA Breached" },
  ];

  const columns = [
    { key: "id", label: "Grievance ID" },
    { key: "customerName", label: "Customer" },
    { key: "category", label: "Category" },
    {
      key: "subject",
      label: "Subject",
      render: (value) => (
        <span className="truncate max-w-xs block" title={value}>{value}</span>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (value) => <PriorityBadge priority={value} />,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadgeWithLabel status={value} size="sm" />,
    },
    {
      key: "id",
      label: "Action",
      render: (value) => (
        <button
          onClick={() => handleOpenModal(complaints.find((c) => c.id === value))}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1 rounded-md transition-colors font-medium text-xs"
          aria-label={`Update complaint ${value}`}
        >
          <FontAwesomeIcon icon={faPenToSquare} className="mr-1.5" />
          Update
        </button>
      ),
    },
  ];

  if (isLoading) return <SkeletonLoader count={3} />;

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
            <span>{selectedBank?.name || "Bank"} — {user?.name || "Staff"}</span>
          </p>
        </div>
      </div>

      {/* ─── KPI Cards (4 cards) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Assigned to Me"
          value={metrics?.assigned || 0}
          icon={faListCheck}
          bgColor="bg-blue-50"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          darkBgColor="dark:bg-blue-900/30"
          darkIconBgColor="dark:bg-blue-800"
          darkIconColor="dark:text-blue-400"
          subtitle="In your queue"
        />
        <KPICard
          title="Open Cases"
          value={metrics?.open || 0}
          icon={faUsers}
          bgColor="bg-yellow-50"
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          darkBgColor="dark:bg-yellow-900/30"
          darkIconBgColor="dark:bg-yellow-800"
          darkIconColor="dark:text-yellow-400"
          subtitle="Need first response"
        />
        <KPICard
          title="SLA Breached"
          value={metrics?.slaBreach || 0}
          icon={faExclamationCircle}
          bgColor="bg-red-50"
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          darkBgColor="dark:bg-red-900/30"
          darkIconBgColor="dark:bg-red-800"
          darkIconColor="dark:text-red-400"
          subtitle="Urgent action needed"
        />
        <KPICard
          title="Resolved Today"
          value={metrics?.resolved || 0}
          icon={faCheckDouble}
          bgColor="bg-green-50"
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          darkBgColor="dark:bg-green-900/30"
          darkIconBgColor="dark:bg-green-800"
          darkIconColor="dark:text-green-400"
          trend={metrics?.trend}
          trendUp={true}
        />
      </div>

      {/* ─── Quick Actions ─── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickActionCard
            title="My Queue"
            description="View all assigned complaints"
            icon={faBell}
            onClick={() => setFilter("ALL")}
            bgColor="bg-blue-50"
            darkBgColor="dark:bg-blue-900/30"
            iconColor="text-blue-600"
            darkIconColor="dark:text-blue-400"
          />
          <QuickActionCard
            title="SLA Breached"
            description="Complaints with expired SLA targets"
            icon={faExclamationCircle}
            onClick={() => setFilter("SLA_BREACHED")}
            bgColor="bg-red-50"
            darkBgColor="dark:bg-red-900/30"
            iconColor="text-red-600"
            darkIconColor="dark:text-red-400"
          />
          <QuickActionCard
            title="Performance"
            description="View your resolution stats"
            icon={faChartLine}
            bgColor="bg-purple-50"
            darkBgColor="dark:bg-purple-900/30"
            iconColor="text-purple-600"
            darkIconColor="dark:text-purple-400"
            onClick={() => toast.info("Performance analytics coming soon!")}
          />
        </div>
      </div>

      {/* ─── Workload Summary Bar ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <FontAwesomeIcon icon={faFlag} className="text-blue-500" />
          <span>Workload Summary</span>
        </h3>
        <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">
          {[
            { label: "Open", val: metrics?.open || 0, color: "text-yellow-600 dark:text-yellow-400" },
            { label: "In Progress", val: mockComplaints.filter((c) => c.status === "in-progress").length, color: "text-blue-600 dark:text-blue-400" },
            { label: "Resolved", val: metrics?.resolved || 0, color: "text-green-600 dark:text-green-400" },
          ].map(({ label, val, color }) => (
            <div key={label} className="text-center px-4">
              <p className={`text-2xl font-bold ${color}`}>{val}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Complaints Table ─── */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">My Active Queue</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Complaints assigned to you for resolution
            </p>
          </div>
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-xl">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === tab.key
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                aria-pressed={filter === tab.key}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredComplaints.length === 0 ? (
          <EmptyState
            message="No complaints in this filter"
            description="Great work! Your queue is clear."
            icon={faCheckDouble}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <ComplaintsTable
              data={filteredComplaints}
              columns={columns}
              loading={false}
              onViewClick={handleOpenModal}
              emptyMessage="No complaints in this filter. Great work!"
              pageSize={5}
            />
          </div>
        )}
      </div>

      {/* ─── Update Status Modal ─── */}
      {selectedComplaint && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => !isUpdating && setIsModalOpen(false)}
          title={`Update Grievance: ${selectedComplaint.id}`}
        >
          <form onSubmit={handleUpdateStatus} className="space-y-5">
            {/* Complaint Info */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-gray-900 dark:text-white flex-1">
                  {selectedComplaint.subject}
                </p>
                <PriorityBadge priority={selectedComplaint.priority} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {selectedComplaint.description}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Customer: <span className="font-semibold">{selectedComplaint.customerName}</span>
                </p>
                <SLATimer targetDate={selectedComplaint.targetSLA} compact />
              </div>
            </div>

            <FormSelect
              name="status"
              label="Update Status"
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              options={[
                { value: "open", label: "Open" },
                { value: "in-progress", label: "In Progress" },
                { value: "resolved", label: "Resolved" },
              ]}
              required
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Resolution Notes{" "}
                <span className="font-normal text-gray-500">(visible to customer)</span>
              </label>
              <textarea
                name="notes"
                rows="3"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Detail the steps taken towards resolution..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors resize-y"
              />
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${isUpdating
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                  }`}
              >
                {isUpdating ? (
                  <>
                    <FontAwesomeIcon icon={faUpload} className="animate-bounce mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StaffDashboard;
