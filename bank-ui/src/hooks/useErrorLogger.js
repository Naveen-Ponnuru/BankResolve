import { useCallback } from "react";

/**
 * Hook for centralized error logging.
 * In production, this would send data to Sentry, LogRocket, Datadog or ELK stack
 */
export const useErrorLogger = () => {
    const logError = useCallback((error, context = {}) => {
        console.group("❌ Enterprise Error Logger Catch");
        console.error("Error:", error);
        console.info("Context:", context);
        console.info("Timestamp:", new Date().toISOString());
        console.info("User Agent:", navigator.userAgent);

        // Attempt local storage parsing for context if available
        try {
            const user = localStorage.getItem("user");
            if (user) {
                console.info("Affected User ID:", JSON.parse(user).id || "unknown");
                console.info("Affected User Role:", JSON.parse(user).role || "unknown");
            }
        } catch (e) {
            // ignore
        }
        console.groupEnd();

        // Placeholder for external API call
        // axios.post('https://logging.bankgrievance.local/v1/ui-errors', {
        //  error: error.message,
        //  stack: error.stack,
        //  context
        // });

    }, []);

    return { logError };
};

export default useErrorLogger;
