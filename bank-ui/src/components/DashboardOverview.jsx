import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowRight,
    faCheckCircle,
    faExclamationTriangle,
    faList,
    faFilter,
    faDownload
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import grievanceService from '../services/grievanceService';



const DashboardOverview = () => {
    const { user } = useSelector((state) => state.auth);
    const [metrics, setMetrics] = useState({ total: 0, pending: 0, resolved: 0, highRisk: 0 });
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', priority: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchInitialData = React.useCallback(async () => {
        try {
            const metricsRes = await grievanceService.getDashboardSummary();
            setMetrics(metricsRes);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Failed to load dashboard metrics");
        }
    }, []);

    const fetchGrievances = React.useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.priority) params.priority = filters.priority;

            const data = await grievanceService.getGrievances(params);
            setGrievances(data);
        } catch (error) {
            console.error("Error fetching grievances:", error);
            toast.error("Failed to load grievances table");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        fetchGrievances();
    }, [fetchGrievances]);

    const handleAction = async (id, action) => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            if (action === 'FORWARD') {
                await grievanceService.forwardGrievance(id);
                toast.success(`Grievance #${id} forwarded to manager.`);
            } else if (action === 'RESOLVE') {
                await grievanceService.resolveGrievance(id);
                toast.success(`Grievance #${id} marked as resolved.`);
            }
            fetchInitialData();
            fetchGrievances();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to perform ${action}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ['Ref No', 'Customer', 'Amount', 'Priority', 'Status', 'Created'];
        const rows = grievances.map((g) => [
            g.referenceNumber,
            g.customerName || '',
            g.transactionAmount || '',
            g.priority,
            g.status,
            g.createdAt ? new Date(g.createdAt).toLocaleDateString() : ''
        ]);
        const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grievances_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getPriorityColor = (priority) => {
        return priority === 'HIGH' ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'RESOLVED': return 'text-green-600 bg-green-100';
            case 'ESCALATED': return 'text-orange-600 bg-orange-100';
            case 'PENDING': return 'text-yellow-600 bg-yellow-100';
            case 'REJECTED': return 'text-gray-600 bg-gray-100';
            default: return 'text-blue-600 bg-blue-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* 1. Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: metrics.total, icon: faList, color: 'blue' },
                    { label: 'Pending', value: metrics.pending, icon: faExclamationTriangle, color: 'yellow' },
                    { label: 'High Risk', value: metrics.highRisk, icon: faArrowRight, color: 'red' },
                    { label: 'Resolved', value: metrics.resolved, icon: faCheckCircle, color: 'green' },
                ].map((card) => (
                    <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center space-x-4 border border-gray-100 dark:border-gray-700">
                        <div className={`p-3 rounded-lg bg-${card.color}-100 dark:bg-${card.color}-900/30 text-${card.color}-600`}>
                            <FontAwesomeIcon icon={card.icon} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{card.label}</p>
                            <p className="text-2xl font-bold dark:text-white">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 3. Filters Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-2 mb-4">
                        <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                        <h3 className="text-lg font-bold dark:text-white">Filters</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500"
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            >
                                <option value="">All Statuses</option>
                                <option value="FILED">Filed</option>
                                <option value="PENDING">Pending</option>
                                <option value="ESCALATED">Escalated</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                            <select
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500"
                                value={filters.priority}
                                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                            >
                                <option value="">All Priorities</option>
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                        <button
                            onClick={() => setFilters({ status: '', priority: '' })}
                            className="w-full py-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 font-medium"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold dark:text-white">Grievance Activity</h3>
                    <button
                        id="export-csv-btn"
                        onClick={handleExportCSV}
                        disabled={grievances.length === 0}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Export grievances to CSV"
                    >
                        <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-3">Ref No</th>
                                {user?.role !== 'CUSTOMER' && <th className="px-6 py-3">Customer</th>}
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Priority</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Created</th>
                                {user?.role === 'STAFF' && <th className="px-6 py-3">Customer Feedback</th>}
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={user?.role === 'CUSTOMER' ? 6 : (user?.role === 'STAFF' ? 8 : 7)} className="px-6 py-10 text-center text-gray-400">
                                        Loading records...
                                    </td>
                                </tr>
                            ) : grievances.length === 0 ? (
                                <tr>
                                    <td colSpan={user?.role === 'CUSTOMER' ? 6 : (user?.role === 'STAFF' ? 8 : 7)} className="px-6 py-10 text-center text-gray-400">
                                        No grievances found matching the filters
                                    </td>
                                </tr>
                            ) : (
                                grievances.map((g) => (
                                    <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-blue-600">#{g.referenceNumber}</td>
                                        {user?.role !== 'CUSTOMER' && (
                                            <td className="px-6 py-4 dark:text-gray-300">{g.customerName}</td>
                                        )}
                                        <td className="px-6 py-4 dark:text-gray-300">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(g.transactionAmount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(g.priority)}`}>
                                                {g.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(g.status)}`}>
                                                {g.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(g.createdAt).toLocaleDateString()}
                                        </td>
                                        {user?.role === 'STAFF' && (
                                            <td className="px-6 py-4">
                                                {g.feedbackRating ? (
                                                    <div>
                                                        <div className="text-yellow-400 text-xs">{'⭐'.repeat(g.feedbackRating)}</div>
                                                        {g.feedbackComment && <div className="text-xs text-gray-500 italic mt-1">&quot;{g.feedbackComment}&quot;</div>}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-right">
                                            {user?.role === 'STAFF' && g.priority === 'HIGH' && g.status !== 'RESOLVED' && g.status !== 'ESCALATED' && (
                                                <button
                                                    onClick={() => handleAction(g.id, 'FORWARD')}
                                                    className="text-orange-600 hover:text-orange-700 font-bold text-sm"
                                                    disabled={isProcessing}
                                                >
                                                    Forward
                                                </button>
                                            )}

                                            {((user?.role === 'MANAGER' && (g.status === 'ESCALATED' || g.priority === 'HIGH')) ||
                                                (user?.role === 'STAFF' && g.priority === 'NORMAL') ||
                                                (user?.role === 'ADMIN')) && g.status !== 'RESOLVED' && (
                                                    <button
                                                        onClick={() => handleAction(g.id, 'RESOLVE')}
                                                        className="text-green-600 hover:text-green-700 font-bold text-sm"
                                                        disabled={isProcessing}
                                                    >
                                                        Resolve
                                                    </button>
                                                )}

                                            {((user?.role === 'CUSTOMER') ||
                                                (user?.role === 'STAFF' && g.priority === 'HIGH' && g.status === 'ESCALATED' && g.status !== 'RESOLVED') ||
                                                (g.status === 'RESOLVED')) && (
                                                    <span className="text-gray-400 italic text-sm">View Only</span>
                                                )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
