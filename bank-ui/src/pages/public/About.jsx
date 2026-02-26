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

  const team = [
    {
      name: "Rajesh Kumar",
      role: "Chief Executive Officer",
      bio: "20+ years in fintech and banking technology.",
    },
    {
      name: "Priya Gupta",
      role: "Head of Operations",
      bio: "Expert in grievance management and customer satisfaction.",
    },
    {
      name: "Amit Singh",
      role: "Technology Director",
      bio: "Leading cloud infrastructure and security initiatives.",
    },
    {
      name: "Neha Sharma",
      role: "Customer Success Manager",
      bio: "Dedicated to ensuring exceptional customer experience.",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
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

      {/* ============ TIMELINE ============ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Our Journey
          </h2>

          <div className="space-y-8">
            {[
              {
                year: "2020",
                title: "Founded",
                description:
                  "GrievanceHub was founded with a vision to transform banking.",
              },
              {
                year: "2021",
                title: "First Bank Partnership",
                description:
                  "Successfully onboarded our first major bank partner.",
              },
              {
                year: "2022",
                title: "Multi-Bank Support",
                description:
                  "Expanded to support 10+ banks across the country.",
              },
              {
                year: "2024",
                title: "100K+ Happy Customers",
                description: "Reached milestone of 100,000+ registered users.",
              },
            ].map((milestone, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-400 mt-2"></div>
                  {idx < 3 && (
                    <div className="w-1 h-24 bg-blue-200 dark:bg-blue-800"></div>
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {milestone.year}
                  </h3>
                  <p className="text-lg font-semibold mt-1">
                    {milestone.title}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TEAM ============ */}
      <section className="bg-gray-50 dark:bg-gray-800 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Our Team
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="rounded-lg overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              >
                <div className="h-48 bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <div className="text-5xl">👤</div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: "Banks Partnered", value: "15+" },
              { label: "Grievances Resolved", value: "50,000+" },
              { label: "Active Users", value: "100,000+" },
              { label: "Avg Resolution", value: "2.5 Days" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CERTIFICATIONS ============ */}
      <section className="bg-gray-50 dark:bg-gray-800 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Certifications & Compliance
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: "🔒", label: "ISO 27001" },
              { icon: "✅", label: "RBI Compliant" },
              { icon: "🛡️", label: "SOC 2 Type II" },
              { icon: "⚖️", label: "GDPR Ready" },
            ].map((cert, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-4xl mb-2">{cert.icon}</div>
                <p className="font-semibold text-sm">{cert.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
