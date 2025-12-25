import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

/**
 * AuthCallback - Handles OAuth redirect and token processing
 * Redirects to dashboard after successful authentication
 */
function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, isLoading } = useAuth();
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setError('Authentication failed. Please try again.');
            setTimeout(() => navigate('/login'), 3000);
            return;
        }

        if (token) {
            // Token is handled by AuthContext's useEffect
            // Just wait for authentication to complete
            localStorage.setItem('prepos_token', token);
        }
    }, [searchParams, navigate]);

    // Redirect to dashboard once authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (error) {
        return (
            <div className="auth-page">
                <div className="auth-callback">
                    <div className="auth-callback__error">
                        <h2>Authentication Error</h2>
                        <p>{error}</p>
                        <p>Redirecting to login...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-callback">
                <div className="auth-callback__loading">
                    <div className="loading-spinner large"></div>
                    <h2>Signing you in...</h2>
                    <p>Please wait while we complete your authentication</p>
                </div>
            </div>
        </div>
    );
}

export default AuthCallback;
