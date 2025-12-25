/**
 * Student Service
 * Handles student profile, attempts, and roadmap operations
 * Connected to FastAPI backend
 */

import api from './api';

/**
 * Student Service - Profile and History Operations
 */
export const studentService = {
    /**
     * Get student profile with performance data
     */
    getProfile: async () => {
        try {
            const profile = await api.get('/students/profile');
            return { success: true, profile };
        } catch (error) {
            console.error('Failed to get profile:', error);
            return { success: false, error: error.message, profile: null };
        }
    },

    /**
     * Get test attempt history
     * @param {number} limit - Max number of attempts to return
     */
    getAttempts: async (limit = 20) => {
        try {
            const attempts = await api.get('/students/attempts');
            return { success: true, attempts };
        } catch (error) {
            console.error('Failed to get attempts:', error);
            return { success: false, error: error.message, attempts: [] };
        }
    },

    /**
     * Get detailed attempt with AI analysis
     * @param {string} attemptId - Attempt ID
     */
    getAttemptDetail: async (attemptId) => {
        try {
            const attempt = await api.get(`/students/attempts/${attemptId}`);
            return { success: true, attempt };
        } catch (error) {
            console.error('Failed to get attempt detail:', error);
            return { success: false, error: error.message, attempt: null };
        }
    },

    /**
     * Get analysis for a specific attempt
     * @param {string} attemptId - Attempt ID
     */
    getAttemptAnalysis: async (attemptId) => {
        try {
            const analysis = await api.get(`/students/attempts/${attemptId}/analysis`);
            return { success: true, analysis };
        } catch (error) {
            console.error('Failed to get analysis:', error);
            return { success: false, error: error.message, analysis: null };
        }
    },

    /**
     * Get personalized roadmap
     */
    getRoadmap: async () => {
        try {
            const roadmap = await api.get('/students/roadmap');
            return { success: true, roadmap };
        } catch (error) {
            console.error('Failed to get roadmap:', error);
            return { success: false, error: error.message, roadmap: null };
        }
    },

    /**
     * Update performance metrics
     * @param {Object} performance - { sectionWise, topicWise, weakTopics }
     */
    updatePerformance: async (performance) => {
        try {
            await api.put('/students/performance', performance);
            return { success: true };
        } catch (error) {
            console.error('Failed to update performance:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Format attempts for Previous Tests page
     * @param {Array} attempts - Raw attempts from API
     */
    formatPreviousTests: (attempts) => {
        return attempts.map(attempt => ({
            id: attempt.id,
            name: attempt.testName || 'CAT Mock Test',
            date: new Date(attempt.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }),
            score: attempt.score,
            totalMarks: attempt.totalMarks,
            percentage: Math.round((attempt.score / attempt.totalMarks) * 100),
            percentile: attempt.percentile || calculateMockPercentile(attempt.score, attempt.totalMarks),
            duration: formatDuration(attempt.duration),
            sections: attempt.sections || [],
            hasAIAnalysis: !!attempt.aiAnalysis,
        }));
    },

    /**
     * Format profile for Dashboard
     * @param {Object} profile - Raw profile from API
     */
    formatDashboardProfile: (profile) => {
        if (!profile) return null;

        return {
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar,
            subscription: profile.subscription,
            stats: {
                testsCompleted: profile.stats?.testsCompleted || 0,
                averageScore: profile.stats?.averageScore || 0,
                studyHours: profile.stats?.studyHours || 0,
                currentStreak: profile.stats?.currentStreak || 0,
            },
            performance: profile.performance || {
                sectionWise: { VARC: 0, DILR: 0, QA: 0 },
                weakTopics: [],
            },
        };
    },
};

/**
 * Calculate mock percentile based on score (placeholder until real data)
 */
const calculateMockPercentile = (score, total) => {
    const percentage = (score / total) * 100;
    // Rough percentile estimation
    if (percentage >= 95) return 99;
    if (percentage >= 85) return 95;
    if (percentage >= 75) return 85;
    if (percentage >= 65) return 70;
    if (percentage >= 50) return 50;
    return 30;
};

/**
 * Format duration in minutes
 */
const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
};

export default studentService;
