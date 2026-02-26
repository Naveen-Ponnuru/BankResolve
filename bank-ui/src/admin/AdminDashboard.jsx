import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserPlus,
  faUserShield,
  faServer,
  faGear,
  faShieldHalved,
  faChartBar,
  faBuilding,
  faGlobe,
  faToggleOn,
  faToggleOff,
} from "@fortawesome/free-solid-svg-icons";
import KPICard from "../ui/KPICard";
import ComplaintsTable from "../ui/ComplaintsTable";
import QuickActionCard from "../ui/QuickActionCard";
import Modal from "../ui/Modal";
import FormInput from "../ui/FormInput";
import FormSelect from "../ui/FormSelect";
import SkeletonLoader from "../ui/SkeletonLoader";
import { selectBank, selectAvailableBanks } from "../store/bankSlice";
import { selectUser } from "../store/auth-slice";
import { toast } from "react-toastify";

// ─── Role color mapping ───────────────────────────────────────────────────────
const roleColors = {
  ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
  MANAGER: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
  STAFF: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800",
  CUSTOMER: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600",
};

const mockUsers = [
  { id: "USR-001", name: "System Admin", email: "admin@bank.com", role: "ADMIN", status: "ACTIVE", date: "2026-01-15" },
  { id: "USR-002", name: "Eleanor Manager", email: "eleanor@bank.com", role: "MANAGER", status: "ACTIVE", date: "2026-01-20" },
  { id: "USR-003", name: "Robert Staff", email: "robert@bank.com", role: "STAFF", status: "ACTIVE", date: "2026-02-01" },
  { id: "USR-004", name: "Sarah Jenkins", email: "sarah@bank.com", role: "STAFF", status: "ACTIVE", date: "2026-02-05" },
];

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("users"); // "users" | "banks" | "config"

  const selectedBank = useSelector(selectBank);
  const availableBanks = useSelector(selectAvailableBanks);
  const user = useSelector(selectUser);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers(mockUsers);
      setMetrics({
        totalUsers: mockUsers.length,
        activeStaff: mockUsers.filter((u) => u.role === "STAFF").length,
        systemHealth: "99.9%",
        uptime: "30 days",
        totalBanks: availableBanks.length,
        activeBanks: availableBanks.length,
      });
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleAddUser = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      const newUser = {
        id: `USR-${String(users.length + 1).padStart(3, "0")}`,
        name: e.target.name.value,
        email: e.target.email.value,
        role: e.target.role.value,
        status: "ACTIVE",
        date: new Date().toISOString().split("T")[0],
      };
      setUsers([...users, newUser]);
      setMetrics((prev) => ({
        ...prev,
        totalUsers: prev.totalUsers + 1,
        activeStaff: newUser.role === "STAFF" ? prev.activeStaff + 1 : prev.activeStaff,
      }));
      setIsProcessing(false);
      setIsModalOpen(false);
      toast.success("New user provisioned successfully.");
      e.target.reset();
    }, 1000);
  };

  const userColumns = [
    { key: "id", label: "User ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${roleColors[value] || ""}`}>
          {value}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span className={`flex items-center text-sm font-medium ${value === "ACTIVE" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}>
          <span className={`h-2 w-2 rounded-full mr-2 ${value === "ACTIVE" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          {value}
        </span>
      ),
    },
    { key: "date", label: "Joined" },
  ];

  if (isLoading) return <SkeletonLoader count={4} />;

  return (
    <div className="space-y-8 pt-2 pb-12">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Control Panel</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center space-x-2">
            <FontAwesomeIcon icon={faBuilding} className="text-blue-500" />
            <span>{selectedBank?.name || "All Banks"} · System Administrator</span>
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setActiveTab("config")}
            className="inline-flex items-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faServer} className="mr-2" />
            System Config
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* ─── KPI Cards (4) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          icon={faUsers}
          bgColor="bg-blue-50" iconBgColor="bg-blue-100" iconColor="text-blue-600"
          darkBgColor="dark:bg-blue-900/30" darkIconBgColor="dark:bg-blue-800" darkIconColor="dark:text-blue-400"
          subtitle="Registered accounts"
        />
        <KPICard
          title="Active Staff"
          value={metrics?.activeStaff || 0}
          icon={faUserShield}
          bgColor="bg-teal-50" iconBgColor="bg-teal-100" iconColor="text-teal-600"
          darkBgColor="dark:bg-teal-900/30" darkIconBgColor="dark:bg-teal-800" darkIconColor="dark:text-teal-400"
          subtitle="Staff members"
        />
        <KPICard
          title="System Health"
          value={metrics?.systemHealth}
          icon={faShieldHalved}
          bgColor="bg-green-50" iconBgColor="bg-green-100" iconColor="text-green-600"
          darkBgColor="dark:bg-green-900/30" darkIconBgColor="dark:bg-green-800" darkIconColor="dark:text-green-400"
          subtitle={`Uptime: ${metrics?.uptime}`}
        />
        <KPICard
          title="Active Banks"
          value={metrics?.activeBanks || 0}
          icon={faGlobe}
          bgColor="bg-purple-50" iconBgColor="bg-purple-100" iconColor="text-purple-600"
          darkBgColor="dark:bg-purple-900/30" darkIconBgColor="dark:bg-purple-800" darkIconColor="dark:text-purple-400"
          subtitle="Multi-bank ready"
        />
      </div>

      {/* ─── Quick Actions ─── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickActionCard
            title="Manage Users"
            description="Add, edit, or deactivate user accounts"
            icon={faUsers}
            onClick={() => { setActiveTab("users"); setIsModalOpen(true); }}
            bgColor="bg-blue-50" darkBgColor="dark:bg-blue-900/30" iconColor="text-blue-600" darkIconColor="dark:text-blue-400"
          />
          <QuickActionCard
            title="Bank Configuration"
            description="Configure bank settings and parameters"
            icon={faGear}
            onClick={() => setActiveTab("config")}
            bgColor="bg-gray-50" darkBgColor="dark:bg-gray-700" iconColor="text-gray-600" darkIconColor="dark:text-gray-400"
          />
          <QuickActionCard
            title="Security Audit"
            description="Review access logs and security events"
            icon={faShieldHalved}
            onClick={() => toast.info("Security audit coming soon!")}
            bgColor="bg-red-50" darkBgColor="dark:bg-red-900/30" iconColor="text-red-600" darkIconColor="dark:text-red-400"
          />
        </div>
      </div>

      {/* ─── Tabbed Sections ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Tab Bar */}
        <div className="border-b border-gray-200 dark:border-gray-700 flex">
          {[
            { key: "users", label: "User Management", icon: faUsers },
            { key: "banks", label: "Multi-Bank Overview", icon: faGlobe },
            { key: "config", label: "Bank Config", icon: faGear },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.key
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              aria-selected={activeTab === tab.key}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-sm" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ─── User Management Tab ─── */}
          {activeTab === "users" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All registered users and staff members ({users.length} total)
                </p>
              </div>
              <div className="overflow-x-auto">
                <ComplaintsTable
                  data={users}
                  columns={userColumns}
                  loading={false}
                  onViewClick={(u) => toast.info(`Viewing user: ${u.name}`)}
                  emptyMessage="No users found. Add staff using the Add User button."
                  pageSize={5}
                />
              </div>
            </div>
          )}

          {/* ─── Multi-Bank Overview Tab ─── */}
          {activeTab === "banks" && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                All banks configured in the system
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      {["Bank Name", "Code", "Branches", "Status", "Selected"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {availableBanks.map((bank) => (
                      <tr key={bank.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                          <FontAwesomeIcon icon={faBuilding} className="text-blue-500 text-sm" />
                          <span>{bank.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                            {bank.code}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {bank.branchCount?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center text-green-600 dark:text-green-400 text-xs font-semibold">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {selectedBank?.id === bank.id ? (
                            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                              <span>●</span>
                              <span>Selected</span>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Bank Config Tab ─── */}
          {activeTab === "config" && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure system parameters for{" "}
                <strong className="text-gray-900 dark:text-white">{selectedBank?.name}</strong>
              </p>

              {/* Config Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SLA Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    SLA Configuration
                  </h4>
                  {[
                    { label: "Credit Card Disputes SLA", value: "2 days", type: "text" },
                    { label: "Fraud Cases SLA", value: "1 day", type: "text" },
                    { label: "Account Queries SLA", value: "3 days", type: "text" },
                    { label: "Loan Disputes SLA", value: "5 days", type: "text" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                      <input
                        type="text"
                        defaultValue={value}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  ))}
                </div>

                {/* Feature Toggles */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Feature Toggles
                  </h4>
                  {[
                    { label: "Email Notifications", enabled: true },
                    { label: "SMS Alerts", enabled: true },
                    { label: "Auto-Escalation (after 48h)", enabled: true },
                    { label: "Customer Feedback Collection", enabled: false },
                    { label: "Multi-language Support", enabled: false },
                  ].map(({ label, enabled }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                      <button
                        onClick={() => toast.info(`Toggle ${label} coming soon!`)}
                        className={`text-xl ${enabled ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-600"}`}
                        aria-label={`Toggle ${label}: currently ${enabled ? "on" : "off"}`}
                      >
                        <FontAwesomeIcon icon={enabled ? faToggleOn : faToggleOff} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => toast.success("Configuration saved! (Mock)")}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Add User Modal ─── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Provision New User">
        <form onSubmit={handleAddUser} className="space-y-5">
          <FormInput name="name" label="Full Name" placeholder="e.g. John Doe" required />
          <FormInput name="email" type="email" label="Email Address" placeholder="e.g. john@bank.com" required />
          <FormInput name="password" type="password" label="Temporary Password" placeholder="At least 8 characters" required />
          <FormSelect
            name="role"
            label="Assign Role"
            options={[
              { value: "STAFF", label: "Bank Staff" },
              { value: "MANAGER", label: "Branch Manager" },
              { value: "ADMIN", label: "System Administrator" },
            ]}
            required
          />
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
              {isProcessing ? "Provisioning..." : "Provision User"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
