/**
 * PrepOS Question Service
 * API calls for question generation
 */

import api from './api';

/**
 * Question Service - Question Generation Operations
 */
export const questionService = {
    /**
     * Generate personalized practice questions using AI
     * @param {Object} config - { sections, topics, difficulty, count, use_ai }
     */
    generateQuestions: async (config = {}) => {
        try {
            console.log('📤 Sending request to /questions/generate:', config);

            const result = await api.post('/questions/generate', {
                sections: config.sections || ['QA'],
                topics: config.topics || [],
                difficulty: config.difficulty || 'medium',
                count: config.count || 5,
                use_ai: config.useAI !== false
            });

            console.log('📥 API Response received:', result);
            console.log('   - success:', result.success);
            console.log('   - source:', result.source);
            console.log('   - count:', result.count);
            console.log('   - questions array:', result.questions);

            if (result.questions && result.questions.length > 0) {
                console.log('   - First question:', result.questions[0]);
            }

            return {
                success: true,
                source: result.source,
                count: result.count,
                questions: result.questions || [],
                message: result.message || 'Questions generated successfully',
                targetTopics: result.targetTopics || []
            };
        } catch (error) {
            console.error('❌ Failed to generate questions:', error);
            return { success: false, error: error.message, questions: [] };
        }
    },

    /**
     * Get sample questions (no AI, immediate response)
     * @param {string} section - VARC, DILR, or QA
     * @param {number} count - Number of questions
     */
    getSampleQuestions: async (section = null, count = 5) => {
        try {
            const params = { count };
            if (section) params.section = section;

            const result = await api.get('/questions/sample', params);
            return {
                success: true,
                source: 'sample',
                questions: result.questions || []
            };
        } catch (error) {
            console.error('Failed to get sample questions:', error);
            return { success: false, error: error.message, questions: [] };
        }
    },

    /**
     * Get available topics for each section
     */
    getTopics: async () => {
        try {
            const topics = await api.get('/questions/topics');
            return { success: true, topics };
        } catch (error) {
            console.error('Failed to get topics:', error);
            return {
                success: false,
                topics: {
                    VARC: ['Reading Comprehension', 'Para Jumbles'],
                    DILR: ['Data Interpretation', 'Logical Reasoning'],
                    QA: ['Arithmetic', 'Algebra', 'Geometry']
                }
            };
        }
    }
};

export default questionService;
