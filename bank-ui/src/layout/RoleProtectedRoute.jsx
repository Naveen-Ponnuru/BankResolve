import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser } from "../store/auth-slice";
import { hasPermission } from "../constants/roles";
import { normalizeRole } from "../utils/roleUtils";

const RoleProtectedRoute = ({
  allowedRoles = [],
  requiredPermission = null,
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const location = useLocation();

  console.log("RoleProtectedRoute:", {
    isAuthenticated,
    user,
    location: location.pathname,
    allowedRoles,
  });

  // ─── CRITICAL: Loading State Guard ────────────────────────────────────────
  // Return null if user data is missing from Redux (Wait for hydration)
  if (!user) {
    return null;
  }

  // Extract normalized roles (strip ROLE_ prefix, uppercase)
  let userRoles = [];
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    userRoles = user.roles
      .filter((r) => typeof r === "string")
      .map((r) => normalizeRole(r));
  } else if (typeof user.role === "string") {
    userRoles = [normalizeRole(user.role)];
  }

  // Normalize allowed roles for comparison
  const normalizedAllowed = allowedRoles
    .filter((r) => typeof r === "string")
    .map((r) => normalizeRole(r));

  // DEBUG: log role comparison details
  console.log("[RoleProtectedRoute] role check", {
    pathname: location.pathname,
    userRoles,
    normalizedAllowed,
    isAuthenticated,
  });

  // ─── Not Authenticated ────────────────────────────────────────────────────
  if (!isAuthenticated) {
    console.warn(
      "[RoleProtectedRoute] not authenticated, redirecting to /login",
      {
        pathname: location.pathname,
      },
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Extra safety: authenticated but no usable roles extracted
  if (userRoles.length === 0) {
    console.warn(
      "[RoleProtectedRoute] no roles found on user object, forcing re-login",
      {
        pathname: location.pathname,
        user,
      },
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Evaluate role access + log the redirect decision
  const passesAllowedCheck =
    normalizedAllowed.length === 0 ||
    userRoles.some((r) => normalizedAllowed.includes(r));

  console.log("[RoleProtectedRoute] redirect decision", {
    pathname: location.pathname,
    userRoles,
    normalizedAllowed,
    passesAllowedCheck,
    redirectDecision: passesAllowedCheck ? "ALLOW" : "DENY → /unauthorized",
  });

  if (!passesAllowedCheck) {
    console.warn(
      "[RoleProtectedRoute] redirecting to /unauthorized due to role mismatch",
      {
        pathname: location.pathname,
        userRoles,
        normalizedAllowed,
      },
    );
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission-based access (Advanced RBAC)
  // `userRoles` is the computed array of roles the current user has
  if (requiredPermission && !hasPermission(userRoles, requiredPermission)) {
    console.warn(
      "[RoleProtectedRoute] redirecting to /unauthorized due to missing permission",
      {
        pathname: location.pathname,
        userRoles,
        requiredPermission,
      },
    );
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
