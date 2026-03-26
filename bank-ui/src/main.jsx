import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// UI layouts and helpers
import AppShell from "./layout/AppShell.jsx";
import AppLayout from "./layout/AppLayout.jsx";
import AuthLayout from "./layout/AuthLayout.jsx";
import DashboardLayout from "./layout/DashboardLayout.jsx";
import ProtectedRoute from "./layout/ProtectedRoute.jsx";
import RoleProtectedRoute from "./layout/RoleProtectedRoute.jsx";
import PublicLayout from "./layout/PublicLayout.jsx";
import SkeletonLoader from "./ui/SkeletonLoader.jsx";
import ErrorBoundary from "./ui/ErrorBoundary.jsx";
import { ROLES } from "./constants/roles.js";
// Page Components
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Unauthorized from "./Unauthorized.jsx";
// Auth Actions
import { loginAction, registerAction } from "./actions/authActions.js";
// public pages
import Home from "./pages/public/Home.jsx";
import About from "./pages/public/About.jsx";
import Contact from "./pages/public/Contact.jsx";
// routing
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
// redux
import { Provider } from "react-redux";
import store from "./store/store.js";
// app components
import RootShell from "./RootShell.jsx";
/* =======================
   Lazy Dashboard Imports
 ======================= */
const CustomerDashboard = lazy(
  () => import("./customer/CustomerDashboard.jsx"),
);
const FileGrievance = lazy(() => import("./customer/FileGrievance.jsx"));
const TrackComplaint = lazy(() => import("./customer/TrackMyGrievances.jsx"));
const GrievanceTrackerPage = lazy(() => import("./customer/GrievanceTrackerPage.jsx"));
const Feedback = lazy(() => import("./customer/Feedback.jsx"));
const StaffDashboard = lazy(() => import("./staff/StaffDashboard.jsx"));
const ManagerDashboard = lazy(() => import("./manager/ManagerDashboard.jsx"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard.jsx"));
const GrievanceDetail = lazy(() => import("./pages/GrievanceDetail.jsx"));
/* ====================
   ROUTES
 =====================*/
const routeDefinitions = createRoutesFromElements(
  <Route element={<AppShell />} errorElement={<ErrorBoundary />}>
    {/* ============ PUBLIC AREA ============ */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
    </Route>

    {/* ============ BANK SYSTEM ========= */}
    <Route element={<AppLayout />}>
      {/* 🔐 Auth */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} action={loginAction} />
        <Route path="register" element={<Register />} action={registerAction} />
        <Route path="unauthorized" element={<Unauthorized />} />
      </Route>

      {/*  PROTECTED DASHBOARDS */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Shared Grievance Detail Route for ALL Roles */}
          <Route
            path="dashboard/grievance/:id"
            element={
              <Suspense fallback={<SkeletonLoader count={4} />}>
                <GrievanceDetail />
              </Suspense>
            }
          />

          {/* 👤 CUSTOMER */}
          <Route
            element={<RoleProtectedRoute allowedRoles={[ROLES.CUSTOMER]} />}
          >
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
                <Suspense fallback={<SkeletonLoader  type="form" />}>
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
            <Route
              path="customer/track/:id"
              element={
                <Suspense fallback={<SkeletonLoader count={4} />}>
                  <GrievanceTrackerPage />
                </Suspense>
              }
            />
          </Route>

          {/* 👨‍💼 STAFF */}
          <Route
            element={<RoleProtectedRoute allowedRoles={[ROLES.STAFF]} />}
          >
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
          <Route
            element={<RoleProtectedRoute allowedRoles={[ROLES.MANAGER]} />}
          >
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
    </Route>
  </Route>,
);

export const appRouter = createBrowserRouter(routeDefinitions);

/* =======================
   RENDER
 ======================= */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RootShell />
    </Provider>
  </StrictMode>,
);
