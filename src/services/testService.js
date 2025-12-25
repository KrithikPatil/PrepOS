/**
 * PrepOS Test Service
 * Test CRUD operations and submission handling
 * Connected to FastAPI backend
 */

import api from './api';

/**
 * Test Service - CAT Mock Test Operations
 */
export const testService = {
    /**
     * Get available tests for the student
     * @param {Object} filters - { type: 'full'|'sectional', section: 'VARC'|'DILR'|'QA' }
     */
    getAvailableTests: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.section) params.append('section', filters.section);

            const queryString = params.toString();
            const endpoint = queryString ? `/tests/?${queryString}` : '/tests/';

            const tests = await api.get(endpoint);
            return { success: true, tests };
        } catch (error) {
            console.error('Failed to get tests:', error);
            return { success: false, error: error.message, tests: [] };
        }
    },

    /**
     * Get test configuration and questions
     * @param {string} testId - Test ID
     */
    getTestById: async (testId) => {
        try {
            const data = await api.get(`/tests/${testId}`);
            return {
                success: true,
                test: data.test,
                questions: data.questions
            };
        } catch (error) {
            console.error('Failed to get test:', error);
            return { success: false, error: error.message, test: null };
        }
    },

    /**
     * Start a new test session
     * Creates a test attempt record
     * @param {string} testId - Test ID
     */
    startTest: async (testId) => {
        try {
            // For now, we'll just return the test data
            // TODO: Create attempt record on backend
            const data = await api.get(`/tests/${testId}`);
            return {
                success: true,
                attemptId: `attempt_${Date.now()}`,
                startedAt: new Date().toISOString(),
                test: data.test,
                questions: data.questions,
            };
        } catch (error) {
            console.error('Failed to start test:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Submit test answers
     * Triggers agent analysis pipeline
     * @param {string} testId - Test ID
     * @param {Array} responses - [{ questionId, answer, timeSpent }]
     * @param {number} totalTime - Total time in seconds
     */
    submitTest: async (testId, responses, totalTime) => {
        try {
            const result = await api.post(`/tests/${testId}/submit`, {
                responses,
                totalTime,
            });
            return {
                success: true,
                attemptId: result.attemptId,
                score: result.score,
                message: result.message,
                submittedAt: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Failed to submit test:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get test results and analysis
     * @param {string} attemptId - Attempt ID
     */
    getTestResults: async (attemptId) => {
        try {
            const result = await api.get(`/students/attempts/${attemptId}`);
            return { success: true, results: result };
        } catch (error) {
            console.error('Failed to get test results:', error);
            return { success: false, error: error.message, results: null };
        }
    },

    /**
     * Create AI-generated test
     * @param {Object} config - { name, sections, difficulty, questionCount, duration, focusTopics }
     */
    createAITest: async (config) => {
        try {
            const result = await api.post('/tests/generate', {
                name: config.name,
                sections: config.sections,
                difficulty: config.difficulty,
                question_count: config.questionCount,
                duration: config.duration,
                focus_topics: config.focusTopics || [],
            });
            return {
                success: true,
                testId: result.test_id,
                message: result.message,
            };
        } catch (error) {
            console.error('Failed to create AI test:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Format test data for frontend consumption
     * @param {Object} testData - { test, questions }
     */
    formatTestConfig: (testData) => {
        if (!testData || !testData.test) return null;

        const { test, questions } = testData;

        return {
            id: test.id,
            testName: test.name,
            duration: test.duration,
            totalMarks: test.totalMarks,
            questions: questions.map((q, index) => ({
                id: q.id,
                qno: index + 1,
                section: q.section,
                topic: q.topic,
                difficulty: q.difficulty,
                type: q.type,
                passage: q.passage,
                question: q.question,
                options: q.options,
                marks: 3,
                negativeMarks: q.type === 'TITA' ? 0 : 1,
            })),
            sections: groupQuestionsBySection(questions),
        };
    },
};

/**
 * Group questions by section for navigation
 */
const groupQuestionsBySection = (questions) => {
    const sections = {};
    const sectionColors = {
        'VARC': '#8b5cf6',
        'DILR': '#f59e0b',
        'QA': '#10b981',
    };

    questions.forEach((q, index) => {
        if (!sections[q.section]) {
            sections[q.section] = {
                name: q.section,
                questions: [],
                color: sectionColors[q.section] || '#6b7280',
            };
        }
        sections[q.section].questions.push(index);
    });

    return Object.values(sections);
};

export default testService;
