import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPaperPlane,
    faInfoCircle,
    faIndianRupeeSign,
    faTag,
    faAlignLeft
} from "@fortawesome/free-solid-svg-icons";
import grievanceService from "../services/grievanceService";
import FormInput from "../ui/FormInput";
import FormSelect from "../ui/FormSelect";

const CATEGORY_OPTIONS = [
    { value: "TRANSACTION_FAILURE", label: "Transaction Failure" },
    { value: "UPI_FRAUD", label: "UPI Fraud" },
    { value: "CREDIT_CARD_FRAUD", label: "Credit Card Fraud" },
    { value: "ACCOUNT_BLOCK", label: "Account Blocked" },
    { value: "ATM_ISSUE", label: "ATM Withdrawal Issue" },
    { value: "LOAN_QUERY", label: "Loan Query" },
    { value: "OTHER", label: "Other" },
];

const CATEGORIES_WITH_AMOUNT = [
    "TRANSACTION_FAILURE",
    "UPI_FRAUD",
    "CREDIT_CARD_FRAUD",
    "ATM_ISSUE",
    "LOAN_QUERY"
];

const FileGrievance = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        category: "OTHER",
        transactionAmount: "",
        description: "",
    });
    const navigate = useNavigate();
    const maxChars = 1000;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const isAmountRequired = CATEGORIES_WITH_AMOUNT.includes(formData.category);
            const payload = {
                title: formData.title,
                category: formData.category,
                description: formData.description,
                transactionAmount: isAmountRequired && formData.transactionAmount ? parseFloat(formData.transactionAmount) : null
            };

            await grievanceService.createGrievance(payload);
            toast.success("Grievance filed successfully! Use the tracking ID to monitor progress.");

            // Redirect to Track page as requested
            navigate("/customer/track");
        } catch (error) {
            console.error("Submission error:", error);
            toast.error(error.response?.data?.message || "Failed to file grievance. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in text-gray-900 dark:text-gray-100 pb-12">
            <div className="mb-8">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                        <FontAwesomeIcon icon={faPaperPlane} className="text-xl" />
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight">File New Grievance</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                    Submit your grievance details below. Our system automatically assigns priority based on the transaction amount and category to ensure rapid resolution.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-linear-to-r from-blue-600 to-indigo-600 h-2 w-full"></div>

                <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
                                <FontAwesomeIcon icon={faTag} className="mr-2 text-blue-500" />
                                Category <span className="text-red-500 ml-1">*</span>
                            </label>
                            <FormSelect
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                options={CATEGORY_OPTIONS}
                                required
                                className="w-full"
                            />
                        </div>

                        {CATEGORIES_WITH_AMOUNT.includes(formData.category) && (
                            <div className="space-y-2 animate-fade-in">
                                <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
                                    <FontAwesomeIcon icon={faIndianRupeeSign} className="mr-2 text-blue-500" />
                                    Transaction Amount <span className="text-red-500 ml-1">*</span>
                                </label>
                                <FormInput
                                    name="transactionAmount"
                                    type="number"
                                    placeholder="Enter amount"
                                    value={formData.transactionAmount}
                                    onChange={handleInputChange}
                                    required={true}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
                            <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-blue-500" />
                            Grievance Title <span className="text-red-500 ml-1">*</span>
                        </label>
                        <FormInput
                            name="title"
                            placeholder="Brief summary (e.g., ATM failed but amount debited)"
                            required
                            maxLength={100}
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
                            <FontAwesomeIcon icon={faAlignLeft} className="mr-2 text-blue-500" />
                            Detailed Description <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                            <textarea
                                name="description"
                                rows="6"
                                required
                                maxLength={maxChars}
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe the incident in detail, including dates and any relevant context..."
                                className="w-full px-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50/50 dark:bg-gray-900/50 transition-all resize-none text-gray-900 dark:text-white"
                            ></textarea>
                            <div className="absolute bottom-4 right-4 text-[10px] font-bold px-2 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-gray-400 border border-gray-100 dark:border-gray-700">
                                {formData.description.length}/{maxChars}
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-end space-y-4 sm:space-y-0 sm:space-x-4 border-t border-gray-50 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto px-8 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Back to Dashboard
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full sm:w-auto inline-flex items-center justify-center px-10 py-3 rounded-2xl text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition-all ${isSubmitting
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
                                }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Filing Grievance...
                                </span>
                            ) : (
                                "Submit Grievance"
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/40 flex items-start space-x-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <FontAwesomeIcon icon={faInfoCircle} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Secure Filing Policy</h4>
                    <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mt-1 leading-relaxed">
                        Your grievance is securely tied to your bank account. Once submitted, it cannot be edited, but you can track it in real-time. False filings may lead to account penalties per RBI guidelines.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FileGrievance;
