import React from "react";
import { Outlet } from "react-router-dom";

/**
 * AuthLayout — thin wrapper for Login and Register pages.
 *
 * The global Header is rendered by AppShell (the ancestor in the route tree).
 * AuthLayout must NOT add a second header, title card, or wrapper div that
 * would conflict with each page's own full-screen layout.
 */
const AuthLayout = () => {
    return <Outlet />;
};

export default AuthLayout;
