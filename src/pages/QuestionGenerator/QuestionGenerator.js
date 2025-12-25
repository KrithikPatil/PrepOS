import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionService } from '../../services';
import Icon from '../../components/Icon/Icon';
import './QuestionGenerator.css';

/**
 * Question Generator Page
 * Generate personalized practice questions using AI Architect Agent
 */
function QuestionGenerator() {
    const navigate = useNavigate();

    // Configuration state
    const [selectedSections, setSelectedSections] = useState(['QA']);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [difficulty, setDifficulty] = useState('medium');
    const [questionCount, setQuestionCount] = useState(5);
    const [useAI, setUseAI] = useState(true);

    // Data state
    const [availableTopics, setAvailableTopics] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Result state
    const [generationResult, setGenerationResult] = useState(null);

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
        setGenerationResult(null);

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
            console.log('✅ Generation successful:', result);
            setGenerationResult({
                success: true,
                count: result.count,
                testId: result.testId,
                testName: result.testName,
                message: result.message,
                source: result.source
            });
        } else {
            console.error('❌ Generation failed:', result.error);
            setError(result.error || result.message || 'Failed to generate questions');
        }
    };

    const handleStartTest = () => {
        if (generationResult?.testId) {
            navigate(`/test/start?testId=${generationResult.testId}`);
        }
    };

    const handleGenerateMore = () => {
        setGenerationResult(null);
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
                                    disabled={loading || generationResult}
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
                                    disabled={loading || generationResult}
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
                                    disabled={loading || generationResult}
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
                                    disabled={loading || generationResult}
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
                                disabled={loading || generationResult}
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

                    {!generationResult && (
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
                    )}

                    {error && (
                        <div className="error-message">
                            <Icon name="alertTriangle" size={16} />
                            {error}
                        </div>
                    )}
                </aside>

                {/* Results Panel */}
                <main className="qg-questions">
                    {!generationResult && !loading && (
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

                    {generationResult && (
                        <div className="success-state">
                            <div className="success-icon">
                                <Icon name="check" size={64} />
                            </div>
                            <h2>Questions Generated Successfully! 🎉</h2>
                            <p className="success-message">{generationResult.message}</p>

                            <div className="result-details">
                                <div className="result-stat">
                                    <span className="stat-value">{generationResult.count}</span>
                                    <span className="stat-label">Questions Created</span>
                                </div>
                                <div className="result-stat">
                                    <span className="stat-value">{selectedSections.join(', ')}</span>
                                    <span className="stat-label">Sections</span>
                                </div>
                                <div className="result-stat">
                                    <span className="stat-value">{difficulty}</span>
                                    <span className="stat-label">Difficulty</span>
                                </div>
                            </div>

                            {generationResult.testName && (
                                <div className="test-info">
                                    <Icon name="book" size={20} />
                                    <span>Test Created: <strong>{generationResult.testName}</strong></span>
                                </div>
                            )}

                            <div className="success-actions">
                                {generationResult.testId && (
                                    <button className="primary-btn" onClick={handleStartTest}>
                                        <Icon name="play" size={20} />
                                        Start Practice Test
                                    </button>
                                )}
                                <button className="secondary-btn" onClick={handleGenerateMore}>
                                    <Icon name="zap" size={20} />
                                    Generate More Questions
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default QuestionGenerator;
