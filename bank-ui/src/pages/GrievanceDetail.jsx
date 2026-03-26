import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faUserTie,
    faBuilding,
    faCalendarAlt,
    faAlignLeft,
    faStar,
    faSpinner,
    faCommentDots
} from "@fortawesome/free-solid-svg-icons";
import grievanceService from "../services/grievanceService";
import { toast } from "react-toastify";

const GrievanceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();


    const [grievance, setGrievance] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            navigate(-1);
            return;
        }
        const load = async () => {
            try {
                setLoading(true);
                const [gData, hData] = await Promise.all([
                    grievanceService.getGrievanceById(id),
                    grievanceService.getGrievanceHistory(id),
                ]);
                setGrievance(gData);
                setHistory(Array.isArray(hData) ? hData : []);
            } catch (err) {
                console.error("Grievance detail error:", err);
                toast.error("Could not load grievance details.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-500" />
            </div>
        );
    }

    if (!grievance) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'FILED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'PENDING': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'ACCEPTED': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'IN_PROGRESS': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'ESCALATED': return 'bg-red-100 text-red-800 border-red-200';
            case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
            {/* Header / Back Navigation */}
            <div className="flex items-center space-x-4 mb-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-gray-500 dark:text-gray-400 group"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        Grievance Details
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(grievance.status)} uppercase tracking-wider`}>
                            {grievance.status.replace(/_/g, " ")}
                        </span>
                    </h1>
                    <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-1">
                        Ref: <span className="text-blue-600 dark:text-blue-400 font-bold">{grievance.referenceNumber}</span> | ID: {grievance.grievanceNumber}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-6">
                    {/* Primary Info Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{grievance.title}</h2>
                            <span className={`inline-block mt-3 px-2 py-1 text-xs font-bold rounded ${
                                grievance.priority === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                            }`}>
                                {grievance.priority} PRIORITY
                            </span>
                        </div>
                        <div className="p-6 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-start space-x-3 mb-4">
                                <FontAwesomeIcon icon={faAlignLeft} className="text-gray-400 mt-1" />
                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Description</h3>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                                        {grievance.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Section (If Resolved and Rated) */}
                    {grievance.feedbackRating && (
                        <div className="bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800 rounded-2xl border border-yellow-100 dark:border-yellow-900/50 shadow-sm p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                                <FontAwesomeIcon icon={faStar} className="text-6xl text-yellow-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
                                <FontAwesomeIcon icon={faCommentDots} className="text-yellow-500" />
                                <span>Customer Feedback</span>
                            </h3>
                            <div className="flex items-center space-x-1 mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FontAwesomeIcon 
                                        key={star} 
                                        icon={faStar} 
                                        className={`text-lg ${star <= grievance.feedbackRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                                    />
                                ))}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 italic text-sm border-l-4 border-yellow-300 pl-4 py-1">
                                "{grievance.feedbackComment || 'No comment provided'}"
                            </p>
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {(() => {
                                        const feedbackDate = grievance.feedbackAt || grievance.resolvedAt;
                                        if (!feedbackDate) return <span className="font-medium text-blue-500">Recently Submitted</span>;
                                        
                                        try {
                                            const date = new Date(feedbackDate);
                                            if (isNaN(date.getTime())) return <span className="font-medium text-blue-500">Recently Submitted</span>;
                                            return `Submitted on: ${date.toLocaleString()}`;
                                        } catch (e) {
                                            console.warn(e);
                                            return <span className="font-medium text-blue-500">Recently Submitted</span>;
                                        }
                                    })()}
                                </div>
                                {grievance.feedbackAt && grievance.resolvedAt && (
                                    <div className="text-[10px] opacity-40 uppercase tracking-tighter">
                                        Verified Response
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Transaction Info (If present) */}
                    {grievance.transactionAmount > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Disputed Amount</p>
                                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(grievance.transactionAmount)}
                                </p>
                            </div>
                            {grievance.transactionDate && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Transaction Date</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                        {new Date(grievance.transactionDate).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Info & History */}
                <div className="space-y-6">
                    {/* Metadata Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 pb-3 border-b border-gray-100 dark:border-gray-700">Metadata</h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <FontAwesomeIcon icon={faUserTie} className="text-gray-400 mt-1 w-4" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{grievance.customerName}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <FontAwesomeIcon icon={faBuilding} className="text-gray-400 mt-1 w-4" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{grievance.category.replace(/_/g, " ")}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 mt-1 w-4" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-200">
                                        {new Date(grievance.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History Timeline */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 pb-3 border-b border-gray-100 dark:border-gray-700">Audit History</h3>
                        <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6">
                            {history.slice().sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((log, idx) => (
                                <div key={idx} className="relative pl-6">
                                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white dark:ring-gray-800"></div>
                                    <div className="mb-1">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                            {log.status.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                    {log.note && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                                            "{log.note}"
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400">
                                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                                        {log.updatedBy && <span className="font-mono bg-gray-50 dark:bg-gray-900 px-1 rounded truncate max-w-[100px]">{log.updatedBy}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrievanceDetail;
