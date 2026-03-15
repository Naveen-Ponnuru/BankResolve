import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faCheckCircle,
    faHourglass,
    faClock,
    faCircleXmark,
    faTriangleExclamation,
    faFileAlt,
    faMagnifyingGlass,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import grievanceService from "../services/grievanceService";
import { toast } from "react-toastify";

/* ─── Status step config ─────────────────────────────────────────────── */
const STATUS_STEPS = [
    { key: "FILED",        label: "Filed",        icon: faFileAlt,             color: "blue" },
    { key: "PENDING",      label: "Pending Review", icon: faHourglass,          color: "orange" },
    { key: "ACCEPTED",     label: "Accepted",     icon: faCheckCircle,         color: "purple" },
    { key: "IN_PROGRESS",  label: "In Progress",  icon: faMagnifyingGlass,     color: "indigo" },
    { key: "ESCALATED",    label: "Escalated",    icon: faTriangleExclamation, color: "red" },
    { key: "RESOLVED",     label: "Resolved",     icon: faCheckCircle,         color: "green" },
];

const TERMINAL_STATUSES = ["RESOLVED", "REJECTED", "WITHDRAWN"];

function getStepColor(color, done) {
    if (!done) return { bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-400", border: "border-gray-200 dark:border-gray-600", ring: "" };
    const map = {
        blue:   { bg: "bg-blue-100 dark:bg-blue-900/40",   text: "text-blue-600 dark:text-blue-400",   border: "border-blue-200 dark:border-blue-700",   ring: "ring-2 ring-blue-300 dark:ring-blue-700" },
        orange: { bg: "bg-orange-100 dark:bg-orange-900/40",text: "text-orange-600 dark:text-orange-400",border: "border-orange-200 dark:border-orange-700", ring: "ring-2 ring-orange-300" },
        purple: { bg: "bg-purple-100 dark:bg-purple-900/40",text: "text-purple-600 dark:text-purple-400",border: "border-purple-200 dark:border-purple-700", ring: "ring-2 ring-purple-300" },
        indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/40",text: "text-indigo-600 dark:text-indigo-400",border: "border-indigo-200 dark:border-indigo-700", ring: "ring-2 ring-indigo-300" },
        red:    { bg: "bg-red-100 dark:bg-red-900/40",     text: "text-red-600 dark:text-red-400",     border: "border-red-200 dark:border-red-700",     ring: "ring-2 ring-red-300" },
        green:  { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-600 dark:text-green-400", border: "border-green-200 dark:border-green-700",  ring: "ring-2 ring-green-300" },
    };
    return map[color] || map.blue;
}

function formatDateTime(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
    });
}

const GrievanceTrackerPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [grievance, setGrievance] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) { navigate("/customer/track"); return; }
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
                console.error("Track page error:", err);
                toast.error("Could not load grievance details.");
                navigate("/customer/track");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, navigate]);

    /* Build a timestamp map from history: status → first occurrence time */
    const timestampMap = {};
    history.forEach(h => {
        const s = h.status;  // GrievanceHistoryDto.status
        if (s && !timestampMap[s]) {
            timestampMap[s] = h.timestamp;
        }
    });
    /* Also fall back to grievance direct fields */
    if (grievance) {
        if (!timestampMap["FILED"])    timestampMap["FILED"]    = grievance.createdAt;
        if (!timestampMap["RESOLVED"]) timestampMap["RESOLVED"] = grievance.resolvedAt;
    }

    /* Which steps are "done" for this grievance */
    const currentStatus = grievance?.status;
    const isTerminal = TERMINAL_STATUSES.includes(currentStatus);
    const stepsToShow = currentStatus === "ESCALATED"
        ? STATUS_STEPS
        : STATUS_STEPS.filter(s => s.key !== "ESCALATED");

    const completedKeys = new Set(history.map(h => h.newStatus || h.status || h.toStatus));
    if (grievance) completedKeys.add(currentStatus);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-500" />
            </div>
        );
    }

    if (!grievance) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
            {/* ── Back + Header ── */}
            <div className="flex items-center space-x-3">
                <button onClick={() => navigate("/customer/track")}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        Grievance #{grievance.id} — {grievance.title}
                    </h1>
                    <p className="text-xs font-mono text-gray-400">{grievance.referenceNumber}</p>
                </div>
            </div>

            {/* ── Summary Card ── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                    { label: "Category",    value: grievance.category?.replace(/_/g, " ") },
                    { label: "Priority",    value: grievance.priority },
                    { label: "Bank",        value: grievance.bankCode },
                    { label: "Filed",       value: formatDateTime(grievance.createdAt) },
                    { label: "Updated",     value: formatDateTime(grievance.updatedAt) || "—" },
                    { label: "Resolved",    value: formatDateTime(grievance.resolvedAt) || "—" },
                ].map(({ label, value }) => (
                    <div key={label}>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{value || "—"}</p>
                    </div>
                ))}
            </div>

            {/* ── Timeline ── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-6 uppercase tracking-wider">
                    Progress Timeline
                </h2>

                {/* Rejected / Withdrawn state */}
                {(currentStatus === "REJECTED" || currentStatus === "WITHDRAWN") && (
                    <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 mb-6">
                        <FontAwesomeIcon icon={faCircleXmark} className="text-red-500 text-xl" />
                        <div>
                            <p className="font-bold text-red-700 dark:text-red-300">
                                Grievance {currentStatus === "REJECTED" ? "Rejected" : "Withdrawn"}
                            </p>
                            <p className="text-xs text-red-500 mt-0.5">
                                {formatDateTime(grievance.updatedAt || grievance.createdAt)}
                            </p>
                        </div>
                    </div>
                )}

                <ol className="relative">
                    {stepsToShow.map((step, idx) => {
                        const done = completedKeys.has(step.key);
                        const isCurrent = currentStatus === step.key;
                        const ts = timestampMap[step.key];
                        const colors = getStepColor(step.color, done);
                        const isLast = idx === stepsToShow.length - 1;

                        return (
                            <li key={step.key} className="relative flex items-start space-x-4 pb-8 last:pb-0">
                                {/* Vertical connector line */}
                                {!isLast && (
                                    <div className={`absolute left-5 top-10 bottom-0 w-0.5 ${done ? "bg-blue-200 dark:bg-blue-800" : "bg-gray-200 dark:bg-gray-700"}`} />
                                )}

                                {/* Icon circle */}
                                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${colors.bg} ${colors.border} ${isCurrent ? colors.ring : ""}`}>
                                    <FontAwesomeIcon icon={step.icon} className={`text-sm ${colors.text}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-1.5">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <p className={`text-sm font-bold ${done ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                                            {step.label}
                                            {isCurrent && !isTerminal && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                                    Current
                                                </span>
                                            )}
                                        </p>
                                        {ts && (
                                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                                <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                {formatDateTime(ts)}
                                            </p>
                                        )}
                                    </div>
                                    {!done && !ts && (
                                        <p className="text-xs text-gray-400 mt-0.5 italic">Pending</p>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </div>

            {/* ── Full History Log ── */}
            {history.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                    <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wider">
                        Activity Log
                    </h2>
                    <ul className="space-y-3">
                        {history.slice().reverse().map((h, i) => (
                            <li key={i} className="flex items-start space-x-3 text-sm">
                                <span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                                        {h.status || "Updated"}
                                    </span>
                                    {h.note && (
                                        <span className="text-gray-500 dark:text-gray-400"> — {h.note}</span>
                                    )}
                                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                                        {formatDateTime(h.timestamp)}
                                        {h.updatedBy && ` · by ${h.updatedBy}`}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="text-center">
                <Link to="/customer/track" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    ← Back to My Grievances
                </Link>
            </div>
        </div>
    );
};

export default GrievanceTrackerPage;
