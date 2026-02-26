import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// UI layouts and helpers
import AppLayout from "./layout/AppLayout.jsx";
import AuthLayout from "./layout/AuthLayout.jsx";
import DashboardLayout from "./layout/DashboardLayout.jsx";
import RoleProtectedRoute from "./layout/RoleProtectedRoute.jsx";
import PublicLayout from "./layout/PublicLayout.jsx";
import SkeletonLoader from "./ui/SkeletonLoader.jsx";
import ErrorBoundary from "./ui/ErrorBoundary.jsx";
import { ROLES } from "./constants/roles.js";

// auth pages
import Login, { loginAction } from "./Login.jsx";
import Register, { registerAction } from "./Register.jsx";
import Unauthorized from "./Unauthorized.jsx";

// public pages
import Home from "./pages/public/Home.jsx";
import About from "./pages/public/About.jsx";
import Contact from "./pages/public/Contact.jsx";

// routing
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

// redux
import { Provider } from "react-redux";
import store from "./store/store.js";

// toast notifications
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// theme hook — reactive dark mode
import useTheme from "./hooks/useTheme.js";

/* =======================
   Lazy Dashboard Imports
======================= */
const CustomerDashboard = lazy(
  () => import("./customer/CustomerDashboard.jsx"),
);
const FileGrievance = lazy(() => import("./customer/FileGrievance.jsx"));
const TrackComplaint = lazy(() => import("./customer/TrackComplaint.jsx"));
const Feedback = lazy(() => import("./customer/Feedback.jsx"));
const StaffDashboard = lazy(() => import("./staff/StaffDashboard.jsx"));
const ManagerDashboard = lazy(() => import("./manager/ManagerDashboard.jsx"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard.jsx"));

/* =======================
   ROUTES
======================= */
const routeDefinitions = createRoutesFromElements(
  <Route errorElement={<ErrorBoundary />}>
    {/* ============ PUBLIC AREA ============ */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
    </Route>

    {/* ============ BANK SYSTEM ============ */}
    <Route element={<AppLayout />}>
      {/* 🔐 Auth */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} action={loginAction} />
        <Route path="register" element={<Register />} action={registerAction} />
        <Route path="unauthorized" element={<Unauthorized />} />
      </Route>

      {/* ✅ PROTECTED DASHBOARDS */}
      <Route element={<DashboardLayout />}>
        {/* 👤 CUSTOMER */}
        <Route element={<RoleProtectedRoute allowedRoles={[ROLES.CUSTOMER]} />}>
          <Route
            path="customer/dashboard"
            element={
              <Suspense fallback={<SkeletonLoader count={4} />}>
                <CustomerDashboard />
              </Suspense>
            }
          />
          <Route
            path="customer/file-grievance"
            element={
              <Suspense fallback={<SkeletonLoader type="form" />}>
                <FileGrievance />
              </Suspense>
            }
          />
          <Route
            path="customer/track"
            element={
              <Suspense fallback={<SkeletonLoader type="form" />}>
                <TrackComplaint />
              </Suspense>
            }
          />
          <Route
            path="customer/feedback"
            element={
              <Suspense fallback={<SkeletonLoader type="form" />}>
                <Feedback />
              </Suspense>
            }
          />
        </Route>

        {/* 👨‍💼 STAFF */}
        <Route element={<RoleProtectedRoute allowedRoles={[ROLES.STAFF]} />}>
          <Route
            path="staff/dashboard"
            element={
              <Suspense fallback={<SkeletonLoader count={3} />}>
                <StaffDashboard />
              </Suspense>
            }
          />
        </Route>

        {/* 🧑‍💼 MANAGER */}
        <Route element={<RoleProtectedRoute allowedRoles={[ROLES.MANAGER]} />}>
          <Route
            path="manager/dashboard"
            element={
              <Suspense fallback={<SkeletonLoader count={3} />}>
                <ManagerDashboard />
              </Suspense>
            }
          />
        </Route>

        {/* 🛠 ADMIN */}
        <Route element={<RoleProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route
            path="admin/dashboard"
            element={
              <Suspense fallback={<SkeletonLoader count={4} />}>
                <AdminDashboard />
              </Suspense>
            }
          />
        </Route>
      </Route>
    </Route>
  </Route>,
);

const appRouter = createBrowserRouter(routeDefinitions);

/* ==============================================================
   AppShell — wraps the whole app so ToastContainer can reactively
   follow the dark mode toggle via useTheme.
   
   ⚠️ Do NOT read localStorage here for toast theme — it would be
   stale after the first toggle. useTheme handles the sync correctly.
=============================================================== */
function AppShell() {
  const { isDark } = useTheme();
  return (
    <>
      <RouterProvider router={appRouter} />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        draggable
        pauseOnHover
        theme={isDark ? "dark" : "light"}
        transition={Bounce}
      />
    </>
  );
}

/* =======================
   RENDER
======================= */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <AppShell />
    </Provider>
  </StrictMode>,
);
