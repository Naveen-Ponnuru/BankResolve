import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-regular-svg-icons";

const calculateTimeLeft = (targetDate, status, isEscalated) => {
    if (status === "RESOLVED") {
        return { timeLeft: "Resolved", isBreached: false, isNearing: false };
    }

    if (status === "ESCALATED" || isEscalated) {
        return { timeLeft: "Escalated", isBreached: true, isNearing: false };
    }

    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const difference = target - now;

    if (difference < 0) {
        return { timeLeft: "Breached", isBreached: true, isNearing: false };
    } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        let timeString = "";
        if (days > 0) timeString += `${days}d `;
        timeString += `${hours}h ${minutes}m`;

        // Warning if less than 2 hours
        const isNearing = (days === 0 && hours < 2);
        return { timeLeft: timeString, isBreached: false, isNearing };
    }
};

const SLATimer = ({ targetDate, status, isEscalated }) => {
    // Use state initializers to avoid sync setState in useEffect
    const [state, setState] = useState(() => calculateTimeLeft(targetDate, status, isEscalated));

    useEffect(() => {
        if (status === "RESOLVED" || status === "ESCALATED" || isEscalated) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setState(calculateTimeLeft(targetDate, status, isEscalated));
            return;
        }

        const interval = setInterval(() => {
            setState(calculateTimeLeft(targetDate, status, isEscalated));
        }, 60000); // UI update every minute

        // Update immediately on prop change
        setState(calculateTimeLeft(targetDate, status, isEscalated));

        return () => clearInterval(interval);
    }, [targetDate, status, isEscalated]);

    const { timeLeft, isBreached, isNearing } = state;

    const badgeColors = isBreached
        ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-800"
        : isNearing
            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400 border-orange-200 dark:border-orange-800"
            : status === "RESOLVED"
                ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400 border-blue-200 dark:border-blue-800";

    return (
        <div className={`inline-flex items-center px-3 py-1 pb-1 rounded-md text-sm font-semibold border ${badgeColors} shadow-sm`} title="Service Level Agreement Time Left">
            <FontAwesomeIcon icon={faClock} className={`w-4 h-4 mr-2 ${isBreached ? 'animate-pulse' : ''}`} />
            {timeLeft}
        </div>
    );
};

export default SLATimer;
