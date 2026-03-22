import React, { useState } from "react";
import FormInput from "../ui/FormInput";
import StatusBadge from "../ui/StatusBadge";
import EmptyState from "../ui/EmptyState";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUserTie, faCheckCircle, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import grievanceService from "../services/grievanceService";
import { toast } from "react-toastify";

// Timeline Component
const Timeline = ({ events }) => {
    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {events.map((event, eventIdx) => (
                    <li key={event.id}>
                        <div className="relative pb-8">
                            {eventIdx !== events.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${event.isComplete ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <FontAwesomeIcon icon={event.icon} className="text-white h-4 w-4" />
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {event.title}{' '}
                                            {event.isComplete && event.description && (
                                                <span className="font-normal text-gray-500 dark:text-gray-400 block mt-1 text-xs">
                                                    {event.description}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                        {event.date}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const TrackComplaint = () => {
    const [searchId, setSearchId] = useState("");
    const [complaint, setComplaint] = useState(null);
    const [history, setHistory] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) {
            setSearchId(id);
            performSearch(id);
        }
    }, []);

    const performSearch = async (id) => {
        setIsSearching(true);
        setHasSearched(true);
        try {
            const [details, historyData] = await Promise.all([
                grievanceService.getGrievanceById(id),
                grievanceService.getGrievanceHistory(id)
            ]);
            setComplaint(details);
            setHistory(historyData);
        } catch (error) {
            console.error("Tracking error:", error);
            setComplaint(null);
            setHistory([]);
            toast.error(error.response?.data?.message || "Complaint not found or access denied");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchId.trim()) return;
        performSearch(searchId);
    };

    const getTimeline = () => {
        // Steps from requirement: Complaint Filed, Accepted by Staff, In Progress, Resolved
        const requiredSteps = [
            { id: 'FILED', title: 'Complaint Filed', icon: faSearch },
            { id: 'ACCEPTED', title: 'Accepted by Staff', icon: faUserTie },
            { id: 'IN_PROGRESS', title: 'In Progress', icon: faClockRotateLeft },
            { id: 'RESOLVED', title: 'Resolved', icon: faCheckCircle }
        ];

        const currentStatus = complaint.status;
        const currentStepIdx = requiredSteps.findIndex(s => s.id === currentStatus);
        const isTerminal = ["RESOLVED", "REJECTED", "WITHDRAWN"].includes(currentStatus);

        return requiredSteps.map((step, idx) => {
            const historyEntry = history.find(h => h.status === step.id);
            // It's complete if there's a history match, OR if we're at a later/terminal status
            const isComplete = !!historyEntry || (currentStepIdx !== -1 && idx <= currentStepIdx) || isTerminal;
            
            // Try to find a sensible date if missing
            let dateStr = 'Pending';
            if (historyEntry) {
                dateStr = new Date(historyEntry.timestamp).toLocaleString();
            } else if (isComplete && complaint) {
                if (step.id === 'FILED') dateStr = new Date(complaint.createdAt).toLocaleString();
                else if (step.id === 'RESOLVED' && complaint.resolvedAt) dateStr = new Date(complaint.resolvedAt).toLocaleString();
                else if (complaint.updatedAt) dateStr = new Date(complaint.updatedAt).toLocaleString();
            }

            return {
                id: step.id,
                title: step.title,
                description: historyEntry?.note || (historyEntry ? `Status updated to ${step.title}` : (isComplete ? `Status: ${step.title}` : '')),
                date: dateStr,
                isComplete: isComplete,
                icon: step.icon
            };
        });
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-6 pb-20">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Track Your Grievance</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Enter your Grievance tracking ID (numeric) to view live status and resolution progress.
                </p>

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <FormInput
                            name="searchId"
                            placeholder="e.g. 1"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSearching}
                        className={`inline-flex items-center justify-center px-8 py-2 rounded-xl shadow-lg font-bold text-white transition-all ${isSearching ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5"
                            }`}
                    >
                        {isSearching ? "Tracking..." : "Search Grievance"}
                    </button>
                </form>
            </div>

            {/* Results Area */}
            {hasSearched && !isSearching && !complaint && (
                <EmptyState
                    title="No Record Found"
                    description="We couldn't find a grievance with that tracking ID. Please ensure you entered the numeric ID correctly."
                    icon={faSearch}
                />
            )}

            {complaint && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded">
                                    {complaint.referenceNumber}
                                </span>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    ID: #{complaint.id}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Category: {complaint.category}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <StatusBadge status={complaint.status} />
                        </div>
                    </div>

                    {/* Details & Timeline Grid */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Details */}
                        <div className="lg:col-span-1 space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject</h4>
                                <p className="text-gray-900 dark:text-white font-semibold leading-snug">{complaint.title}</p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detailed Description</h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap leading-relaxed">
                                    {complaint.description}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Service Team</h4>
                                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-100/50 dark:border-blue-800/50">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <FontAwesomeIcon icon={faUserTie} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {complaint.assignedStaffName || "Awaiting Assignment"}
                                            </p>
                                            <p className="text-[10px] text-gray-500 font-medium">Customer Service Staff</p>
                                        </div>
                                    </div>
                                    {complaint.assignedManagerName && (
                                        <div className="mt-4 pt-4 border-t border-blue-100/50 dark:border-blue-800/50">
                                            <p className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 mb-2">Supervising Manager</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{complaint.assignedManagerName}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Timeline */}
                        <div className="lg:col-span-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center">
                                <FontAwesomeIcon icon={faClockRotateLeft} className="mr-2" />
                                Action History
                            </h4>
                            <div className="bg-gray-50/30 dark:bg-gray-900/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                                <Timeline events={getTimeline()} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackComplaint;
