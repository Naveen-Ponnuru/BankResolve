import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import { selectIsInitialized } from "../store/auth-slice";

/**
 * AppShell — root layout wrapper.
 *
 * The shared Header lives HERE so it appears on every route:
 * public pages (Home, About, Contact), auth pages (Login, Register),
 * and all dashboards alike.
 *
 * DashboardLayout renders inside <Outlet /> and provides its own
 * sidebar; it must NOT add a second top bar.
 */
const AppShell = () => {
  const isInitialized = useSelector(selectIsInitialized);

  if (!isInitialized) {
    return null; // Block render until auth state is fully hydrated
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
