import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser } from "../store/auth-slice";

const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const reduxUser = useSelector(selectUser);
  const location = useLocation();

  console.log("ProtectedRoute:", {
    isAuthenticated,
    reduxUser,
    location: location.pathname,
  });

  // Not authenticated — save intended path and redirect to login
  if (!isAuthenticated) {
    sessionStorage.setItem("redirectPath", location.pathname);
    return <Navigate to="/login" replace />;
  }

  // Authenticated but Redux user not yet hydrated — wait silently
  if (!reduxUser) {
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;
