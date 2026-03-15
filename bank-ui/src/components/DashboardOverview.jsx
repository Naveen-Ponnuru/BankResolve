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

    const handleAction = async (id, action, payload = null) => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            if (action === 'FORWARD') {
                await grievanceService.forwardGrievance(id);
                toast.success(`Grievance #${id} forwarded to manager.`);
            } else if (action === 'RESOLVE') {
                await grievanceService.resolveGrievance(id);
                toast.success(`Grievance #${id} marked as resolved.`);
            } else if (action === 'UPDATE_STATUS') {
                await grievanceService.updateStatus(id, payload);
                toast.success(`Grievance #${id} status updated to ${payload}.`);
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
            case 'FILED': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'PENDING': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'ACCEPTED': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'ESCALATED': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'RESOLVED': return 'bg-green-50 text-green-700 border-green-200';
            case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getDotColor = (status) => {
        switch (status) {
            case 'RESOLVED': return 'bg-green-500';
            case 'PENDING':
            case 'ESCALATED': return 'bg-orange-500';
            case 'IN_PROGRESS':
            case 'FILED': return 'bg-blue-500';
            case 'REJECTED': return 'bg-red-500';
            case 'ACCEPTED': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    const formatStatus = (status) => {
        if (!status) return '';
        return status.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
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
                                <option value="ACCEPTED">Accepted</option>
                                <option value="IN_PROGRESS">In Progress</option>
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
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(g.status)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getDotColor(g.status)}`}></span>
                                                {formatStatus(g.status)}
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
                                            <div className="flex items-center justify-end space-x-2">
                                                {/* Status Update Dropdown for STAFF/MANAGER */}
                                                {((user?.role === 'STAFF' || user?.role === 'MANAGER' || user?.role === 'ADMIN')) && g.status !== 'RESOLVED' && g.status !== 'REJECTED' ? (
                                                    <>
                                                        <select
                                                            className="text-xs bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg py-1.5 px-3 focus:ring-0 appearance-none cursor-pointer pr-8 bg-no-repeat bg-[right_0.5rem_center] dark:text-white"
                                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                                                            value={g.status}
                                                            onChange={(e) => handleAction(g.id, 'UPDATE_STATUS', e.target.value)}
                                                            disabled={isProcessing}
                                                        >
                                                            <option value="PENDING">Pending</option>
                                                            <option value="ACCEPTED">Accepted</option>
                                                            <option value="IN_PROGRESS">In Progress</option>
                                                            <option value="RESOLVED">Resolved</option>
                                                            <option value="REJECTED">Rejected</option>
                                                            {g.status === 'ESCALATED' && <option value="ESCALATED">Escalated</option>}
                                                        </select>
                                                        
                                                        {/* Reject Button (X) */}
                                                        <button
                                                            onClick={() => handleAction(g.id, 'UPDATE_STATUS', 'REJECTED')}
                                                            title="Reject Grievance"
                                                            className="p-1.5 bg-red-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                                                            disabled={isProcessing}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 italic text-sm">View Only</span>
                                                )}

                                                {/* Quick Forward for STAFF */}
                                                {user?.role === 'STAFF' && g.priority === 'HIGH' && g.status !== 'RESOLVED' && g.status !== 'ESCALATED' && (
                                                    <button
                                                        onClick={() => handleAction(g.id, 'FORWARD')}
                                                        className="px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg font-bold text-xs hover:bg-orange-100 transition-colors"
                                                        disabled={isProcessing}
                                                    >
                                                        Forward
                                                    </button>
                                                )}
                                            </div>
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
