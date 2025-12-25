import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * TestModeContext
 * Manages the test-in-progress state to hide UI elements like sidebar
 */

const TestModeContext = createContext({
    isTestMode: false,
    enterTestMode: () => { },
    exitTestMode: () => { },
});

export function TestModeProvider({ children }) {
    const [isTestMode, setIsTestMode] = useState(false);

    const enterTestMode = useCallback(() => {
        setIsTestMode(true);
        document.body.classList.add('test-mode-active');
    }, []);

    const exitTestMode = useCallback(() => {
        setIsTestMode(false);
        document.body.classList.remove('test-mode-active');
    }, []);

    return (
        <TestModeContext.Provider value={{ isTestMode, enterTestMode, exitTestMode }}>
            {children}
        </TestModeContext.Provider>
    );
}

export function useTestMode() {
    const context = useContext(TestModeContext);
    if (!context) {
        throw new Error('useTestMode must be used within a TestModeProvider');
    }
    return context;
}

export default TestModeContext;
