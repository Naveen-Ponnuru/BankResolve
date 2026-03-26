/**
 * Enterprise Bank Theme System — Controlled, predefined Tailwind CSS palettes.
 *
 * Each bank maps to a safe, WCAG-contrast-tested color set.
 * DO NOT use arbitrary hex values from the database.
 * All classes must be in this file for Tailwind to include them via its content scan.
 */

const PALETTES = {
    blue: {
        bg:        "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
        text:      "text-blue-600 dark:text-blue-400",
        textMuted: "text-blue-700 dark:text-blue-300",
        border:    "border-blue-600 dark:border-blue-500",
        gradient:  "from-blue-50 to-white dark:from-gray-900 dark:to-gray-800",
        highlight: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
        ring:      "ring-blue-500",
        badge:     "bg-blue-600 text-white",
        glass:     "bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-sm border border-blue-100 dark:border-blue-800/50",
    },
    indigo: {
        bg:        "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800",
        text:      "text-indigo-600 dark:text-indigo-400",
        textMuted: "text-indigo-700 dark:text-indigo-300",
        border:    "border-indigo-600 dark:border-indigo-500",
        gradient:  "from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800",
        highlight: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300",
        ring:      "ring-indigo-500",
        badge:     "bg-indigo-600 text-white",
        glass:     "bg-indigo-50/80 dark:bg-indigo-900/30 backdrop-blur-sm border border-indigo-100 dark:border-indigo-800/50",
    },
    orange: {
        bg:        "bg-orange-600 hover:bg-orange-700 active:bg-orange-800",
        text:      "text-orange-600 dark:text-orange-400",
        textMuted: "text-orange-700 dark:text-orange-300",
        border:    "border-orange-600 dark:border-orange-500",
        gradient:  "from-orange-50 to-white dark:from-gray-900 dark:to-gray-800",
        highlight: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
        ring:      "ring-orange-500",
        badge:     "bg-orange-600 text-white",
        glass:     "bg-orange-50/80 dark:bg-orange-900/30 backdrop-blur-sm border border-orange-100 dark:border-orange-800/50",
    },
    green: {
        bg:        "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800",
        text:      "text-emerald-600 dark:text-emerald-400",
        textMuted: "text-emerald-700 dark:text-emerald-300",
        border:    "border-emerald-600 dark:border-emerald-500",
        gradient:  "from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800",
        highlight: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
        ring:      "ring-emerald-500",
        badge:     "bg-emerald-600 text-white",
        glass:     "bg-emerald-50/80 dark:bg-emerald-900/30 backdrop-blur-sm border border-emerald-100 dark:border-emerald-800/50",
    },
    purple: {
        bg:        "bg-purple-600 hover:bg-purple-700 active:bg-purple-800",
        text:      "text-purple-600 dark:text-purple-400",
        textMuted: "text-purple-700 dark:text-purple-300",
        border:    "border-purple-600 dark:border-purple-500",
        gradient:  "from-purple-50 to-white dark:from-gray-900 dark:to-gray-800",
        highlight: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
        ring:      "ring-purple-500",
        badge:     "bg-purple-600 text-white",
        glass:     "bg-purple-50/80 dark:bg-purple-900/30 backdrop-blur-sm border border-purple-100 dark:border-purple-800/50",
    },
    teal: {
        bg:        "bg-teal-600 hover:bg-teal-700 active:bg-teal-800",
        text:      "text-teal-600 dark:text-teal-400",
        textMuted: "text-teal-700 dark:text-teal-300",
        border:    "border-teal-600 dark:border-teal-500",
        gradient:  "from-teal-50 to-white dark:from-gray-900 dark:to-gray-800",
        highlight: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300",
        ring:      "ring-teal-500",
        badge:     "bg-teal-600 text-white",
        glass:     "bg-teal-50/80 dark:bg-teal-900/30 backdrop-blur-sm border border-teal-100 dark:border-teal-800/50",
    },
};

/**
 * Returns a predefined Tailwind class object for the given bank theme color.
 * Falls back to "blue" if the color is not in the palette.
 *
 * @param {string} themeColor - e.g. "blue", "indigo", "orange"
 * @returns {object} - { bg, text, textMuted, border, gradient, highlight, ring, badge, glass }
 */
export const getThemeClasses = (themeColor) => {
    return PALETTES[themeColor] || PALETTES.blue;
};

/**
 * Convenience hook-style function for components that have access to React context.
 * @param {object} bank - a bank object with a `themeColor` property
 */
export const getBankTheme = (bank) => {
    return getThemeClasses(bank?.themeColor || "blue");
};
