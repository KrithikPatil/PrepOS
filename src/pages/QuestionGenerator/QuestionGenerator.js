import React, { useState, useEffect } from 'react';
import { questionService } from '../../services';
import Icon from '../../components/Icon/Icon';
import './QuestionGenerator.css';

/**
 * Question Generator Page
 * Generate personalized practice questions using AI Architect Agent
 */
function QuestionGenerator() {
    // Configuration state
    const [selectedSections, setSelectedSections] = useState(['QA']);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [difficulty, setDifficulty] = useState('medium');
    const [questionCount, setQuestionCount] = useState(5);
    const [useAI, setUseAI] = useState(true);

    // Data state
    const [availableTopics, setAvailableTopics] = useState({});
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [source, setSource] = useState(null);

    // UI state
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [showAnswers, setShowAnswers] = useState({});

    // Fetch available topics on mount
    useEffect(() => {
        const fetchTopics = async () => {
            const result = await questionService.getTopics();
            if (result.topics) {
                setAvailableTopics(result.topics);
            }
        };
        fetchTopics();
    }, []);

    const sections = [
        { id: 'VARC', name: 'VARC', fullName: 'Verbal Ability & Reading Comprehension', color: '#8b5cf6' },
        { id: 'DILR', name: 'DILR', fullName: 'Data Interpretation & Logical Reasoning', color: '#f59e0b' },
        { id: 'QA', name: 'QA', fullName: 'Quantitative Aptitude', color: '#10b981' }
    ];

    const difficulties = [
        { id: 'easy', name: 'Easy', description: 'Build confidence' },
        { id: 'medium', name: 'Medium', description: 'CAT-level' },
        { id: 'hard', name: 'Hard', description: 'Challenge yourself' }
    ];

    const handleSectionToggle = (sectionId) => {
        setSelectedSections(prev => {
            if (prev.includes(sectionId)) {
                return prev.filter(s => s !== sectionId);
            }
            return [...prev, sectionId];
        });
        // Reset topics when section changes
        setSelectedTopics([]);
    };

    const handleTopicToggle = (topic) => {
        setSelectedTopics(prev => {
            if (prev.includes(topic)) {
                return prev.filter(t => t !== topic);
            }
            return [...prev, topic];
        });
    };

    const handleGenerate = async () => {
        if (selectedSections.length === 0) {
            setError('Please select at least one section');
            return;
        }

        setLoading(true);
        setError(null);
        setQuestions([]);

        console.log('🚀 Starting question generation...');
        const result = await questionService.generateQuestions({
            sections: selectedSections,
            topics: selectedTopics,
            difficulty: difficulty,
            count: questionCount,
            useAI: useAI
        });

        console.log('📦 Result from service:', result);
        setLoading(false);

        if (result.success) {
            console.log('✅ Setting questions:', result.questions);
            console.log('   Questions length:', result.questions?.length);
            setQuestions(result.questions);
            setSource(result.source);
        } else {
            console.error('❌ Generation failed:', result.error);
            setError(result.error || 'Failed to generate questions');
        }
    };

    const toggleAnswer = (questionId) => {
        setShowAnswers(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    const getAvailableTopicsForSections = () => {
        const topics = [];
        selectedSections.forEach(section => {
            if (availableTopics[section]) {
                topics.push(...availableTopics[section]);
            }
        });
        return [...new Set(topics)];
    };

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'easy': return '#10b981';
            case 'medium': return '#f59e0b';
            case 'hard': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getSectionColor = (section) => {
        const sec = sections.find(s => s.id === section);
        return sec ? sec.color : '#6b7280';
    };

    return (
        <div className="question-generator">
            <header className="qg-header">
                <div className="qg-header__content">
                    <h1>
                        <Icon name="brain" size={32} />
                        Question Generator
                    </h1>
                    <p>Generate personalized practice questions using AI</p>
                </div>
            </header>

            <div className="qg-layout">
                {/* Configuration Panel */}
                <aside className="qg-config">
                    <div className="config-section">
                        <h3>Select Sections</h3>
                        <div className="section-buttons">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    className={`section-btn ${selectedSections.includes(section.id) ? 'active' : ''}`}
                                    style={{ '--section-color': section.color }}
                                    onClick={() => handleSectionToggle(section.id)}
                                >
                                    <span className="section-name">{section.name}</span>
                                    <span className="section-full">{section.fullName}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="config-section">
                        <h3>Focus Topics (Optional)</h3>
                        <div className="topic-chips">
                            {getAvailableTopicsForSections().map(topic => (
                                <button
                                    key={topic}
                                    className={`topic-chip ${selectedTopics.includes(topic) ? 'active' : ''}`}
                                    onClick={() => handleTopicToggle(topic)}
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                        {selectedSections.length === 0 && (
                            <p className="hint">Select a section to see topics</p>
                        )}
                    </div>

                    <div className="config-section">
                        <h3>Difficulty Level</h3>
                        <div className="difficulty-options">
                            {difficulties.map(diff => (
                                <button
                                    key={diff.id}
                                    className={`difficulty-btn ${difficulty === diff.id ? 'active' : ''}`}
                                    onClick={() => setDifficulty(diff.id)}
                                >
                                    <span className="diff-name">{diff.name}</span>
                                    <span className="diff-desc">{diff.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="config-section">
                        <h3>Number of Questions</h3>
                        <div className="count-selector">
                            {[3, 5, 10].map(count => (
                                <button
                                    key={count}
                                    className={`count-btn ${questionCount === count ? 'active' : ''}`}
                                    onClick={() => setQuestionCount(count)}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="config-section">
                        <label className="ai-toggle">
                            <input
                                type="checkbox"
                                checked={useAI}
                                onChange={(e) => setUseAI(e.target.checked)}
                            />
                            <span className="toggle-label">
                                <Icon name="robot" size={16} />
                                Use AI Generation
                            </span>
                            <span className="toggle-hint">
                                {useAI ? 'Personalized questions' : 'Sample questions only'}
                            </span>
                        </label>
                    </div>

                    <button
                        className="generate-btn"
                        onClick={handleGenerate}
                        disabled={loading || selectedSections.length === 0}
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Icon name="zap" size={20} />
                                Generate Questions
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="error-message">
                            <Icon name="alertTriangle" size={16} />
                            {error}
                        </div>
                    )}
                </aside>

                {/* Questions Panel */}
                <main className="qg-questions">
                    {questions.length === 0 && !loading && (
                        <div className="empty-state">
                            <Icon name="clipboard" size={64} />
                            <h2>No Questions Yet</h2>
                            <p>Configure your preferences and click Generate to create practice questions</p>
                        </div>
                    )}

                    {loading && (
                        <div className="loading-state">
                            <div className="agent-animation">
                                <div className="agent-icon">
                                    <Icon name="brain" size={48} />
                                </div>
                                <div className="agent-pulse"></div>
                            </div>
                            <h2>Architect Agent Working...</h2>
                            <p>Generating personalized questions based on your preferences</p>
                        </div>
                    )}

                    {questions.length > 0 && (
                        <>
                            <div className="questions-header">
                                <h2>Generated Questions</h2>
                                <span className="source-badge">
                                    {source === 'ai_generated' ? '🤖 AI Generated' : '📚 Sample Data'}
                                </span>
                            </div>

                            <div className="questions-list">
                                {questions.map((q, index) => (
                                    <div key={q.id || index} className="question-card">
                                        <div className="question-header">
                                            <span className="q-number">Q{index + 1}</span>
                                            <div className="q-badges">
                                                <span
                                                    className="badge section-badge"
                                                    style={{ backgroundColor: getSectionColor(q.section) }}
                                                >
                                                    {q.section}
                                                </span>
                                                <span className="badge topic-badge">{q.topic}</span>
                                                <span
                                                    className="badge diff-badge"
                                                    style={{ color: getDifficultyColor(q.difficulty) }}
                                                >
                                                    {q.difficulty}
                                                </span>
                                                {q.type === 'TITA' && (
                                                    <span className="badge tita-badge">TITA</span>
                                                )}
                                            </div>
                                        </div>

                                        {q.passage && (
                                            <div className="question-passage">
                                                <p>{q.passage}</p>
                                            </div>
                                        )}

                                        <div className="question-text">
                                            <p>{q.question}</p>
                                        </div>

                                        {q.options && (
                                            <div className="question-options">
                                                {q.options.map((opt, optIdx) => (
                                                    <div
                                                        key={opt.key || optIdx}
                                                        className={`option ${showAnswers[q.id] && opt.key === q.correctAnswer ? 'correct' : ''}`}
                                                    >
                                                        <span className="option-key">{opt.key || String.fromCharCode(65 + optIdx)}</span>
                                                        <span className="option-text">{opt.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="question-actions">
                                            <button
                                                className="show-answer-btn"
                                                onClick={() => toggleAnswer(q.id)}
                                            >
                                                {showAnswers[q.id] ? 'Hide Answer' : 'Show Answer'}
                                            </button>
                                        </div>

                                        {showAnswers[q.id] && (
                                            <div className="question-answer">
                                                <div className="correct-answer">
                                                    <strong>Correct Answer:</strong> {q.correctAnswer}
                                                </div>
                                                {q.explanation && (
                                                    <div className="explanation">
                                                        <strong>Explanation:</strong>
                                                        <p>{q.explanation}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default QuestionGenerator;
