/**
 * PrepOS Mock Data Service
 * 
 * This file contains mock data structured exactly like real API responses.
 * Replace with actual API calls when backend is ready.
 * 
 * TODO: Connect to real backend APIs
 * TODO: Implement WebSocket connections for real-time agent updates
 * TODO: Add proper error handling and retry logic
 */

// ============================================
// Student Profile Data
// TODO: Fetch from GET /api/student/profile
// ============================================
export const mockStudentProfile = {
    id: 'STU-001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    examType: 'JEE', // JEE | GATE | NEET
    examSubType: 'Advanced',
    targetYear: 2025,
    enrolledDate: '2024-06-15',
    subscription: 'pro',
    avatar: null,
    stats: {
        testsCompleted: 24,
        averageScore: 72,
        studyHours: 156,
        currentStreak: 7,
    },
};

// ============================================
// Strength & Weakness Tags
// TODO: Fetch from GET /api/student/analytics/tags
// ============================================
export const mockStrengthWeaknessTags = {
    strengths: [
        { id: 1, topic: 'Mechanics', score: 92, subject: 'Physics' },
        { id: 2, topic: 'Organic Chemistry', score: 88, subject: 'Chemistry' },
        { id: 3, topic: 'Calculus', score: 85, subject: 'Mathematics' },
        { id: 4, topic: 'Thermodynamics', score: 84, subject: 'Physics' },
    ],
    weaknesses: [
        { id: 5, topic: 'Electrochemistry', score: 45, subject: 'Chemistry' },
        { id: 6, topic: 'Probability', score: 52, subject: 'Mathematics' },
        { id: 7, topic: 'Modern Physics', score: 55, subject: 'Physics' },
        { id: 8, topic: 'Coordinate Geometry', score: 58, subject: 'Mathematics' },
    ],
};

// ============================================
// Mock Test Questions
// TODO: Fetch from GET /api/test/:testId/questions
// ============================================
export const mockTestQuestions = [
    {
        id: 'Q001',
        qno: 1,
        subject: 'Physics',
        topic: 'Mechanics',
        difficulty: 'medium',
        question: 'A ball is thrown vertically upward with velocity 20 m/s from the top of a building of height 25 m. What is the maximum height reached by the ball from the ground?',
        options: [
            { key: 'A', text: '45.4 m' },
            { key: 'B', text: '42.5 m' },
            { key: 'C', text: '35.2 m' },
            { key: 'D', text: '50.8 m' },
        ],
        correctAnswer: 'A',
        explanation: 'Using v² = u² - 2gh, at max height v=0, so h = u²/2g = 400/20 = 20.4m. Total height = 25 + 20.4 = 45.4m',
        avgTimeSeconds: 90,
        marks: 4,
        negativeMarks: 1,
    },
    {
        id: 'Q002',
        qno: 2,
        subject: 'Chemistry',
        topic: 'Electrochemistry',
        difficulty: 'hard',
        question: 'The standard electrode potential of Cu²⁺/Cu and Cu⁺/Cu are 0.34V and 0.52V respectively. What is the standard electrode potential of Cu²⁺/Cu⁺?',
        options: [
            { key: 'A', text: '0.18 V' },
            { key: 'B', text: '0.16 V' },
            { key: 'C', text: '0.86 V' },
            { key: 'D', text: '-0.18 V' },
        ],
        correctAnswer: 'B',
        explanation: 'Using Gibbs energy calculations: ΔG° = -nFE°. For the half-cell reaction, E° = 0.16V',
        avgTimeSeconds: 120,
        marks: 4,
        negativeMarks: 1,
    },
    {
        id: 'Q003',
        qno: 3,
        subject: 'Mathematics',
        topic: 'Calculus',
        difficulty: 'medium',
        question: 'If f(x) = x³ - 3x² + 2x + 1, find the value of f\'(2).',
        options: [
            { key: 'A', text: '2' },
            { key: 'B', text: '4' },
            { key: 'C', text: '0' },
            { key: 'D', text: '6' },
        ],
        correctAnswer: 'A',
        explanation: 'f\'(x) = 3x² - 6x + 2. At x=2: f\'(2) = 12 - 12 + 2 = 2',
        avgTimeSeconds: 60,
        marks: 4,
        negativeMarks: 1,
    },
    {
        id: 'Q004',
        qno: 4,
        subject: 'Physics',
        topic: 'Modern Physics',
        difficulty: 'hard',
        question: 'The de Broglie wavelength of an electron accelerated through a potential difference of 100V is approximately:',
        options: [
            { key: 'A', text: '0.123 nm' },
            { key: 'B', text: '1.23 nm' },
            { key: 'C', text: '0.0123 nm' },
            { key: 'D', text: '12.3 nm' },
        ],
        correctAnswer: 'A',
        explanation: 'λ = h/√(2meV) = 1.226/√V nm = 1.226/10 ≈ 0.123 nm',
        avgTimeSeconds: 90,
        marks: 4,
        negativeMarks: 1,
    },
    {
        id: 'Q005',
        qno: 5,
        subject: 'Chemistry',
        topic: 'Organic Chemistry',
        difficulty: 'easy',
        question: 'Which of the following compounds shows optical isomerism?',
        options: [
            { key: 'A', text: '2-butanol' },
            { key: 'B', text: '1-butanol' },
            { key: 'C', text: '2-propanol' },
            { key: 'D', text: 'methanol' },
        ],
        correctAnswer: 'A',
        explanation: '2-butanol has a chiral carbon (C2) with 4 different groups attached, showing optical isomerism.',
        avgTimeSeconds: 45,
        marks: 4,
        negativeMarks: 1,
    },
    {
        id: 'Q006',
        qno: 6,
        subject: 'Mathematics',
        topic: 'Probability',
        difficulty: 'hard',
        question: 'Two cards are drawn randomly from a pack of 52 cards. What is the probability that both cards are aces?',
        options: [
            { key: 'A', text: '1/221' },
            { key: 'B', text: '1/169' },
            { key: 'C', text: '2/221' },
            { key: 'D', text: '1/13' },
        ],
        correctAnswer: 'A',
        explanation: 'P = (4/52) × (3/51) = 12/2652 = 1/221',
        avgTimeSeconds: 75,
        marks: 4,
        negativeMarks: 1,
    },
    {
        id: 'Q007',
        qno: 7,
        subject: 'Physics',
        topic: 'Thermodynamics',
        difficulty: 'medium',
        question: 'In an adiabatic process, which quantity remains constant?',
        options: [
            { key: 'A', text: 'Temperature' },
            { key: 'B', text: 'Pressure' },
            { key: 'C', text: 'Heat' },
            { key: 'D', text: 'Volume' },
        ],
        correctAnswer: 'C',
        explanation: 'In an adiabatic process, no heat is exchanged with surroundings (Q = 0).',
        avgTimeSeconds: 30,
        marks: 4,
        negativeMarks: 1,
    },
    {
        id: 'Q008',
        qno: 8,
        subject: 'Chemistry',
        topic: 'Inorganic Chemistry',
        difficulty: 'medium',
        question: 'Which of the following has the highest ionic character?',
        options: [
            { key: 'A', text: 'LiF' },
            { key: 'B', text: 'LiCl' },
            { key: 'C', text: 'LiBr' },
            { key: 'D', text: 'LiI' },
        ],
        correctAnswer: 'A',
        explanation: 'Ionic character depends on electronegativity difference. F is most electronegative, so LiF has highest ionic character.',
        avgTimeSeconds: 45,
        marks: 4,
        negativeMarks: 1,
    },
    {
        id: 'Q009',
        qno: 9,
        subject: 'Mathematics',
        topic: 'Coordinate Geometry',
        difficulty: 'hard',
        question: 'Find the equation of the circle passing through (0,0), (2,0), and (0,4).',
        options: [
            { key: 'A', text: 'x² + y² - 2x - 4y = 0' },
            { key: 'B', text: 'x² + y² + 2x + 4y = 0' },
            { key: 'C', text: 'x² + y² - 2x + 4y = 0' },
            { key: 'D', text: 'x² + y² + 2x - 4y = 0' },
        ],
        correctAnswer: 'A',
        explanation: 'Substituting points in general equation x² + y² + 2gx + 2fy + c = 0 and solving gives the answer.',
        avgTimeSeconds: 120,
        marks: 4,
        negativeMarks: 1,
    },
    {
        id: 'Q010',
        qno: 10,
        subject: 'Physics',
        topic: 'Waves',
        difficulty: 'easy',
        question: 'The speed of sound in air at 20°C is approximately:',
        options: [
            { key: 'A', text: '343 m/s' },
            { key: 'B', text: '300 m/s' },
            { key: 'C', text: '400 m/s' },
            { key: 'D', text: '250 m/s' },
        ],
        correctAnswer: 'A',
        explanation: 'Speed of sound in air at 20°C is approximately 343 m/s.',
        avgTimeSeconds: 20,
        marks: 4,
        negativeMarks: 1,
    },
];

// ============================================
// Test Configuration
// TODO: Fetch from GET /api/test/:testId/config
// ============================================
export const mockTestConfig = {
    testId: 'TEST-001',
    testName: 'JEE Advanced Mock Test #8',
    duration: 180, // minutes
    totalQuestions: 10,
    totalMarks: 40,
    sections: [
        { name: 'Physics', questionCount: 4, marks: 16 },
        { name: 'Chemistry', questionCount: 3, marks: 12 },
        { name: 'Mathematics', questionCount: 3, marks: 12 },
    ],
    instructions: [
        'Each question carries 4 marks for correct answer',
        '-1 mark for each wrong answer',
        'No marks for unattempted questions',
        'Calculator is not allowed',
    ],
};

// ============================================
// Post-Test Analysis Results
// TODO: Fetch from POST /api/test/:testId/submit
// TODO: Inject Detective Agent analysis here
// ============================================
export const mockAnalysisResults = {
    testId: 'TEST-001',
    submittedAt: '2024-12-24T15:30:00Z',
    score: {
        obtained: 24,
        total: 40,
        percentage: 60,
        rank: 1245,
        percentile: 85.2,
    },
    summary: {
        correct: 6,
        incorrect: 3,
        unattempted: 1,
        timeTaken: 145, // minutes
    },
    subjectWise: [
        { subject: 'Physics', correct: 3, incorrect: 1, unattempted: 0, score: 11, total: 16 },
        { subject: 'Chemistry', correct: 2, incorrect: 1, unattempted: 0, score: 7, total: 12 },
        { subject: 'Mathematics', correct: 1, incorrect: 1, unattempted: 1, score: 3, total: 12 },
    ],
    // Detective Agent Classification
    mistakeClassification: [
        {
            questionId: 'Q002',
            type: 'conceptual_gap',
            topic: 'Electrochemistry',
            severity: 'high',
            reasoning: 'Time spent: 3.5 min (above average). Changed answer twice. Indicates weak understanding of electrode potential calculations.',
            recommendation: 'Review Nernst equation and standard electrode potential concepts.',
        },
        {
            questionId: 'Q006',
            type: 'silly_mistake',
            topic: 'Probability',
            severity: 'low',
            reasoning: 'Time spent: 1 min (quick). Correct approach visible in scratch. Arithmetic error in final calculation.',
            recommendation: 'Double-check calculations before marking final answer.',
        },
        {
            questionId: 'Q009',
            type: 'time_management',
            topic: 'Coordinate Geometry',
            severity: 'medium',
            reasoning: 'Time spent: 4 min. Correct steps but ran out of time for this section. Should have flagged for later.',
            recommendation: 'Practice time allocation. Flag complex questions and return if time permits.',
        },
    ],
    perQuestionAnalysis: [
        { qno: 1, status: 'correct', timeSpent: 75, avgTime: 90, answer: 'A', correct: 'A' },
        { qno: 2, status: 'incorrect', timeSpent: 210, avgTime: 120, answer: 'C', correct: 'B' },
        { qno: 3, status: 'correct', timeSpent: 45, avgTime: 60, answer: 'A', correct: 'A' },
        { qno: 4, status: 'correct', timeSpent: 80, avgTime: 90, answer: 'A', correct: 'A' },
        { qno: 5, status: 'correct', timeSpent: 35, avgTime: 45, answer: 'A', correct: 'A' },
        { qno: 6, status: 'incorrect', timeSpent: 60, avgTime: 75, answer: 'B', correct: 'A' },
        { qno: 7, status: 'correct', timeSpent: 25, avgTime: 30, answer: 'C', correct: 'C' },
        { qno: 8, status: 'correct', timeSpent: 40, avgTime: 45, answer: 'A', correct: 'A' },
        { qno: 9, status: 'incorrect', timeSpent: 240, avgTime: 120, answer: 'D', correct: 'A' },
        { qno: 10, status: 'unattempted', timeSpent: 0, avgTime: 20, answer: null, correct: 'A' },
    ],
};

// ============================================
// AI Agents Status
// TODO: Stream agent responses via WebSocket
// ============================================
export const mockAgentStatus = {
    agents: [
        {
            id: 'architect',
            name: 'Architect Agent',
            description: 'Generates mutated questions to strengthen weak concepts',
            status: 'completed', // idle | processing | completed
            icon: '🏗️',
            color: '#6366f1',
            output: {
                generatedQuestions: 5,
                targetTopics: ['Electrochemistry', 'Probability'],
                message: 'Generated 5 personalized practice questions targeting your weak areas.',
            },
        },
        {
            id: 'detective',
            name: 'Detective Agent',
            description: 'Classifies mistakes by analyzing time and accuracy patterns',
            status: 'completed',
            icon: '🔍',
            color: '#ef4444',
            output: {
                classified: 3,
                patterns: {
                    conceptual: 1,
                    silly: 1,
                    timeManagement: 1,
                },
                message: 'Identified 3 mistakes: 1 conceptual gap, 1 silly error, 1 time management issue.',
            },
        },
        {
            id: 'tutor',
            name: 'Socratic Tutor',
            description: 'Provides intuition-based explanations with guided questions',
            status: 'processing',
            icon: '📚',
            color: '#10b981',
            output: {
                lessonsReady: 2,
                inProgress: 1,
                message: 'Preparing intuitive explanations for Electrochemistry concepts...',
            },
        },
        {
            id: 'strategist',
            name: 'Strategist Agent',
            description: 'Creates dynamic study roadmap based on performance',
            status: 'idle',
            icon: '🎯',
            color: '#f59e0b',
            output: null,
        },
    ],
    overallProgress: 65,
    estimatedCompletion: '2 min',
};

// ============================================
// Personalized Roadmap
// TODO: Fetch from GET /api/student/roadmap
// ============================================
export const mockRoadmap = {
    generatedAt: '2024-12-24T16:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    targetExam: 'JEE Advanced 2025',
    daysUntilExam: 120,
    focusAreas: ['Electrochemistry', 'Probability', 'Coordinate Geometry'],
    weeklyPlan: [
        {
            week: 1,
            theme: 'Foundation Strengthening',
            startDate: '2024-12-25',
            endDate: '2024-12-31',
            tasks: [
                {
                    id: 'T001',
                    day: 'Day 1',
                    title: 'Electrochemistry Basics',
                    type: 'concept_review',
                    duration: 90,
                    priority: 'high',
                    status: 'pending',
                    subtasks: [
                        'Review electrode potential concepts',
                        'Practice Nernst equation problems',
                        'Solve 10 numerical problems',
                    ],
                },
                {
                    id: 'T002',
                    day: 'Day 2',
                    title: 'Electrochemistry Applications',
                    type: 'practice',
                    duration: 120,
                    priority: 'high',
                    status: 'pending',
                    subtasks: [
                        'Electrochemical cells analysis',
                        'Conductivity problems',
                        'Mini mock: 5 questions',
                    ],
                },
                {
                    id: 'T003',
                    day: 'Day 3',
                    title: 'Probability Fundamentals',
                    type: 'concept_review',
                    duration: 90,
                    priority: 'medium',
                    status: 'pending',
                    subtasks: [
                        'Bayes theorem review',
                        'Conditional probability',
                        'Solve 15 problems',
                    ],
                },
                {
                    id: 'T004',
                    day: 'Day 4',
                    title: 'Probability Advanced',
                    type: 'practice',
                    duration: 120,
                    priority: 'medium',
                    status: 'pending',
                    subtasks: [
                        'Random variables',
                        'Probability distributions',
                        'JEE-style problems',
                    ],
                },
                {
                    id: 'T005',
                    day: 'Day 5',
                    title: 'Coordinate Geometry',
                    type: 'concept_review',
                    duration: 90,
                    priority: 'medium',
                    status: 'pending',
                    subtasks: [
                        'Circle equations',
                        'Parabola and ellipse',
                        'Locus problems',
                    ],
                },
                {
                    id: 'T006',
                    day: 'Day 6',
                    title: 'Mixed Practice Session',
                    type: 'practice',
                    duration: 150,
                    priority: 'high',
                    status: 'pending',
                    subtasks: [
                        'Mini mock: All weak topics',
                        'Time-bound practice',
                        'Error analysis',
                    ],
                },
                {
                    id: 'T007',
                    day: 'Day 7',
                    title: 'Review & Assessment',
                    type: 'assessment',
                    duration: 180,
                    priority: 'high',
                    status: 'pending',
                    subtasks: [
                        'Full-length mock test',
                        'AI-powered analysis',
                        'Roadmap adjustment',
                    ],
                },
            ],
        },
    ],
    milestones: [
        { id: 'M1', title: 'Master Electrochemistry', target: '85% accuracy', deadline: '2024-12-31', progress: 45 },
        { id: 'M2', title: 'Probability Proficiency', target: '80% accuracy', deadline: '2025-01-07', progress: 52 },
        { id: 'M3', title: 'Coordinate Geo Excellence', target: '75% accuracy', deadline: '2025-01-14', progress: 58 },
    ],
};

// ============================================
// Available Tests
// TODO: Fetch from GET /api/tests/available
// ============================================
export const mockAvailableTests = [
    {
        id: 'TEST-001',
        name: 'JEE Advanced Mock Test #8',
        type: 'full',
        duration: 180,
        questions: 75,
        difficulty: 'hard',
        isRecommended: true,
        focusAreas: ['Weak topics', 'Time management'],
    },
    {
        id: 'TEST-002',
        name: 'Physics Chapter Test - Mechanics',
        type: 'chapter',
        duration: 45,
        questions: 20,
        difficulty: 'medium',
        isRecommended: false,
        focusAreas: ['Mechanics'],
    },
    {
        id: 'TEST-003',
        name: 'Chemistry Quick Test - Organic',
        type: 'quick',
        duration: 30,
        questions: 15,
        difficulty: 'easy',
        isRecommended: false,
        focusAreas: ['Organic Chemistry'],
    },
];

// ============================================
// Exam Type Configurations
// ============================================
export const examTypes = {
    JEE: {
        name: 'JEE',
        fullName: 'Joint Entrance Examination',
        variants: ['Mains', 'Advanced'],
        subjects: ['Physics', 'Chemistry', 'Mathematics'],
        color: '#6366f1',
        icon: '⚡',
    },
    GATE: {
        name: 'GATE',
        fullName: 'Graduate Aptitude Test in Engineering',
        variants: ['CS', 'ECE', 'ME', 'CE', 'EE'],
        subjects: ['Engineering Mathematics', 'Core Subject', 'General Aptitude'],
        color: '#22d3ee',
        icon: '🎓',
    },
    NEET: {
        name: 'NEET',
        fullName: 'National Eligibility cum Entrance Test',
        variants: ['UG'],
        subjects: ['Physics', 'Chemistry', 'Biology'],
        color: '#10b981',
        icon: '🏥',
    },
};
