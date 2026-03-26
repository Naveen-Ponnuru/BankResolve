import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faLeaf,
  faShieldAlt,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

const About = () => {
  const values = [
    {
      icon: faBullseye,
      title: "Transparency",
      description:
        "Complete visibility into your complaint status with real-time updates.",
    },
    {
      icon: faShieldAlt,
      title: "Security",
      description:
        "Enterprise-grade encryption and compliance with banking regulations.",
    },
    {
      icon: faUsers,
      title: "Customer Focus",
      description:
        "Dedicated support team working around the clock for your issues.",
    },
    {
      icon: faLeaf,
      title: "Sustainability",
      description:
        "Paperless operations contributing to environmental conservation.",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white pb-20">
      {/* ============ HEADER ============ */}
      <section className="bg-linear-to-r from-blue-600 to-blue-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-white text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-lg opacity-90">
            Leading the transformation of banking grievance management
          </p>
        </div>
      </section>

      {/* ============ MISSION & VISION ============ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                To provide a transparent, secure, and efficient platform for
                bank customers to resolve grievances with confidence and speed.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                We believe every customer deserves fair treatment and quick
                resolution of their issues. By leveraging technology, we ensure
                every complaint is tracked, managed, and resolved
                systematically.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                To become the most trusted grievance management platform across
                all Indian banks.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                We envision a future where banking grievances are resolved
                within 24-48 hours, where transparency is the norm, and where
                every customer feels supported throughout their journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ VALUES ============ */}
      <section className="bg-gray-50 dark:bg-gray-800 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Our Core Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={value.icon} className="text-xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
