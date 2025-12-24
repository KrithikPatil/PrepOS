import React from 'react';
import { NavLink } from 'react-router-dom';
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

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/test', label: 'Mock Test', icon: TestIcon },
    { path: '/analysis', label: 'Analysis', icon: AnalysisIcon },
    { path: '/agents', label: 'AI Agents', icon: AgentIcon },
    { path: '/roadmap', label: 'Roadmap', icon: RoadmapIcon },
];

/**
 * Sidebar Navigation Component
 * Premium dark mode design with active state indicators
 */
function Sidebar() {
    // TODO: Fetch user profile from /api/user/profile
    const userProfile = {
        name: 'Rahul Sharma',
        initials: 'RS',
        examType: 'JEE Advanced',
    };

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

            {/* User Profile */}
            <div className="sidebar__profile">
                <div className="sidebar__profile-card">
                    <div className="sidebar__avatar">{userProfile.initials}</div>
                    <div className="sidebar__profile-info">
                        <div className="sidebar__profile-name">{userProfile.name}</div>
                        <div className="sidebar__profile-exam">{userProfile.examType}</div>
                    </div>
                    <span className="sidebar__exam-badge">PRO</span>
                </div>
            </div>
        </nav>
    );
}

export default Sidebar;
