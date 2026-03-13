import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar as faStarSolid
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { faSearch, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import grievanceService from "../services/grievanceService";
import StatusBadgeWithLabel from "../ui/StatusBadgeWithLabel";
import SkeletonLoader from "../ui/SkeletonLoader";
import EmptyState from "../ui/EmptyState";
import { toast } from "react-toastify";

const TrackMyGrievances = () => {
    const [grievances, setGrievances] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState(null);

    const fetchGrievances = async () => {
        try {
            setIsLoading(true);
            const data = await grievanceService.getGrievances();
            // Backend filtered for customer, but we ensure sorting
            setGrievances(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error("Error fetching grievances:", error);
            toast.error("Failed to load your grievances");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGrievances();
    }, []);

    const handleFeedback = async (id, rating) => {
        setSubmittingId(id);
        try {
            await grievanceService.submitFeedback(id, {
                rating,
                comment: `Submitted via star rating on ${new Date().toLocaleDateString()}`
            });
            toast.success("Thank you for your feedback!");
            // Refresh local state
            setGrievances(prev => prev.map(g =>
                g.id === id ? { ...g, feedbackRating: rating } : g
            ));
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast.error(error.response?.data?.message || "Failed to submit feedback");
        } finally {
            setSubmittingId(null);
        }
    };

    const StarRating = ({ rating, grievanceId, disabled }) => {
        const [hover, setHover] = useState(null);

        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleFeedback(grievanceId, star)}
                        onMouseEnter={() => !disabled && setHover(star)}
                        onMouseLeave={() => !disabled && setHover(null)}
                        className={`transition-colors duration-150 ${disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                    >
                        <FontAwesomeIcon
                            icon={star <= (hover || rating) ? faStarSolid : faStarRegular}
                            className={`w-4 h-4 ${star <= (hover || rating)
                                ? "text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                                }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    if (isLoading) return <SkeletonLoader count={5} />;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Your Grievances</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        View real-time status and provide feedback once resolved.
                    </p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <span>Reference numbers are unique identifiers.</span>
                </div>
            </div>

            {grievances.length === 0 ? (
                <EmptyState
                    title="No Grievances Found"
                    description="You haven't filed any grievances yet. Any complaints you file will appear here."
                    icon={faSearch}
                />
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Reference No</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Priority</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date Filed</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Feedback</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {grievances.map((g) => (
                                    <tr key={g.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                {g.referenceNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadgeWithLabel status={g.status} size="sm" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${g.priority === 'HIGH'
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                                }`}>
                                                {g.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-900 dark:text-white font-medium">
                                                    {new Date(g.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                    {new Date(g.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 min-w-[140px]">
                                            {g.status === "RESOLVED" ? (
                                                <StarRating
                                                    rating={g.feedbackRating || 0}
                                                    grievanceId={g.id}
                                                    disabled={!!g.feedbackRating || submittingId === g.id}
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Available after resolution</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackMyGrievances;
