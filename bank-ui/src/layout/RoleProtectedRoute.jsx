import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser } from "../store/auth-slice";
import { hasPermission } from "../constants/roles";

const RoleProtectedRoute = ({
  allowedRoles = [],
  requiredPermission = null,
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Extract normalized roles (strip prefix and uppercase)
  let userRoles = [];
  if (user) {
    if (Array.isArray(user.roles) && user.roles.length > 0) {
      userRoles = user.roles.map((r) => r.replace(/^ROLE_/i, "").toUpperCase());
    } else if (typeof user.role === "string") {
      userRoles = [user.role.replace(/^ROLE_/i, "").toUpperCase()];
    }
  }

  // Normalize allowed roles for comparison
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
  if (
    normalizedAllowed.length > 0 &&
    !userRoles.some((r) => normalizedAllowed.includes(r))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission-based access (Advanced RBAC)
  // `userRoles` is the computed array of roles the current user has
  if (requiredPermission && !hasPermission(userRoles, requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
