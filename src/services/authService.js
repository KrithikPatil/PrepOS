/**
 * Auth Service
 * Handles authentication with Google OAuth and JWT tokens
 */

import api from './api';

const TOKEN_KEY = 'prepos_token';
const USER_KEY = 'prepOS_user';

/**
 * Get stored token
 */
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store token after OAuth callback
 */
export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Clear authentication
 */
export const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

/**
 * Check if authenticated
 */
export const isAuthenticated = () => {
    return !!getToken();
};

/**
 * Get Google OAuth login URL
 * Redirects user to Google for authentication
 */
export const getGoogleLoginUrl = () => {
    const API_URL = process.env.REACT_APP_API_URL || 'https://prepos.onrender.com/api';
    return `${API_URL}/auth/google`;
};

/**
 * Handle OAuth callback - extract token from URL
 */
export const handleOAuthCallback = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
        throw new Error(error);
    }

    if (token) {
        setToken(token);
        return token;
    }

    throw new Error('No token received');
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
    try {
        const user = await api.get('/auth/me');
        // Store user data
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
    } catch (error) {
        console.error('Failed to get current user:', error);
        throw error;
    }
};

/**
 * Logout user
 */
export const logout = async () => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout API error:', error);
    } finally {
        clearAuth();
    }
};

/**
 * Unlock subscription plan (for development/testing)
 */
export const unlockPlan = async (plan) => {
    try {
        const result = await api.post(`/auth/unlock/${plan}`);
        // Update stored user
        const user = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
        user.subscription = plan;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return result;
    } catch (error) {
        console.error('Unlock plan error:', error);
        throw error;
    }
};

/**
 * Get stored user from localStorage (for quick access)
 */
export const getStoredUser = () => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
};

export default {
    getToken,
    setToken,
    clearAuth,
    isAuthenticated,
    getGoogleLoginUrl,
    handleOAuthCallback,
    getCurrentUser,
    logout,
    unlockPlan,
    getStoredUser,
};
