/**
 * Agent Service
 * Handles AI agent analysis operations
 * Connected to FastAPI backend
 */

import api from './api';

/**
 * Agent Service - AI Analysis Operations
 */
export const agentService = {
    /**
     * Start AI analysis for a test attempt
     * @param {string} attemptId - Test attempt ID
     * @returns {Promise} - { jobId, status, message }
     */
    startAnalysis: async (attemptId) => {
        try {
            const result = await api.post('/agents/analyze', { attemptId });
            return {
                success: true,
                jobId: result.jobId,
                status: result.status,
                message: result.message,
            };
        } catch (error) {
            console.error('Failed to start analysis:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get analysis job status
     * @param {string} jobId - Analysis job ID
     * @returns {Promise} - { status, agents: { architect, detective, tutor, strategist } }
     */
    getAnalysisStatus: async (jobId) => {
        try {
            const result = await api.get(`/agents/status/${jobId}`);
            return {
                success: true,
                jobId: result.jobId,
                status: result.status,
                agents: result.agents,
            };
        } catch (error) {
            console.error('Failed to get analysis status:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Poll for analysis completion
     * @param {string} jobId - Analysis job ID
     * @param {Function} onProgress - Callback for progress updates
     * @param {number} maxAttempts - Maximum poll attempts (default 60 = 5 min)
     * @param {number} interval - Poll interval in ms (default 5000 = 5s)
     */
    pollAnalysis: async (jobId, onProgress, maxAttempts = 60, interval = 5000) => {
        let attempts = 0;

        return new Promise((resolve, reject) => {
            const poll = async () => {
                attempts++;

                const result = await agentService.getAnalysisStatus(jobId);

                if (!result.success) {
                    reject(new Error(result.error));
                    return;
                }

                // Callback with progress
                if (onProgress) {
                    onProgress(result);
                }

                // Check if complete
                if (result.status === 'completed') {
                    resolve(result);
                    return;
                }

                // Check if error
                if (result.status === 'error') {
                    reject(new Error('Analysis failed'));
                    return;
                }

                // Check if max attempts reached
                if (attempts >= maxAttempts) {
                    reject(new Error('Analysis timeout'));
                    return;
                }

                // Continue polling
                setTimeout(poll, interval);
            };

            poll();
        });
    },

    /**
     * Format agent status for UI display
     * @param {Object} agents - { architect, detective, tutor, strategist }
     */
    formatAgentStatus: (agents) => {
        const statusMap = {
            pending: { label: 'Waiting', color: '#6b7280', icon: 'clock' },
            processing: { label: 'Analyzing', color: '#f59e0b', icon: 'refresh' },
            completed: { label: 'Complete', color: '#10b981', icon: 'check' },
            error: { label: 'Error', color: '#ef4444', icon: 'x' },
        };

        const agentNames = {
            architect: 'Architect',
            detective: 'Detective',
            tutor: 'Tutor',
            strategist: 'Strategist',
        };

        return Object.entries(agents).map(([key, agent]) => ({
            id: key,
            name: agentNames[key],
            status: agent.status,
            ...statusMap[agent.status],
            output: agent.output,
        }));
    },

    /**
     * Get generated questions from Architect agent
     * @param {Object} architectOutput - Architect agent output
     */
    getGeneratedQuestions: (architectOutput) => {
        if (!architectOutput || !architectOutput.questions) {
            return [];
        }
        return architectOutput.questions;
    },

    /**
     * Get mistake insights from Detective agent
     * @param {Object} detectiveOutput - Detective agent output
     */
    getMistakeInsights: (detectiveOutput) => {
        if (!detectiveOutput) {
            return { insights: [], patterns: {}, weakTopics: [] };
        }
        return {
            insights: detectiveOutput.insights || [],
            patterns: detectiveOutput.patterns || {},
            weakTopics: detectiveOutput.weakTopics || [],
            topFixes: detectiveOutput.topPriorityFixes || [],
        };
    },

    /**
     * Get explanations from Tutor agent
     * @param {Object} tutorOutput - Tutor agent output
     */
    getTutorExplanations: (tutorOutput) => {
        if (!tutorOutput || !tutorOutput.explanations) {
            return [];
        }
        return tutorOutput.explanations;
    },

    /**
     * Get roadmap from Strategist agent
     * @param {Object} strategistOutput - Strategist agent output
     */
    getRoadmap: (strategistOutput) => {
        if (!strategistOutput) {
            return null;
        }
        return {
            focusAreas: strategistOutput.focusAreas || [],
            weeklyPlan: strategistOutput.weeklyPlan || [],
            milestones: strategistOutput.milestones || [],
            daysUntilExam: strategistOutput.daysUntilExam,
            message: strategistOutput.message,
        };
    },
};

export default agentService;
