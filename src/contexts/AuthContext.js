import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * AuthContext
 * Manages authentication state - NO MOCK DATA
 * Requires real authentication via Google OAuth
 */

const AuthContext = createContext({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    loginWithGoogle: async () => { },
    logout: async () => { },
    devLogin: async () => { },
});

const TOKEN_KEY = 'prepos_token';
const USER_KEY = 'prepOS_user';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Check for OAuth callback params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            handleOAuthCallback(token);
        }
    }, []);

    const checkAuth = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem(TOKEN_KEY);

            // NO TOKEN = NOT LOGGED IN (no mock data fallback)
            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            // Verify token with backend
            try {
                const userData = await api.get('/auth/me');
                setUser(userData);
                localStorage.setItem(USER_KEY, JSON.stringify(userData));
            } catch (err) {
                // Token invalid - clear everything
                console.warn('Token invalid, clearing auth');
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                setUser(null);
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            setError(err.message);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthCallback = async (token) => {
        setIsLoading(true);
        setError(null);

        try {
            localStorage.setItem(TOKEN_KEY, token);

            const userData = await api.get('/auth/me');
            setUser(userData);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));

            // Clean up URL params
            window.history.replaceState({}, document.title, window.location.pathname);

            return { success: true, user: userData };
        } catch (err) {
            console.error('OAuth callback failed:', err);
            localStorage.removeItem(TOKEN_KEY);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = useCallback(() => {
        const API_URL = process.env.REACT_APP_API_URL || 'https://prepos.onrender.com/api';
        window.location.href = `${API_URL}/auth/google`;
    }, []);

    const logout = useCallback(async () => {
        try {
            try {
                await api.post('/auth/logout');
            } catch (err) {
                // Ignore logout API errors
            }

            setUser(null);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);

            return { success: true };
        } catch (err) {
            console.error('Logout failed:', err);
            return { success: false, error: err.message };
        }
    }, []);

    // DEV LOGIN - For testing without Google OAuth credentials
    const devLogin = useCallback(async (userData = {}) => {
        setIsLoading(true);
        try {
            // Call backend dev login endpoint
            const result = await api.post('/auth/dev-login', {
                email: userData.email || 'dev@prepos.io',
                name: userData.name || 'Dev User',
            });

            if (result.token) {
                localStorage.setItem(TOKEN_KEY, result.token);
                localStorage.setItem(USER_KEY, JSON.stringify(result.user));
                setUser(result.user);
                return { success: true, user: result.user };
            }

            throw new Error('No token received');
        } catch (err) {
            console.error('Dev login failed:', err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                error,
                loginWithGoogle,
                logout,
                devLogin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
