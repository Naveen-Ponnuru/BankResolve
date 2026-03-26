import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowRight, 
  faStar
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { selectBank, selectAvailableBanks } from "../../store/bankSlice";
import { selectIsAuthenticated, selectUser } from "../../store/auth-slice";
import { normalizeRole } from "../../utils/roleUtils";
import grievanceService from "../../services/grievanceService";
import { getThemeClasses } from "../../utils/themeUtils";


const Home = () => {
  const selectedBankFromStore = useSelector(selectBank);
  const availableBanks = useSelector(selectAvailableBanks);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const reduxUser = useSelector(selectUser);
  const role = reduxUser ? normalizeRole(reduxUser.role) : null;

  // Find the full bank object with rich metadata (features, tagline, theme)
  // Strict isolation: if logged in, use user's bank. Else use selectedBank from dropdown.
  const activeBankId = isAuthenticated && reduxUser?.bankId ? reduxUser.bankId : selectedBankFromStore?.id;
  const fullBankData = availableBanks.find(b => b.id === activeBankId) || selectedBankFromStore;

  const activeBankName = fullBankData?.name || "BankResolve";
  const themeClasses = getThemeClasses(fullBankData?.themeColor || "blue");
  
  const dashboardLink = role === "MANAGER" ? "/manager/dashboard" :
    role === "STAFF" ? "/staff/dashboard" :
      role === "ADMIN" ? "/admin/dashboard" :
        "/customer/dashboard";

  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    grievancesResolved: 0,
    recentFeedback: []
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let intervalId;

    const fetchStats = async (isInitial = false) => {
      if (!activeBankId || isNaN(activeBankId)) return;
      try {
        if (isInitial) setLoadingStats(true);
        // Ensure activeBankId is numeric before sending to backend
        const numericBankId = Number(activeBankId);
        if (isNaN(numericBankId)) {
            console.warn("Home: Skipping stats fetch, bankId is not a number:", activeBankId);
            return;
        }
        const data = await grievanceService.getPublicStats(numericBankId);
        setStatsData(data || {
            totalUsers: 0,
            grievancesResolved: 0,
            recentFeedback: []
        });
      } catch (error) {
        console.error("Home: Failed to fetch public stats:", error);
      } finally {
        if (isInitial) setLoadingStats(false);
      }
    };
    
    // Initial fetch
    fetchStats(true);

    // Set up polling for real-time updates (every 10 seconds)
    if (activeBankId) {
      intervalId = setInterval(() => {
        fetchStats(false);
      }, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeBankId]);

  const displayStats = [
    { label: "Grievances Resolved", value: loadingStats ? "-" : statsData.grievancesResolved },
    { label: "Active Users", value: loadingStats ? "-" : statsData.totalUsers },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <section className={`relative py-20 overflow-hidden bg-linear-to-b ${themeClasses.gradient}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center mt-8">
          <div className={`mb-6 inline-flex items-center space-x-2 px-4 py-2 ${themeClasses.highlight} rounded-full`}>
            <span className="text-xl">🏦</span>
            <span className="text-sm font-bold uppercase tracking-wide">
              {activeBankName} Grievance Portal
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight text-gray-900 dark:text-white">
            {activeBankName} <span className={themeClasses.text}>Resolution Center</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mb-10 leading-relaxed">
            Direct, secure, and transparent grievance management for our valued customers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-6">
            {isAuthenticated ? (
              <Link
                to={dashboardLink}
                className={`w-full sm:w-auto px-8 py-4 ${themeClasses.bg} text-white font-bold rounded-xl shadow-lg transition transform hover:-translate-y-1 text-lg flex items-center justify-center`}
              >
                Go to My Dashboard
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className={`w-full sm:w-auto px-8 py-4 ${themeClasses.bg} text-white font-bold rounded-xl shadow-lg transition transform hover:-translate-y-1 text-lg flex items-center justify-center`}
                >
                  File a Grievance
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition transform hover:-translate-y-1 text-lg shadow-sm flex items-center justify-center"
                >
                  Track Existing
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats Banner ────────────────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-8">
            {displayStats.map((stat, idx) => (
              <div key={idx} className="text-center transition-all duration-300 transform hover:scale-105">
                <p className={`text-3xl md:text-4xl font-bold ${themeClasses.text} mb-2`}>
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium tracking-wide uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── Recent Feedback ─────────────────────────────────────────────── */}
      {!loadingStats && statsData.recentFeedback && statsData.recentFeedback.length > 0 && (
        <section className="bg-white dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className={`text-2xl font-bold text-center mb-10 ${themeClasses.text}`}>What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statsData.recentFeedback.slice(0, 3).map((feedback, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-400 absolute top-4 right-4 text-xl opacity-20" />
                  <p className="text-gray-700 dark:text-gray-300 italic mb-4 text-sm leading-relaxed">
                    "{feedback.comment || 'No comment provided'}"
                  </p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      - {feedback.customerName || 'Anonymous'}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium italic">
                      {feedback.timestamp || 'Recently Submitted'}
                    </p>
                  </div>
                  <div className="mt-2 flex">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon 
                        key={i} 
                        icon={faStar} 
                        className={`text-[10px] ${i < (feedback.rating || 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ CTA SECTION ============ */}
      <section className="bg-linear-to-r from-blue-600 to-blue-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Need Assistance?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Our team is dedicated to resolving your concerns through this secure portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <Link
                to="/register"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-bold"
              >
                File a Grievance
              </Link>
            ) : (
              <Link
                to={dashboardLink}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-bold"
              >
                Go to Dashboard
              </Link>
            )}
            <Link
              to="/about"
              className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition font-bold"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
