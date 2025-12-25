import React from 'react';

/**
 * PrepOS Icon Component Library
 * Custom premium SVG icons with consistent styling
 * 
 * Usage: <Icon name="clipboard" size={24} color="currentColor" />
 */

const icons = {
    // Dashboard Stats Icons
    clipboard: (
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    ),
    chart: (
        <>
            <path d="M18 20V10" />
            <path d="M12 20V4" />
            <path d="M6 20v-6" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
        </>
    ),
    flame: (
        <path d="M12 2c.5 2.5 2 4.5 2 7a4 4 0 11-8 0c0-2.5 1.5-4.5 2-7 1.5 1 2.5 2 4 0z" />
    ),
    streak: (
        <>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </>
    ),

    // Navigation & Actions
    target: (
        <>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </>
    ),
    crosshair: (
        <>
            <circle cx="12" cy="12" r="10" />
            <path d="M22 12h-4M6 12H2M12 6V2M12 22v-4" />
        </>
    ),
    trophy: (
        <>
            <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0012 0V2z" />
        </>
    ),
    arrowUp: (
        <path d="M12 19V5M5 12l7-7 7 7" />
    ),

    // Analysis Icons
    analytics: (
        <>
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
        </>
    ),
    search: (
        <>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
        </>
    ),
    book: (
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V4.5A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 01-2.5-2.5z" />
    ),
    lightning: (
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    ),
    timer: (
        <>
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2 2" />
            <path d="M5 3L2 6M22 6l-3-3M12 2v2" />
        </>
    ),
    list: (
        <>
            <path d="M8 6h13M8 12h13M8 18h13" />
            <path d="M3 6h.01M3 12h.01M3 18h.01" />
        </>
    ),

    // Agent & AI Icons
    robot: (
        <>
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="3" />
            <path d="M12 8v3" />
            <path d="M8 16h.01M16 16h.01" />
        </>
    ),
    map: (
        <>
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <path d="M9 3v15M15 6v15" />
        </>
    ),

    // Test Interface Icons
    star: (
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    ),
    starOutline: (
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" fill="none" />
    ),
    warning: (
        <>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
        </>
    ),
    check: (
        <path d="M20 6L9 17l-5-5" />
    ),
    checkCircle: (
        <>
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
        </>
    ),

    // Navigation Icons
    dashboard: (
        <>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </>
    ),
    test: (
        <>
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </>
    ),
    agents: (
        <>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </>
    ),
    roadmap: (
        <>
            <path d="M3 3v18h18" />
            <path d="M7 16l4-4 4 4 6-6" />
        </>
    ),

    // Exam Type Icons
    jee: (
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    ),
    gate: (
        <>
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </>
    ),
    neet: (
        <>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </>
    ),

    // Action Icons
    arrowRight: (
        <path d="M5 12h14M12 5l7 7-7 7" />
    ),
    arrowLeft: (
        <path d="M19 12H5M12 19l-7-7 7-7" />
    ),
    calendar: (
        <>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
        </>
    ),
    refresh: (
        <>
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </>
    ),
    user: (
        <>
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </>
    ),
    cat: (
        <>
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
        </>
    ),
    calculator: (
        <>
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path d="M8 6h8M8 10h8M8 14h2M8 18h2M14 14h2M14 18h2" />
        </>
    ),
    hourglass: (
        <>
            <path d="M5 22h14" />
            <path d="M5 2h14" />
            <path d="M17 22v-4.172a2 2 0 00-.586-1.414L12 12l-4.414 4.414A2 2 0 007 17.828V22" />
            <path d="M7 2v4.172a2 2 0 00.586 1.414L12 12l4.414-4.414A2 2 0 0017 6.172V2" />
        </>
    ),

    // Speed Indicators
    fast: (
        <>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </>
    ),
    slow: (
        <>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l3 3" />
        </>
    ),
    normal: (
        <path d="M20 6L9 17l-5-5" />
    ),

    // Fullscreen & Focus Mode
    maximize: (
        <>
            <path d="M8 3H5a2 2 0 00-2 2v3" />
            <path d="M21 8V5a2 2 0 00-2-2h-3" />
            <path d="M3 16v3a2 2 0 002 2h3" />
            <path d="M16 21h3a2 2 0 002-2v-3" />
        </>
    ),
    minimize: (
        <>
            <path d="M8 3v3a2 2 0 01-2 2H3" />
            <path d="M21 8h-3a2 2 0 01-2-2V3" />
            <path d="M3 16h3a2 2 0 012 2v3" />
            <path d="M16 21v-3a2 2 0 012-2h3" />
        </>
    ),
    alertTriangle: (
        <>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
        </>
    ),
    shield: (
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    ),
};

function Icon({
    name,
    size = 24,
    color = 'currentColor',
    strokeWidth = 2,
    className = '',
    ...props
}) {
    const icon = icons[name];

    if (!icon) {
        console.warn(`Icon "${name}" not found in PrepOS icon library`);
        return null;
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`icon icon-${name} ${className}`}
            {...props}
        >
            {icon}
        </svg>
    );
}

// Export individual icons for direct use
export { icons };
export default Icon;
