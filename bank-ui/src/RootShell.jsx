import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";
import { useDispatch } from "react-redux";
import useTheme from "./hooks/useTheme";
import { appRouter } from "./main";
import { loadBanksFromApi } from "./store/bankSlice";

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
    }, [dispatch]);

    return (
        <>
            <RouterProvider router={appRouter} />
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={true} 
                draggable
                pauseOnHover
                theme={isDark ? "dark" : "light"}
                transition={Bounce}
                // Phase 8: Prevent overlap with sticky header (h-16 = 64px)
                style={{ marginTop: "70px" }}
                limit={3}
            />
        </>
    );
}
