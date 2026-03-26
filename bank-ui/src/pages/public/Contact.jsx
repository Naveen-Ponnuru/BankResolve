import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faHeadset,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectBank } from "../../store/bankSlice";
import { selectIsAuthenticated, selectUser } from "../../store/auth-slice";
import apiClient from "../../api/apiClient";

// ─── Bank-specific contact configuration ──────────────────────────────────────
const BANK_CONTACT_CONFIG = {
  "SBI": {
    email: "sbi@bankresolve.com",
    phone: "1800-11-2211",
    supportHours: "24x7 (Toll Free)",
    tagline: "SBI Customer Care — Always at Your Service",
  },
  "HDFC Bank": {
    email: "hdfc@bankresolve.com",
    phone: "1800-202-6161",
    supportHours: "Mon–Sat, 8 AM – 8 PM",
    tagline: "HDFC Bank Support — We Value Your Time",
  },
  "ICICI Bank": {
    email: "icici@bankresolve.com",
    phone: "1800-200-3344",
    supportHours: "24x7 (Toll Free)",
    tagline: "ICICI Bank Helpdesk — Fast, Transparent, Resolved",
  },
  "default": {
    email: "support@bankresolve.com",
    phone: "1800-123-4567",
    supportHours: "24x7 (Toll Free)",
    tagline: "BankResolve Support — Here to Help",
  }
};

const Contact = () => {
  const selectedBank = useSelector(selectBank);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const reduxUser = useSelector(selectUser);

  // Strict isolation: use authenticated user's bank when logged in
  const activeBankName = isAuthenticated && reduxUser?.bankName
    ? reduxUser.bankName
    : (selectedBank?.name || "BankResolve");

  const contactInfo = BANK_CONTACT_CONFIG[activeBankName] || BANK_CONTACT_CONFIG["default"];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobileNumber: formData.phone,
        message: formData.subject ? `[${formData.subject}] ${formData.message}` : formData.message,
      };
      await apiClient.post("/contacts", payload);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      console.error("Failed to submit contact form", error);
      toast.error(error.response?.data?.message || "Failed to submit message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: "What is the typical grievance resolution time?",
      answer: "Our average resolution time is 2.5 days. However, this depends on the complexity of the grievance.",
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we use enterprise-grade encryption (ISO 27001 certified) and comply with all banking regulations.",
    },
    {
      question: "Can I file multiple grievances?",
      answer: "Yes, you can file multiple grievances. Each will be tracked and resolved independently.",
    },
    {
      question: "What happens after I submit a grievance?",
      answer: "You'll receive a reference number via email. You can use this to track the status anytime.",
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach us via email, phone, or through this contact form. We respond within 2-4 hours.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <section className="bg-linear-to-r from-blue-600 to-blue-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-white text-center">
          <div className="mb-4 inline-flex items-center space-x-2 bg-white/20 px-4 py-1.5 rounded-full">
            <span>🏦</span>
            <span className="text-sm font-semibold uppercase tracking-wide">{activeBankName}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Contact Us</h1>
          <p className="text-lg opacity-90 max-w-xl mx-auto">
            {contactInfo.tagline}
          </p>
        </div>
      </section>

      {/* ── Bank-Specific Contact Info ────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-900 dark:text-white">
            {activeBankName} Primary Support Contacts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Card */}
            <div className="flex items-start space-x-5 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-blue-600 text-white flex items-center justify-center text-2xl">
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Email Support</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Response within 2–4 hours</p>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline break-all"
                >
                  {contactInfo.email}
                </a>
              </div>
            </div>

            {/* Phone Card */}
            <div className="flex items-start space-x-5 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-green-600 text-white flex items-center justify-center text-2xl">
                <FontAwesomeIcon icon={faHeadset} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Phone Support</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{contactInfo.supportHours}</p>
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="text-green-600 dark:text-green-400 font-semibold hover:underline"
                >
                  {contactInfo.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Commitment badge */}
          <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
            <span>Strictly isolated to {activeBankName} customers only. No data shared across banks.</span>
          </div>
        </div>
      </section>

      {/* ── Contact Form ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">Send a Message</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            Our {activeBankName} support team will respond promptly.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5 bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Phone (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  placeholder="How can we help?"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                placeholder="Describe your concern in detail..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50 text-base"
            >
              {loading ? "Sending..." : `Send to ${activeBankName} Support`}
            </button>
          </form>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-12 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer hover:shadow-sm transition"
              >
                <summary className="flex justify-between items-center font-semibold text-base text-gray-900 dark:text-white list-none">
                  {faq.question}
                  <span className="text-blue-600 dark:text-blue-400 ml-2 group-open:rotate-180 transition-transform duration-200">▼</span>
                </summary>
                <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Commitment Footer ─────────────────────────────────────────────── */}
      <section className="bg-blue-600 dark:bg-blue-800 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Our Commitment to {activeBankName} Customers</h3>
          <p className="opacity-90">
            We respond to all {activeBankName} inquiries within 2–4 business hours.
            For urgent matters, call us at <strong>{contactInfo.phone}</strong>.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Contact;
