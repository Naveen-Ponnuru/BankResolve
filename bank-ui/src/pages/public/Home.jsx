import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faClipboardList,
  faLock,
  faThumbsUp,
  faArrowRight,
  faStar,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { selectBank } from "../../store/bankSlice";

const Home = () => {
  const selectedBank = useSelector(selectBank);

  const features = [
    {
      icon: faFileAlt,
      title: "File Complaint",
      description:
        "Easily file a grievance online with detailed information and documentation.",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      icon: faClipboardList,
      title: "Track Status",
      description:
        "Real-time tracking of your complaint resolution with updates and SLA.",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      icon: faLock,
      title: "Secure & Safe",
      description:
        "Enterprise-grade security with end-to-end encryption for all data.",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
      icon: faThumbsUp,
      title: "Quick Resolution",
      description:
        "Fast-tracked complaint resolution with dedicated support team.",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900",
    },
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Customer",
      text: "Excellent service! My complaint was resolved within 3 days.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Business Customer",
      text: "Very professional and transparent process. Highly recommended!",
      rating: 5,
    },
    {
      name: "Amit Patel",
      role: "Corporate Client",
      text: "Best grievance system I've used. Easy to track and resolve.",
      rating: 4,
    },
  ];

  const stats = [
    { label: "Grievances Resolved", value: "50,000+" },
    { label: "Active Users", value: "100,000+" },
    { label: "Avg Resolution Time", value: "2.5 Days" },
    { label: "Customer Satisfaction", value: "98%" },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Bank Grievance Management Made{" "}
                <span className="text-blue-600 dark:text-blue-400">Simple</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Resolve your banking issues quickly and transparently with our
                enterprise grievance platform. Track status in real-time and get
                dedicated support.
              </p>

              {/* Bank Context */}
              <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border-l-4 border-blue-600">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Using {selectedBank.name}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Change bank from navbar dropdown
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center sm:justify-start space-x-2"
                >
                  <span>Get Started</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition font-semibold"
                >
                  Login
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="hidden md:flex justify-center items-center">
              <div className="relative w-full h-64 md:h-80">
                <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-blue-600 rounded-lg transform rotate-3 opacity-20"></div>
                <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex items-center justify-center">
                  <div className="text-6xl">📋</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 dark:bg-blue-900 rounded-full opacity-10 -mr-48 -mt-48"></div>
      </section>

      {/* ============ STATS SECTION ============ */}
      <section className="bg-gray-50 dark:bg-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform provides comprehensive grievance management with
              enterprise-grade security and transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition"
              >
                <div
                  className={`${feature.bgColor} ${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                >
                  <FontAwesomeIcon icon={feature.icon} className="text-xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="bg-gray-50 dark:bg-gray-800 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Register",
                description: "Create your account with your bank details.",
              },
              {
                step: 2,
                title: "File Complaint",
                description: "Describe your issue with detailed information.",
              },
              {
                step: 3,
                title: "Track Status",
                description: "Monitor your complaint resolution in real-time.",
              },
              {
                step: 4,
                title: "Get Resolved",
                description:
                  "Receive confirmation once your issue is resolved.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {item.description}
                  </p>
                </div>
                {item.step < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="text-blue-600 dark:text-blue-400 text-xl"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Customer Reviews
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className="text-yellow-400 text-sm"
                    />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="bg-linear-to-r from-blue-600 to-blue-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Resolve Your Issues?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of customers using GrievanceHub for fast and
            transparent dispute resolution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center justify-center space-x-2"
            >
              <span>Register Now</span>
              <FontAwesomeIcon icon={faCheckCircle} />
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition font-semibold"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
