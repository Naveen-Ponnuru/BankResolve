import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
    const modalRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent background scrolling when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-gray-900/60 transition-opacity backdrop-blur-sm"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                className={`relative w-full ${maxWidth} mx-auto my-6 p-4 animate-fade-in-up z-50`}
            >
                <div className="relative flex flex-col w-full bg-white dark:bg-gray-800 border-0 rounded-2xl shadow-2xl outline-none focus:outline-none overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white" id="modal-title">
                            {title}
                        </h3>
                        <button
                            className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors outline-none focus:outline-none"
                            onClick={onClose}
                            aria-label="Close modal"
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-xl leading-none" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="relative p-6 flex-auto max-h-[70vh] overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
