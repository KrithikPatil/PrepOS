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
    examType: 'CAT', // CAT only
    targetYear: 2025,
    enrolledDate: '2024-06-15',
    subscription: 'free', // free | pro | premium
    avatar: null,
    stats: {
        testsCompleted: 24,
        averageScore: 72,
        studyHours: 156,
        currentStreak: 7,
    },
};

// ============================================
// Previous Tests History
// TODO: Fetch from GET /api/student/tests/history
// ============================================
export const mockPreviousTests = [
    {
        id: 'CAT-MOCK-001',
        name: 'CAT 2025 Full Mock #1',
        date: '2024-12-20',
        score: 87,
        totalMarks: 198,
        percentile: 92.5,
        sections: [
            { name: 'VARC', score: 32, total: 72, percentile: 94 },
            { name: 'DILR', score: 28, total: 60, percentile: 88 },
            { name: 'QA', score: 27, total: 66, percentile: 91 },
        ],
        duration: '1h 58m',
        aiTutorAvailable: true,
    },
    {
        id: 'CAT-MOCK-002',
        name: 'CAT 2025 Sectional - VARC',
        date: '2024-12-18',
        score: 54,
        totalMarks: 72,
        percentile: 89.2,
        sections: [{ name: 'VARC', score: 54, total: 72, percentile: 89.2 }],
        duration: '38m',
        aiTutorAvailable: true,
    },
    {
        id: 'CAT-MOCK-003',
        name: 'CAT 2025 Full Mock #2',
        date: '2024-12-15',
        score: 79,
        totalMarks: 198,
        percentile: 85.8,
        sections: [
            { name: 'VARC', score: 28, total: 72, percentile: 82 },
            { name: 'DILR', score: 24, total: 60, percentile: 79 },
            { name: 'QA', score: 27, total: 66, percentile: 88 },
        ],
        duration: '2h 0m',
        aiTutorAvailable: true,
    },
];

// ============================================
// Pricing Plans (Freemium Model)
// TODO: Fetch from GET /api/pricing
// ============================================
export const mockPricingPlans = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        period: 'forever',
        features: [
            '3 Full Mock Tests',
            '5 Sectional Tests',
            'Basic Performance Analytics',
            'Access to Know Your CAT',
            'Limited AI Tutor (5 questions/day)',
        ],
        limitations: [
            'No AI Agent Analysis',
            'No Personalized Roadmap',
            'No Custom Question Generation',
        ],
        cta: 'Get Started',
        popular: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 499,
        period: 'month',
        originalPrice: 999,
        features: [
            'Unlimited Full Mock Tests',
            'Unlimited Sectional Tests',
            'Complete AI Agent Analysis',
            'Unlimited AI Tutor Access',
            'Personalized Study Roadmap',
            'Weakness-based Question Generation',
            'Detailed Mistake Classification',
            'Priority Support',
        ],
        limitations: [],
        cta: 'Start Pro Trial',
        popular: true,
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 2999,
        period: '6 months',
        originalPrice: 5999,
        features: [
            'Everything in Pro',
            '1-on-1 Mentorship Sessions',
            'Interview Preparation Kit',
            'GD/PI Workshops Access',
            'College Prediction Tool',
            'Lifetime Access to Current Batch',
            'Early Access to New Features',
        ],
        limitations: [],
        cta: 'Go Premium',
        popular: false,
    },
];

// ============================================
// Strength & Weakness Tags
// TODO: Fetch from GET /api/student/analytics/tags
// ============================================
export const mockStrengthWeaknessTags = {
    strengths: [
        { id: 1, topic: 'Reading Comprehension', score: 92, section: 'VARC' },
        { id: 2, topic: 'Para Jumbles', score: 88, section: 'VARC' },
        { id: 3, topic: 'Arithmetic', score: 85, section: 'QA' },
        { id: 4, topic: 'Logical Reasoning', score: 84, section: 'DILR' },
    ],
    weaknesses: [
        { id: 5, topic: 'Data Interpretation', score: 45, section: 'DILR' },
        { id: 6, topic: 'Probability & Combinatorics', score: 52, section: 'QA' },
        { id: 7, topic: 'Verbal Ability', score: 55, section: 'VARC' },
        { id: 8, topic: 'Algebra', score: 58, section: 'QA' },
    ],
};

// ============================================
// Mock Test Questions - CAT Format
// TODO: Fetch from GET /api/test/:testId/questions
// ============================================
export const mockTestQuestions = [
    // VARC Section - Reading Comprehension
    {
        id: 'Q001',
        qno: 1,
        section: 'VARC',
        topic: 'Reading Comprehension',
        difficulty: 'medium',
        passage: `The concept of "nudge" in behavioral economics refers to any aspect of the choice architecture that alters people's behavior in a predictable way without forbidding any options or significantly changing their economic incentives. To count as a mere nudge, the intervention must be easy and cheap to avoid. Nudges are not mandates. Putting fruit at eye level counts as a nudge. Banning junk food does not.

In the private sector, nudges are everywhere. Businesses have long known that the way choices are presented can dramatically influence decisions. Supermarkets place high-margin items at eye level; restaurants list profitable dishes prominently; and websites use defaults to encourage certain user behaviors.

Government nudges, however, raise different considerations. When a private company nudges, consumers can switch to competitors who nudge less or differently. When the government nudges, the compulsory nature of state power adds a layer of concern. Critics argue that government nudges are paternalistic, substituting the state's judgment for individual preferences.

Proponents counter that nudges preserve freedom of choice while helping people make decisions that serve their own interests. Given that choice architecture is inevitable—someone must decide how options are presented—why not design choices to help rather than harm?`,
        question: 'According to the passage, what distinguishes a "nudge" from a mandate?',
        options: [
            { key: 'A', text: 'Nudges are used only by governments, while mandates are private sector tools' },
            { key: 'B', text: 'Nudges do not eliminate options and are easy to avoid, unlike mandates' },
            { key: 'C', text: 'Nudges require economic incentives to work effectively' },
            { key: 'D', text: 'Mandates are more effective at changing behavior than nudges' },
        ],
        correctAnswer: 'B',
        explanation: 'The passage clearly states: "To count as a mere nudge, the intervention must be easy and cheap to avoid. Nudges are not mandates. Putting fruit at eye level counts as a nudge. Banning junk food does not."',
        avgTimeSeconds: 120,
        marks: 3,
        negativeMarks: 1,
    },
    {
        id: 'Q002',
        qno: 2,
        section: 'VARC',
        topic: 'Reading Comprehension',
        difficulty: 'hard',
        passage: null, // Uses same passage as Q001
        question: 'The author\'s primary purpose in discussing government nudges is to:',
        options: [
            { key: 'A', text: 'Advocate for increased government use of behavioral interventions' },
            { key: 'B', text: 'Present both criticisms and defenses of state-sponsored nudging' },
            { key: 'C', text: 'Argue that private sector nudges are more ethical than government ones' },
            { key: 'D', text: 'Explain why nudges are ineffective in public policy' },
        ],
        correctAnswer: 'B',
        explanation: 'The passage presents both sides: critics argue nudges are "paternalistic," while proponents say they "preserve freedom of choice while helping people."',
        avgTimeSeconds: 90,
        marks: 3,
        negativeMarks: 1,
    },
    {
        id: 'Q003',
        qno: 3,
        section: 'VARC',
        topic: 'Para Jumbles',
        difficulty: 'medium',
        question: 'Arrange the following sentences to form a coherent paragraph:\n\nA. However, the relationship between coffee and health is more nuanced than headlines suggest.\nB. Studies show that moderate coffee consumption is associated with reduced risk of several diseases.\nC. Coffee has been alternatively demonized and celebrated for its health effects.\nD. The key lies in understanding dose, individual variation, and preparation methods.',
        options: [
            { key: 'A', text: 'CABD' },
            { key: 'B', text: 'CBAD' },
            { key: 'C', text: 'BACD' },
            { key: 'D', text: 'BCAD' },
        ],
        correctAnswer: 'A',
        explanation: 'C introduces the topic (coffee health debate), A transitions with "However," B provides evidence, and D concludes with the key insight.',
        avgTimeSeconds: 90,
        marks: 3,
        negativeMarks: 0, // TITA-style, no negative
    },
    // DILR Section
    {
        id: 'Q004',
        qno: 4,
        section: 'DILR',
        topic: 'Data Interpretation',
        difficulty: 'medium',
        passage: `A company has five divisions: A, B, C, D, and E. The total revenue of the company in 2023 was ₹500 crores. Division A contributed 25%, Division B contributed 20%, Division C contributed 18%, Division D contributed 22%, and Division E contributed the rest. In 2024, total revenue grew by 10%, with each division's percentage contribution remaining the same.`,
        question: 'What was the revenue of Division E in 2024 (in crores)?',
        options: [
            { key: 'A', text: '75' },
            { key: 'B', text: '82.5' },
            { key: 'C', text: '85' },
            { key: 'D', text: '77.5' },
        ],
        correctAnswer: 'B',
        explanation: 'Division E = 100 - 25 - 20 - 18 - 22 = 15%. In 2024, total = 500 × 1.1 = 550 crores. Division E = 15% of 550 = 82.5 crores.',
        avgTimeSeconds: 120,
        marks: 3,
        negativeMarks: 1,
    },
    {
        id: 'Q005',
        qno: 5,
        section: 'DILR',
        topic: 'Logical Reasoning',
        difficulty: 'hard',
        passage: `Six friends - P, Q, R, S, T, and U - are sitting around a circular table facing the center. P sits second to the left of Q. R sits opposite to P. S is not an immediate neighbor of P or Q. T sits to the immediate right of R.`,
        question: 'Who sits to the immediate left of S?',
        options: [
            { key: 'A', text: 'P' },
            { key: 'B', text: 'Q' },
            { key: 'C', text: 'T' },
            { key: 'D', text: 'U' },
        ],
        correctAnswer: 'C',
        explanation: 'Arrangement: P-T-R-S-U-Q (clockwise). T is to the immediate left of S.',
        avgTimeSeconds: 150,
        marks: 3,
        negativeMarks: 1,
    },
    // QA Section
    {
        id: 'Q006',
        qno: 6,
        section: 'QA',
        topic: 'Arithmetic',
        difficulty: 'easy',
        question: 'A merchant marks his goods 40% above the cost price and allows a discount of 20%. What is his profit percentage?',
        options: [
            { key: 'A', text: '12%' },
            { key: 'B', text: '20%' },
            { key: 'C', text: '15%' },
            { key: 'D', text: '8%' },
        ],
        correctAnswer: 'A',
        explanation: 'Let CP = 100. MP = 140. SP = 140 × 0.8 = 112. Profit = 12%.',
        avgTimeSeconds: 60,
        marks: 3,
        negativeMarks: 1,
    },
    {
        id: 'Q007',
        qno: 7,
        section: 'QA',
        topic: 'Algebra',
        difficulty: 'medium',
        question: 'If x + 1/x = 5, find the value of x³ + 1/x³.',
        options: [
            { key: 'A', text: '110' },
            { key: 'B', text: '125' },
            { key: 'C', text: '100' },
            { key: 'D', text: '115' },
        ],
        correctAnswer: 'A',
        explanation: 'x² + 1/x² = 25 - 2 = 23. x³ + 1/x³ = (x + 1/x)(x² - 1 + 1/x²) = 5 × (23 - 1) = 5 × 22 = 110.',
        avgTimeSeconds: 90,
        marks: 3,
        negativeMarks: 1,
    },
    {
        id: 'Q008',
        qno: 8,
        section: 'QA',
        topic: 'Number System',
        difficulty: 'hard',
        question: 'What is the remainder when 7^100 is divided by 5?',
        isTITA: true,
        options: null,
        correctAnswer: '1',
        explanation: 'Powers of 7 mod 5: 7¹=2, 7²=4, 7³=3, 7⁴=1, then cycle repeats. 100 = 4×25, so 7^100 ≡ 1 (mod 5).',
        avgTimeSeconds: 120,
        marks: 3,
        negativeMarks: 0, // TITA
    },
];

// ============================================
// Test Configuration - CAT Format
// TODO: Fetch from GET /api/test/:testId/config
// ============================================
export const mockTestConfig = {
    testId: 'CAT-MOCK-001',
    testName: 'CAT 2025 Full Mock Test #1',
    duration: 120, // minutes (CAT is 2 hours)
    totalQuestions: 66,
    totalMarks: 198, // 66 questions × 3 marks
    sections: [
        { name: 'VARC', questionCount: 24, marks: 72, time: 40 },
        { name: 'DILR', questionCount: 20, marks: 60, time: 40 },
        { name: 'QA', questionCount: 22, marks: 66, time: 40 },
    ],
    instructions: [
        '+3 marks for each correct answer',
        '-1 mark for wrong MCQ answers',
        'No negative marking for TITA (Type In The Answer)',
        'You cannot switch between sections',
        'On-screen calculator is available for QA section only',
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
            status: 'completed',
            icon: 'robot',
            color: '#6366f1',
            output: {
                generatedQuestions: 5,
                targetTopics: ['Data Interpretation', 'Probability & Combinatorics'],
                message: 'Generated 5 personalized practice questions targeting your weak areas.',
                questions: [
                    {
                        id: 'GEN-001',
                        topic: 'Data Interpretation',
                        difficulty: 'hard',
                        question: 'A company\'s revenue increased by 20% in Q1, decreased by 10% in Q2, and increased by 15% in Q3. What is the net percentage change from the start?',
                        options: ['A. 24.2%', 'B. 25%', 'C. 24.8%', 'D. 23.8%'],
                        correctAnswer: 'A',
                        explanation: '1.20 × 0.90 × 1.15 = 1.242, so 24.2% increase',
                    },
                    {
                        id: 'GEN-002',
                        topic: 'Data Interpretation',
                        difficulty: 'medium',
                        question: 'If the ratio of boys to girls in a class is 3:2, and 10 more girls join making the ratio 3:3, find the original number of students.',
                        options: ['A. 40', 'B. 50', 'C. 60', 'D. 45'],
                        correctAnswer: 'B',
                        explanation: '3x + 2x = total, 2x + 10 = 3x → x = 10, total = 50',
                    },
                    {
                        id: 'GEN-003',
                        topic: 'Probability',
                        difficulty: 'hard',
                        question: 'In how many ways can 5 people sit around a circular table if two specific people must sit together?',
                        options: ['A. 12', 'B. 24', 'C. 48', 'D. 6'],
                        correctAnswer: 'A',
                        explanation: 'Treat pair as one unit: (4-1)! × 2! = 6 × 2 = 12',
                    },
                    {
                        id: 'GEN-004',
                        topic: 'Probability',
                        difficulty: 'medium',
                        question: 'A bag contains 4 red, 3 blue, and 2 green balls. Two balls are drawn. What is the probability both are the same color?',
                        options: ['A. 5/18', 'B. 4/18', 'C. 1/4', 'D. 7/36'],
                        correctAnswer: 'A',
                        explanation: 'P = (4C2 + 3C2 + 2C2)/9C2 = (6+3+1)/36 = 10/36 = 5/18',
                    },
                    {
                        id: 'GEN-005',
                        topic: 'Data Interpretation',
                        difficulty: 'medium',
                        question: 'Market share of Company A rose from 25% to 30% while total market size grew by 20%. By what percentage did Company A\'s sales grow?',
                        options: ['A. 44%', 'B. 40%', 'C. 36%', 'D. 50%'],
                        correctAnswer: 'A',
                        explanation: 'New sales = 0.30 × 1.20 = 0.36m vs 0.25m. Growth = (0.36-0.25)/0.25 = 44%',
                    },
                ],
            },
        },
        {
            id: 'detective',
            name: 'Detective Agent',
            description: 'Classifies mistakes by analyzing time and accuracy patterns',
            status: 'completed',
            status: 'completed',
            icon: 'search',
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
            status: 'processing',
            icon: 'book',
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
            status: 'idle',
            icon: 'target',
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
// CAT Exam Configuration
// ============================================
export const examTypes = {
    CAT: {
        name: 'CAT',
        fullName: 'Common Admission Test',
        sections: [
            {
                id: 'varc',
                name: 'VARC',
                fullName: 'Verbal Ability & Reading Comprehension',
                questions: 24,
                duration: 40, // minutes
                topics: ['Reading Comprehension', 'Para Jumbles', 'Para Summary', 'Odd Sentence Out', 'Sentence Completion'],
            },
            {
                id: 'dilr',
                name: 'DILR',
                fullName: 'Data Interpretation & Logical Reasoning',
                questions: 20,
                duration: 40,
                topics: ['Data Interpretation', 'Logical Reasoning', 'Puzzles', 'Arrangements', 'Games & Tournaments'],
            },
            {
                id: 'qa',
                name: 'QA',
                fullName: 'Quantitative Aptitude',
                questions: 22,
                duration: 40,
                topics: ['Arithmetic', 'Algebra', 'Geometry', 'Number System', 'Modern Math'],
            },
        ],
        totalQuestions: 66,
        totalDuration: 120, // minutes
        color: '#6366f1',
        icon: 'cat',
    },
};

// CAT Section Colors
export const sectionColors = {
    VARC: '#6366f1', // Indigo
    DILR: '#f59e0b', // Amber
    QA: '#10b981',   // Emerald
};
