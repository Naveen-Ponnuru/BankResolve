import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faExclamationTriangle,
    faList,
    faFilter
} from '@fortawesome/free-solid-svg-icons';

import { toast } from 'react-toastify';
import { selectUser } from '../store/auth-slice';
import grievanceService from '../services/grievanceService';
import { getThemeClasses } from '../utils/themeUtils';



const DashboardOverview = () => {
    const user = useSelector(selectUser);
    const [metrics, setMetrics] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        highRisk: 0
    });
    const [isMetricsLoading, setIsMetricsLoading] = useState(true);
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [filters, setFilters] = useState({ status: '', priority: '' });
    
    // Pagination state
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);



    const fetchInitialData = React.useCallback(async () => {
        setIsMetricsLoading(true);
        try {
            const summary = await grievanceService.getDashboardSummary();
            setMetrics(summary);
        } catch (error) {
            console.error("Error fetching dashboard metrics:", error);
        } finally {
            setIsMetricsLoading(false);
        }
    }, []);

    const fetchGrievances = React.useCallback(async () => {
        setLoading(true);
        try {
            const data = await grievanceService.getGrievancesPaged(
                page, 
                pageSize, 
                filters.status || null, 
                filters.priority || null
            );
            setGrievances(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (error) {
            console.error("Error fetching grievances:", error);
            toast.error("Failed to load grievances table");
        } finally {
            setLoading(false);
        }
    }, [filters, page, pageSize]);

    const notifications = useSelector((state) => state.notifications.notifications);
    const lastNotif = notifications.length > 0 ? notifications[0] : null;

    useEffect(() => {
        if (lastNotif && !lastNotif.read) {
            // Trigger a refresh of metrics if the notification is a grievance-related update
            const lowerMsg = lastNotif.message.toLowerCase();
            if (lowerMsg.includes('grievance') || lowerMsg.includes('resolved') || lowerMsg.includes('forwarded')) {
                console.log("DashboardOverview: Auto-refreshing due to incoming notification");
                fetchInitialData();
                fetchGrievances();
            }
        }
    }, [lastNotif, fetchInitialData, fetchGrievances]);

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
        <div className="space-y-6 text-gray-900 dark:text-gray-100">
            {/* ─── Stats Grid (Dynamic Metrics) ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Grievances', value: metrics.total, icon: faList, color: 'blue' },
                    { label: 'Pending', value: metrics.pending, icon: faExclamationTriangle, color: 'orange' },
                    { label: 'Resolved', value: metrics.resolved, icon: faCheckCircle, color: 'green' },
                    { label: 'High Priority', value: metrics.highRisk, icon: faExclamationTriangle, color: 'red' },
                ].map((stat, i) => {
                    const statTheme = getThemeClasses(stat.color);
                    return (
                        <div key={i} className={`${statTheme.glass} p-5 rounded-2xl shadow-sm flex items-center space-x-4 transition-all hover:shadow-md hover:scale-[1.02]`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statTheme.highlight}`}>
                                <FontAwesomeIcon icon={stat.icon} className="text-xl" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold opacity-60 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-bold">
                                    {isMetricsLoading ? (
                                        <span className="inline-block w-12 h-6 bg-gray-100 dark:bg-gray-700 animate-pulse rounded"></span>
                                    ) : (
                                        stat.value
                                    )}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

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

            {/* 4. Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold dark:text-white">Grievance Activity</h3>
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
                                        <td className="px-6 py-4 font-medium">
                                            <Link 
                                                to={`/dashboard/grievance/${g.id}`}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
                                            >
                                                #{g.referenceNumber}
                                            </Link>
                                        </td>
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
                                                            className={`text-xs bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg py-1.5 px-3 focus:ring-0 appearance-none cursor-pointer pr-8 bg-no-repeat bg-[right_0.5rem_center] dark:text-white ${
                                                                user?.role === 'STAFF' && (g.status === 'ESCALATED' || g.priority === 'HIGH') ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                                                            value={g.status}
                                                            onChange={(e) => handleAction(g.id, 'UPDATE_STATUS', e.target.value)}
                                                            disabled={isProcessing || (user?.role === 'STAFF' && (g.status === 'ESCALATED' || g.priority === 'HIGH'))}
                                                        >
                                                            <option value="PENDING">Pending</option>
                                                            <option value="ACCEPTED">Accepted</option>
                                                            <option value="IN_PROGRESS">In Progress</option>
                                                            <option value="RESOLVED">Resolved</option>
                                                            <option value="REJECTED">Rejected</option>
                                                            {(g.status === 'ESCALATED' || user?.role === 'MANAGER' || user?.role === 'ADMIN') && <option value="ESCALATED">Escalated</option>}
                                                        </select>
                                                        
                                                        {/* Reject Button (X) */}
                                                        <button
                                                            onClick={() => handleAction(g.id, 'UPDATE_STATUS', 'REJECTED')}
                                                            title="Reject Grievance"
                                                            className={`p-1.5 bg-red-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-100 transition-colors ${
                                                                user?.role === 'STAFF' && (g.status === 'ESCALATED' || g.priority === 'HIGH') ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                            disabled={isProcessing || (user?.role === 'STAFF' && (g.status === 'ESCALATED' || g.priority === 'HIGH'))}
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
                                                {user?.role === 'STAFF' && g.status !== 'RESOLVED' && g.status !== 'ESCALATED' && (
                                                    <button
                                                        onClick={() => handleAction(g.id, 'FORWARD')}
                                                        className="px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg font-bold text-xs hover:bg-orange-100 transition-colors whitespace-nowrap"
                                                        disabled={isProcessing}
                                                    >
                                                        Forward to Manager
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

                {/* Pagination Controls */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 bg-gray-50/30 dark:bg-gray-900/10">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Showing <span className="text-gray-900 dark:text-white font-bold">{grievances.length}</span> of <span className="text-gray-900 dark:text-white font-bold">{totalElements}</span> records
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0 || loading}
                            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 ${
                                page === 0 
                                ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50' 
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-800 shadow-sm active:scale-95'
                            }`}
                        >
                            Previous
                        </button>
                        <div className="px-4 py-2 text-sm font-bold bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-inner">
                            {page + 1} <span className="text-gray-400 font-medium">/</span> {totalPages || 1}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1 || loading}
                            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 ${
                                page >= totalPages - 1 
                                ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50' 
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-800 shadow-sm active:scale-95'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
