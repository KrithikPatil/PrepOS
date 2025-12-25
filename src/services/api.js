/**
 * PrepOS API Service Layer
 * Base API client with authentication and error handling
 * Connected to FastAPI backend
 */

const API_URL = process.env.REACT_APP_API_URL || 'https://prepos-frontend.onrender.com/api';
const TOKEN_KEY = 'prepos_token';

/**
 * Get stored auth token
 */
const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Base API request handler with auth and error handling
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const token = getToken();

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            // Handle 401 - clear token and redirect to login
            if (response.status === 401) {
                localStorage.removeItem(TOKEN_KEY);
                // Optionally redirect to login
                // window.location.href = '/login';
            }

            throw new Error(data?.detail || data?.message || `API Error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

/**
 * HTTP method wrappers
 */
export const api = {
    get: (endpoint, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return apiRequest(url, { method: 'GET' });
    },

    post: (endpoint, data = {}) => {
        return apiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    put: (endpoint, data = {}) => {
        return apiRequest(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: (endpoint) => {
        return apiRequest(endpoint, { method: 'DELETE' });
    },
};

export default api;
