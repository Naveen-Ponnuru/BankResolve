import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faRotateRight } from "@fortawesome/free-solid-svg-icons";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service here (e.g., Sentry, Datadog)
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-[400px] flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-100 dark:border-red-900/30 p-8 text-center animate-fade-in-up">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/40 mb-6">
                            <FontAwesomeIcon icon={faTriangleExclamation} className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            An unexpected error occurred in this component. Our team has been notified automatically.
                        </p>

                        {/* Optional: Show error details in development */}
                        {process.env.NODE_ENV === "development" && (
                            <div className="mb-6 text-left">
                                <p className="text-xs text-red-500 font-mono bg-red-50 dark:bg-red-900/20 p-3 rounded overflow-x-auto">
                                    {this.state.error?.toString()}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={this.handleReload}
                            className="inline-flex items-center justify-center w-full px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            <FontAwesomeIcon icon={faRotateRight} className="mr-2" />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
