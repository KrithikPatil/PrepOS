import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import { useTestMode } from '../../contexts/TestModeContext';
import './Layout.css';

/**
 * Main Layout Component
 * Provides consistent structure with sidebar navigation
 * Hides sidebar when in test mode for distraction-free testing
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to render
 */
function Layout({ children }) {
    const { isTestMode } = useTestMode();

    // In test mode, render only the content without sidebar
    if (isTestMode) {
        return (
            <div className="layout layout--test-mode">
                <main className="layout__main layout__main--fullwidth">
                    <div className="layout__content">
                        {children}
                    </div>
                </main>
            </div>
        );
    }

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
