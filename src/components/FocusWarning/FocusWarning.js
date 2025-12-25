import React from 'react';
import Icon from '../Icon/Icon';
import './FocusWarning.css';

/**
 * FocusWarning Component
 * Displays violation warnings during Focus Mode
 */
function FocusWarning({
    show,
    message,
    remainingAttempts,
    onDismiss
}) {
    if (!show) return null;

    const isLastWarning = remainingAttempts === 0;

    return (
        <div className={`focus-warning ${isLastWarning ? 'focus-warning--critical' : ''}`}>
            <div className="focus-warning__content">
                <div className="focus-warning__icon">
                    <Icon
                        name="alertTriangle"
                        size={24}
                        color={isLastWarning ? '#ef4444' : '#f59e0b'}
                    />
                </div>
                <div className="focus-warning__text">
                    <p className="focus-warning__message">{message}</p>
                    {remainingAttempts > 0 && (
                        <p className="focus-warning__attempts">
                            {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining
                        </p>
                    )}
                </div>
                <button
                    className="focus-warning__dismiss"
                    onClick={onDismiss}
                    aria-label="Dismiss warning"
                >
                    <Icon name="check" size={16} />
                </button>
            </div>
            <div className="focus-warning__progress" />
        </div>
    );
}

export default FocusWarning;
