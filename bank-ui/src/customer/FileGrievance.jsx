import React, { useState } from "react";
import FormInput from "../ui/FormInput";
import FormSelect from "../ui/FormSelect";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const CATEGORY_OPTIONS = [
    { value: "CREDIT_CARD", label: "Credit Card" },
    { value: "LOAN", label: "Loan & Mortgages" },
    { value: "ACCOUNT", label: "Account Services" },
    { value: "FRAUD", label: "Fraud & Unauthorized Transaction" },
    { value: "OTHER", label: "Other" },
];

const FileGrievance = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [description, setDescription] = useState("");
    const navigate = useNavigate();
    const maxChars = 1000;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success("Grievance filed successfully!");
            navigate("/customer/complaints");
        }, 1500);
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">File New Grievance</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Please provide the details of your issue below. We will assign a staff member to assist you immediately.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            name="category"
                            label="Grievance Category"
                            options={CATEGORY_OPTIONS}
                            required
                        />

                        <FormInput
                            name="transactionId"
                            label="Transaction/Reference ID (Optional)"
                            placeholder="e.g. TXN12345678"
                        />
                    </div>

                    <FormInput
                        name="subject"
                        label="Subject"
                        placeholder="Brief subject of the issue"
                        required
                        maxLength={100}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <textarea
                                name="description"
                                rows="6"
                                required
                                maxLength={maxChars}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Please describe your issue in detail..."
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors resize-y"
                            ></textarea>
                            <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
                                {description.length}/{maxChars}
                            </div>
                        </div>
                    </div>

                    {/* File Upload Area */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Attachments (Optional)
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="space-y-1 text-center">
                                <FontAwesomeIcon icon={faCloudArrowUp} className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                    >
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    PNG, JPG, PDF up to 10MB
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end space-x-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                                } transition-colors`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                    Submit Grievance
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FileGrievance;
