import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/Icon/Icon';
import './Auth.css';

/**
 * Login Page
 * Authentication with Google OAuth and Dev Login for testing
 */
function Login() {
    const navigate = useNavigate();
    const { loginWithGoogle, devLogin, isLoading, error: authError } = useAuth();

    const [error, setError] = useState('');
    const [isDevLoggingIn, setIsDevLoggingIn] = useState(false);

    const handleGoogleLogin = () => {
        setError('');
        // This redirects to Google - no result to check
        loginWithGoogle();
    };

    const handleDevLogin = async () => {
        setError('');
        setIsDevLoggingIn(true);

        try {
            const result = await devLogin({
                email: 'dev@prepos.io',
                name: 'CAT Aspirant'
            });

            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error || 'Dev login failed');
            }
        } catch (err) {
            setError(err.message || 'Dev login failed');
        } finally {
            setIsDevLoggingIn(false);
        }
    };

    const displayError = error || authError;

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Panel - Branding */}
                <div className="auth-branding">
                    <div className="auth-branding__content">
                        <div className="auth-logo">
                            <Icon name="target" size={48} />
                            <span>PrepOS</span>
                        </div>
                        <h1 className="auth-branding__title">
                            Master CAT with AI-Powered Learning
                        </h1>
                        <p className="auth-branding__subtitle">
                            Personalized preparation for VARC, DILR, and Quant sections
                            with intelligent analysis and adaptive roadmaps.
                        </p>
                        <div className="auth-features">
                            <div className="auth-feature">
                                <Icon name="agents" size={24} />
                                <span>AI Agent Analysis</span>
                            </div>
                            <div className="auth-feature">
                                <Icon name="chart" size={24} />
                                <span>Performance Tracking</span>
                            </div>
                            <div className="auth-feature">
                                <Icon name="roadmap" size={24} />
                                <span>Smart Roadmaps</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="auth-form-panel">
                    <div className="auth-form-container">
                        <h2 className="auth-form__title">Welcome to PrepOS</h2>
                        <p className="auth-form__subtitle">
                            Sign in to start your CAT preparation journey
                        </p>

                        {displayError && (
                            <div className="auth-error">
                                <Icon name="alertTriangle" size={16} />
                                {displayError}
                            </div>
                        )}

                        {/* Google OAuth Button */}
                        <button
                            type="button"
                            className="auth-google-btn"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                        </button>

                        <div className="auth-divider">
                            <span>or</span>
                        </div>

                        {/* Dev Login Button - For testing without OAuth credentials */}
                        <button
                            type="button"
                            className="auth-dev-btn"
                            onClick={handleDevLogin}
                            disabled={isLoading || isDevLoggingIn}
                        >
                            <Icon name="zap" size={20} />
                            {isDevLoggingIn ? 'Signing in...' : 'Quick Dev Login'}
                        </button>

                        <p className="auth-dev-note">
                            Dev login creates a test account with sample CAT data.
                            Use Google login for production.
                        </p>

                        <p className="auth-switch">
                            New to PrepOS? <Link to="/signup">Create account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
