import React, { useState } from "react";
import FormInput from "../ui/FormInput";
import StatusBadge from "../ui/StatusBadge";
import SLATimer from "../ui/SLATimer";
import EmptyState from "../ui/EmptyState";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUserTie, faCheckCircle, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";

// Mock Timeline Component
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
                                        {event.isComplete ? (
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-white h-5 w-5" />
                                        ) : (
                                            <span className="h-2.5 w-2.5 bg-transparent rounded-full" />
                                        )}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {event.title}{' '}
                                            {event.description && <span className="font-normal text-gray-500 dark:text-gray-400 block mt-1">{event.description}</span>}
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
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchId.trim()) return;

        setIsSearching(true);
        setHasSearched(true);

        // Simulate API call
        setTimeout(() => {
            // Mock result
            if (searchId.includes("123")) {
                setComplaint({
                    id: searchId,
                    category: "Credit Card",
                    subject: "Unauthorized transaction of $200",
                    status: "IN_PROGRESS",
                    description: "I noticed a $200 transaction on my statement that I did not authorize.",
                    filingDate: "2026-02-23T10:30:00Z",
                    targetSLA: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
                    assignedStaff: {
                        name: "Sarah Jenkins",
                        department: "Fraud Operations"
                    },
                    timeline: [
                        { id: 1, title: "Grievance Filed", date: "Feb 23, 2026 10:30 AM", isComplete: true },
                        { id: 2, title: "Assigned to Staff", description: "Assigned to Sarah Jenkins (Fraud Operations)", date: "Feb 23, 2026 14:15 PM", isComplete: true },
                        { id: 3, title: "Investigation Started", description: "We are currently reviewing the merchant details.", date: "Feb 24, 2026 09:00 AM", isComplete: true },
                        { id: 4, title: "Awaiting Resolution", date: "Pending", isComplete: false },
                    ]
                });
            } else {
                setComplaint(null);
            }
            setIsSearching(false);
        }, 800);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Track Your Grievance</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Enter your Grievance ID to view its current status, timeline, and staff assignment.
                </p>

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <FormInput
                            name="searchId"
                            placeholder="e.g. GRV-2026-123"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSearching}
                        className={`inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isSearching ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                            } transition-colors`}
                    >
                        {isSearching ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faSearch} className="mr-2" />
                                Track
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Results Area */}
            {hasSearched && !isSearching && !complaint && (
                <EmptyState
                    title="Complaint Not Found"
                    description="We couldn't find a grievance matching that ID. Please check the ID and try again."
                    icon={faSearch}
                />
            )}

            {complaint && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                #{complaint.id}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Filed on {new Date(complaint.filingDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <SLATimer targetDate={complaint.targetSLA} status={complaint.status} />
                            <StatusBadge status={complaint.status} />
                        </div>
                    </div>

                    {/* Details & Timeline Grid */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Details */}
                        <div className="lg:col-span-1 space-y-6">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Subject</h4>
                                <p className="text-gray-900 dark:text-white font-medium">{complaint.subject}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Category</h4>
                                <p className="text-gray-900 dark:text-white">{complaint.category}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Assigned Staff</h4>
                                {complaint.assignedStaff ? (
                                    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                                            <FontAwesomeIcon icon={faUserTie} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{complaint.assignedStaff.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{complaint.assignedStaff.department}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 italic">Pending Assignment</p>
                                )}
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                                    {complaint.description}
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Timeline */}
                        <div className="lg:col-span-2">
                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6 flex items-center">
                                <FontAwesomeIcon icon={faClockRotateLeft} className="mr-2" />
                                Status Timeline
                            </h4>
                            <div className="bg-gray-50/50 dark:bg-transparent rounded-lg p-2">
                                <Timeline events={complaint.timeline} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackComplaint;
