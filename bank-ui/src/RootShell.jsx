import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";
import { useDispatch } from "react-redux";
import useTheme from "./hooks/useTheme";
import { appRouter } from "./main";
import { loadBanksFromApi } from "./store/bankSlice";
import { initializeAuth } from "./store/auth-slice";

/**
 * RootShell — wraps the whole app so ToastContainer can reactively
 * follow the dark mode toggle via useTheme.
 * Also handles application-level hydration (e.g. dynamic bank list).
 */
export default function RootShell() {
    const { isDark } = useTheme();
    const dispatch = useDispatch();

    useEffect(() => {
        // Hydrate dynamic bank list from backend
        dispatch(loadBanksFromApi());
        // Explicitly unblock UI rendering after initial state hydration
        dispatch(initializeAuth());
    }, [dispatch]);

    return (
        <>
            <RouterProvider router={appRouter} />
            <ToastContainer
                position="top-center"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={true} 
                draggable
                pauseOnHover
                theme={isDark ? "dark" : "light"}
                transition={Bounce}
                // Phase 8: Standardized top-center position with navbar offset (h-16 = 64px) and high z-index
                style={{ marginTop: "75px", zIndex: 9999 }}
                limit={3}
            />
        </>
    );
}
