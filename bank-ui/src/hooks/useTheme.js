/**
 * useTheme — Production-grade dark mode hook for BankGrievance UI
 *
 * Architecture:
 *   - "dark" class is applied ONLY to <html> (document.documentElement)
 *   - NEVER applied to a wrapper div
 *   - Persists choice in localStorage under key "theme"
 *   - Listens to "storage" event so multiple hook instances (e.g.
 *     PublicLayout + DashboardLayout lazy-loaded tabs) stay in sync
 *   - No flash of light mode: index.html inline script runs before React
 *
 * Usage:
 *   const { isDark, toggleTheme } = useTheme();
 */
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "theme";

function getPrefersDark() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function applyThemeToHtml(isDark) {
  // Dark class lives ONLY on <html>, never on a React wrapper div
  const html = document.documentElement;
  if (isDark) {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
}

export default function useTheme() {
  const [isDark, setIsDark] = useState(getPrefersDark);

  // On mount: ensure the class matches state
  // (the inline script may have already applied it, but React state needs to agree)
  useEffect(() => {
    applyThemeToHtml(isDark);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cross-instance sync: if another component or tab toggles theme via
  // localStorage, this hook will pick it up via the "storage" event.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        const next = e.newValue === "dark";
        setIsDark(next);
        applyThemeToHtml(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      applyThemeToHtml(next);
      try {
        localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
        // Dispatch a storage event manually so same-tab hook instances sync
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: STORAGE_KEY,
            newValue: next ? "dark" : "light",
            storageArea: localStorage,
          })
        );
      } catch {
        // Ignore storage errors (private browsing, quota, etc.)
      }
      return next;
    });
  }, []);

  return { isDark, toggleTheme };
}
