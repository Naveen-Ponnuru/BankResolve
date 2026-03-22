import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import apiClient from "../../api/apiClient";

const Contact = () => {
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
      // Map to Ecommerce ContactRequestDto format
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

  const officeLocations = [
    {
      city: "Mumbai",
      address: "101, Business Park, Bandra Kurla Complex",
      phone: "+91-22-1234-5678",
      email: "mumbai@bankresolve.com",
    },
    {
      city: "Bangalore",
      address: "Suite 500, Tech Tower, Indranagar",
      phone: "+91-80-1234-5678",
      email: "bangalore@bankresolve.com",
    },
    {
      city: "Delhi",
      address: "Floor 12, Corporate Hub, Connaught Place",
      phone: "+91-11-1234-5678",
      email: "delhi@bankresolve.com",
    },
    {
      city: "Chennai",
      address: "Level 5, Tech Park Drive, Anna Nagar",
      phone: "+91-44-1234-5678",
      email: "chennai@bankresolve.com",
    },
  ];

  const faqs = [
    {
      question: "What is the typical grievance resolution time?",
      answer:
        "Our average resolution time is 2.5 days. However, this depends on the complexity of the grievance.",
    },
    {
      question: "Is my personal information secure?",
      answer:
        "Yes, we use enterprise-grade encryption (ISO 27001 certified) and comply with all banking regulations.",
    },
    {
      question: "Can I file multiple grievances?",
      answer:
        "Yes, you can file multiple grievances. Each will be tracked and resolved independently.",
    },
    {
      question: "What happens after I submit a grievance?",
      answer:
        "You'll receive a reference number via email. You can use this to track the status anytime.",
    },
    {
      question: "Do you support all banks?",
      answer:
        "We currently support 15+ major banks in India. Check our home page to see your bank.",
    },
    {
      question: "How can I contact customer support?",
      answer:
        "You can reach us via email, phone, or through this contact form. We respond within 2-4 hours.",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* ============ HEADER ============ */}
      <section className="bg-linear-to-r from-blue-600 to-blue-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-white text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg opacity-90">
            We're here to help and answer any questions you might have
          </p>
        </div>
      </section>

      {/* ============ CONTACT INFO ============ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700">
              <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faPhone} className="text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Available 9 AM - 9 PM EST
              </p>
              <a
                href="tel:+919876543210"
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                +91-1234-567890
              </a>
            </div>

            <div className="p-6 rounded-lg bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700">
              <div className="w-12 h-12 rounded-lg bg-green-600 text-white flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faEnvelope} className="text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Response within 2-4 hours
              </p>
              <a
                href="mailto:support@bankresolve.com"
                className="text-green-600 dark:text-green-400 font-semibold hover:underline"
              >
                support@bankresolve.com
              </a>
            </div>

            <div className="p-6 rounded-lg bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700">
              <div className="w-12 h-12 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                4 Office Locations
              </p>
              <p className="text-purple-600 dark:text-purple-400 font-semibold">
                India-wide presence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTACT FORM & LOCATIONS ============ */}
      <section className="bg-gray-50 dark:bg-gray-800 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="+91-123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Tell us more..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Office Locations */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Our Locations</h2>
            <div className="space-y-4">
              {officeLocations.map((location, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    {location.city}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-start space-x-3">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-blue-600 dark:text-blue-400 mt-1"
                      />
                      <span>{location.address}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                     `` <FontAwesomeIcon
                        icon={faPhone}
                        className="text-blue-600 dark:text-blue-400"
                      />
                      <a
                        href={`tel:${location.phone}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {location.phone}
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="text-blue-600 dark:text-blue-400"
                      />
                      <a
                        href={`mailto:${location.email}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {location.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <summary className="flex justify-between items-center font-semibold text-lg">
                  {faq.question}
                  <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ RESPONSE TIME ============ */}
      <section className="bg-blue-50 dark:bg-blue-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Our Commitment</h3>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            We respond to all inquiries within 2-4 business hours. For urgent
            matters, call our support line at +91-1234-567890.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Contact;
