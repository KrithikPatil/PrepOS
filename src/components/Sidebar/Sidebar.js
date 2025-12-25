import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

// SVG Icons as components for cleaner code
const DashboardIcon = () => (
    <svg className="sidebar__nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);

const TestIcon = () => (
    <svg className="sidebar__nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
);

const AnalysisIcon = () => (
    <svg className="sidebar__nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
    </svg>
);

const AgentIcon = () => (
    <svg className="sidebar__nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
);

const RoadmapIcon = () => (
    <svg className="sidebar__nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-4 4 4 6-6" />
    </svg>
);

const ExamInfoIcon = () => (
    <svg className="sidebar__nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V4.5A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 01-2.5-2.5z" />
        <circle cx="12" cy="10" r="2" />
        <path d="M12 12v4" />
    </svg>
);

const HistoryIcon = () => (
    <svg className="sidebar__nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const LogoutIcon = () => (
    <svg className="sidebar__nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/know-cat', label: 'Know Your CAT', icon: ExamInfoIcon },
    { path: '/test', label: 'Mock Test', icon: TestIcon },
    { path: '/previous-tests', label: 'Previous Tests', icon: HistoryIcon },
    { path: '/analysis', label: 'Analysis', icon: AnalysisIcon },
    { path: '/agents', label: 'AI Agents', icon: AgentIcon },
    { path: '/roadmap', label: 'Roadmap', icon: RoadmapIcon },
];

/**
 * Sidebar Navigation Component
 * Premium dark mode design with active state indicators
 */
function Sidebar() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Get user display data
    const displayName = user?.name || 'Guest';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const subscription = user?.subscription || 'FREE';

    return (
        <nav className="sidebar">
            {/* Logo */}
            <div className="sidebar__logo">
                <div className="sidebar__logo-icon">P</div>
                <div className="sidebar__logo-text">
                    Prep<span>OS</span>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="sidebar__nav">
                <div className="sidebar__section">
                    <span className="sidebar__section-title">Main Menu</span>
                </div>

                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar__nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon />
                        {item.label}
                    </NavLink>
                ))}
            </div>

            {/* User Profile & Logout */}
            <div className="sidebar__profile">
                {isAuthenticated && (
                    <>
                        <div className="sidebar__profile-card">
                            <div className="sidebar__avatar">{initials}</div>
                            <div className="sidebar__profile-info">
                                <div className="sidebar__profile-name">{displayName}</div>
                                <div className="sidebar__profile-exam">CAT 2025</div>
                            </div>
                            <span className="sidebar__exam-badge">{subscription.toUpperCase()}</span>
                        </div>

                        {/* Logout Button */}
                        <button
                            className="sidebar__logout-btn"
                            onClick={handleLogout}
                        >
                            <LogoutIcon />
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Sidebar;
