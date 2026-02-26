import React, { useState } from "react";
import FormInput from "../ui/FormInput";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { faPaperPlane, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

// Reusable Star Rating Component
const StarRating = ({ rating, setRating, readOnly = false }) => {
    return (
        <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => !readOnly && setRating(star)}
                    className={`${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"} focus:outline-none`}
                    disabled={readOnly}
                    aria-label={`Rate ${star} stars`}
                >
                    <FontAwesomeIcon
                        icon={star <= rating ? faStarSolid : faStarRegular}
                        className={`w-8 h-8 ${star <= rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                    />
                </button>
            ))}
        </div>
    );
};

const Feedback = () => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [grievanceId, setGrievanceId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please provide a star rating.");
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
            toast.success("Feedback submitted successfully!");
        }, 1200);
    };

    if (isSubmitted) {
        return (
            <div className="max-w-2xl mx-auto mt-10">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center animate-fade-in-up">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/40 mb-6">
                        <FontAwesomeIcon icon={faCircleCheck} className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Thank You!</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        Your feedback helps us improve our enterprise grievance resolution services.
                    </p>
                    <button
                        onClick={() => {
                            setIsSubmitted(false);
                            setRating(0);
                            setComment("");
                            setGrievanceId("");
                        }}
                        className="inline-flex px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        Submit Another Feedback
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Service Feedback</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    We'd love to hear about your experience with our grievance resolution process.
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <FormInput
                        name="grievanceId"
                        label="Grievance ID (Optional)"
                        placeholder="e.g. GRV-2026-123"
                        value={grievanceId}
                        onChange={(e) => setGrievanceId(e.target.value)}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            How would you rate the resolution provided? <span className="text-red-500">*</span>
                        </label>
                        <StarRating rating={rating} setRating={setRating} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Additional Comments
                        </label>
                        <textarea
                            name="comment"
                            rows="4"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what went well or what could be improved..."
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors resize-y"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                            } transition-colors`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting Feedback...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                Submit Feedback
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Feedback;
