import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useFocusMode Hook
 * Implements fullscreen enforcement and anti-cheating monitoring for tests
 * 
 * Features:
 * - Auto-enter fullscreen on test start
 * - Detect tab switches, window blur, fullscreen exit
 * - 3-strike policy with auto-submit
 * - Violation logging with timestamps
 */

const MAX_VIOLATIONS = 3;

export function useFocusMode({ onAutoSubmit, enabled = true }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [violations, setViolations] = useState([]);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const violationCountRef = useRef(0);
    const isRetryingFullscreen = useRef(false);

    // Enter fullscreen mode
    const enterFullscreen = useCallback(async () => {
        try {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                await elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                await elem.msRequestFullscreen();
            }
            setIsFullscreen(true);
            return true;
        } catch (error) {
            console.warn('Fullscreen request failed:', error);
            return false;
        }
    }, []);

    // Exit fullscreen mode (with safety checks)
    const exitFullscreen = useCallback(() => {
        try {
            // Only attempt exit if we're actually in fullscreen
            const isCurrentlyFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement
            );

            if (!isCurrentlyFullscreen) {
                setIsFullscreen(false);
                return;
            }

            if (document.exitFullscreen && document.fullscreenElement) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen && document.webkitFullscreenElement) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen && document.msFullscreenElement) {
                document.msExitFullscreen();
            }
            setIsFullscreen(false);
        } catch (error) {
            // Silently handle - document may not be active
            console.debug('Fullscreen exit handled:', error.message);
            setIsFullscreen(false);
        }
    }, []);

    // Log violation and check for auto-submit
    const logViolation = useCallback((type, message) => {
        const violation = {
            type,
            message,
            timestamp: new Date().toISOString(),
            count: violationCountRef.current + 1
        };

        violationCountRef.current += 1;
        setViolations(prev => [...prev, violation]);

        const remaining = MAX_VIOLATIONS - violationCountRef.current;
        setWarningMessage(
            remaining > 0
                ? `Warning: ${message}. ${remaining} violation${remaining === 1 ? '' : 's'} remaining before auto-submit.`
                : 'Final warning exceeded. Test will be submitted.'
        );
        setShowWarning(true);

        // Auto-hide warning after 5 seconds
        setTimeout(() => setShowWarning(false), 5000);

        // Check if we need to auto-submit
        if (violationCountRef.current >= MAX_VIOLATIONS) {
            console.warn('Maximum violations reached. Auto-submitting test.');
            if (onAutoSubmit) {
                setTimeout(() => onAutoSubmit('max_violations'), 2000);
            }
        }

        return violation;
    }, [onAutoSubmit]);

    // Handle visibility change (tab switch)
    const handleVisibilityChange = useCallback(() => {
        if (!enabled) return;

        if (document.hidden) {
            logViolation('tab_switch', 'You switched to another tab');
        }
    }, [enabled, logViolation]);

    // Handle window blur (clicking outside browser)
    const handleWindowBlur = useCallback(() => {
        if (!enabled) return;

        // Small delay to avoid false positives from fullscreen prompts
        setTimeout(() => {
            if (document.hasFocus && !document.hasFocus()) {
                logViolation('window_blur', 'You clicked outside the browser window');
            }
        }, 100);
    }, [enabled, logViolation]);

    // Handle fullscreen change
    const handleFullscreenChange = useCallback(() => {
        if (!enabled) return;

        const isCurrentlyFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement
        );

        setIsFullscreen(isCurrentlyFullscreen);

        // If exited fullscreen during test, log violation
        if (!isCurrentlyFullscreen && violationCountRef.current < MAX_VIOLATIONS && !isRetryingFullscreen.current) {
            logViolation('fullscreen_exit', 'You exited fullscreen mode');

            // Try to re-enter fullscreen (only once per exit)
            isRetryingFullscreen.current = true;
            setTimeout(() => {
                enterFullscreen().finally(() => {
                    isRetryingFullscreen.current = false;
                });
            }, 2000);
        }
    }, [enabled, logViolation, enterFullscreen]);

    // Setup event listeners
    useEffect(() => {
        if (!enabled) return;

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        window.addEventListener('blur', handleWindowBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, [enabled, handleVisibilityChange, handleFullscreenChange, handleWindowBlur]);

    // Cleanup on unmount - use ref to avoid re-renders
    const isFullscreenRef = useRef(isFullscreen);
    isFullscreenRef.current = isFullscreen;

    useEffect(() => {
        return () => {
            if (isFullscreenRef.current) {
                exitFullscreen();
            }
        };
    }, []); // Empty deps - only run on unmount

    // Reset violations (for starting a new test)
    const resetViolations = useCallback(() => {
        violationCountRef.current = 0;
        setViolations([]);
        setShowWarning(false);
    }, []);

    return {
        // State
        isFullscreen,
        violations,
        violationCount: violationCountRef.current,
        remainingAttempts: MAX_VIOLATIONS - violationCountRef.current,
        showWarning,
        warningMessage,

        // Actions
        enterFullscreen,
        exitFullscreen,
        resetViolations,

        // Constants
        maxViolations: MAX_VIOLATIONS
    };
}

export default useFocusMode;
