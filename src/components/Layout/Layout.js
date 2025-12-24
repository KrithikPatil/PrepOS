import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css';

/**
 * Main Layout Component
 * Provides consistent structure with sidebar navigation
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to render
 */
function Layout({ children }) {
    return (
        <div className="layout">
            <aside className="layout__sidebar">
                <Sidebar />
            </aside>
            <main className="layout__main">
                <div className="layout__content">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default Layout;
