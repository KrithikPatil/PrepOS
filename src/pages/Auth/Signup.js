import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/Icon/Icon';
import './Auth.css';

/**
 * Signup Page
 * Premium registration UI with form validation
 */
function Signup() {
    const navigate = useNavigate();
    const { signup, loginWithGoogle, isLoading } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        const result = await signup(email, password, name);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Signup failed');
        }
    };

    const handleGoogleSignup = async () => {
        setError('');
        const result = await loginWithGoogle();
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Google signup failed');
        }
    };

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
                            Start Your CAT Journey Today
                        </h1>
                        <p className="auth-branding__subtitle">
                            Join thousands of aspirants preparing smarter with
                            AI-powered analytics and personalized learning paths.
                        </p>
                        <div className="auth-stats">
                            <div className="auth-stat">
                                <span className="auth-stat__value">10K+</span>
                                <span className="auth-stat__label">Active Students</span>
                            </div>
                            <div className="auth-stat">
                                <span className="auth-stat__value">500+</span>
                                <span className="auth-stat__label">Mock Tests</span>
                            </div>
                            <div className="auth-stat">
                                <span className="auth-stat__value">95%</span>
                                <span className="auth-stat__label">Success Rate</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Signup Form */}
                <div className="auth-form-panel">
                    <div className="auth-form-container">
                        <h2 className="auth-form__title">Create Account</h2>
                        <p className="auth-form__subtitle">
                            Begin your personalized CAT preparation
                        </p>

                        {error && (
                            <div className="auth-error">
                                <Icon name="alertTriangle" size={16} />
                                {error}
                            </div>
                        )}

                        {/* Google OAuth Button */}
                        <button
                            type="button"
                            className="auth-google-btn"
                            onClick={handleGoogleSignup}
                            disabled={isLoading}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="auth-divider">
                            <span>or</span>
                        </div>

                        {/* Signup Form */}
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="auth-input-group">
                                <label>Full Name</label>
                                <div className="auth-input-wrapper">
                                    <Icon name="user" size={18} />
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="auth-input-group">
                                <label>Email</label>
                                <div className="auth-input-wrapper">
                                    <Icon name="bell" size={18} />
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="auth-input-group">
                                <label>Password</label>
                                <div className="auth-input-wrapper">
                                    <Icon name="shield" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="auth-toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <Icon name={showPassword ? 'minimize' : 'maximize'} size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="auth-input-group">
                                <label>Confirm Password</label>
                                <div className="auth-input-wrapper">
                                    <Icon name="check" size={18} />
                                    <input
                                        type="password"
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="auth-submit-btn btn-shine"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </form>

                        <p className="auth-switch">
                            Already have an account? <Link to="/login">Sign in</Link>
                        </p>

                        <p className="auth-terms">
                            By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
