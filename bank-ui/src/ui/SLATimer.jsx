import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-regular-svg-icons";

const SLATimer = ({ targetDate, status }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [isBreached, setIsBreached] = useState(false);

    useEffect(() => {
        // If resolved, stop timer logically (or display "--")
        if (status === "RESOLVED") {
            setTimeLeft("Resolved");
            setIsBreached(false);
            return;
        }

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const difference = target - now;

            if (difference < 0) {
                setIsBreached(true);
                setTimeLeft("Breached");
                clearInterval(interval);
            } else {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

                let timeString = "";
                if (days > 0) timeString += `${days}d `;
                timeString += `${hours}h ${minutes}m`;
                setTimeLeft(timeString);

                // Warning if less than 24 hours
                if (days === 0 && hours < 24) {
                    setIsBreached(true); // Treat as warning/breached state for styling
                } else {
                    setIsBreached(false);
                }
            }
        }, 60000); // UI update every minute

        // Initial calculation immediately
        const now = new Date().getTime();
        const target = new Date(targetDate).getTime();
        const difference = target - now;
        if (difference < 0) {
            setIsBreached(true);
            setTimeLeft("Breached");
        } else {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

            let timeString = "";
            if (days > 0) timeString += `${days}d `;
            timeString += `${hours}h ${minutes}m`;
            setTimeLeft(timeString);
            if (days === 0 && hours < 24) setIsBreached(true);
        }

        return () => clearInterval(interval);
    }, [targetDate, status]);

    const badgeColors = isBreached
        ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-800"
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
