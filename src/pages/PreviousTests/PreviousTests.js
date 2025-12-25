import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services';
import Icon from '../../components/Icon/Icon';
import AITutor from '../../components/AITutor/AITutor';
import './PreviousTests.css';

/**
 * Previous Tests Page
 * Shows history of attempted tests from real backend API
 */
function PreviousTests() {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);
    const [showAITutor, setShowAITutor] = useState(false);

    // Fetch test history from API
    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const result = await studentService.getAttempts();

                if (result.success) {
                    // Format the attempts for display
                    const formattedTests = studentService.formatPreviousTests(result.attempts || []);
                    setTests(formattedTests);
                } else {
                    setError(result.error || 'Failed to load test history');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAttempts();
    }, []);

    const handleViewAnalysis = (test) => {
        navigate('/agents', { state: { attemptId: test.id } });
    };

    const handleOpenAITutor = (test) => {
        setSelectedTest(test);
        setShowAITutor(true);
    };

    const getSectionColor = (name) => {
        const colors = {
            'VARC': '#8b5cf6',
            'DILR': '#f59e0b',
            'QA': '#10b981',
        };
        return colors[name] || '#6b7280';
    };

    // Loading state
    if (loading) {
        return (
            <div className="previous-tests">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading test history...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="previous-tests">
                <div className="error-state">
                    <Icon name="alertTriangle" size={48} />
                    <h2>Failed to load test history</h2>
                    <p>{error}</p>
                    <button className="btn btn--primary" onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="previous-tests">
            {/* Header */}
            <header className="previous-tests__header">
                <h1 className="previous-tests__title">
                    <Icon name="clock" size={32} className="text-accent" style={{ marginRight: 12 }} />
                    Previous Tests
                </h1>
                <p className="previous-tests__subtitle">
                    Review your past attempts and access AI-powered analysis
                </p>
            </header>

            {/* Tests List */}
            {tests.length === 0 ? (
                <div className="empty-state">
                    <Icon name="clipboard" size={64} />
                    <h2>No Tests Attempted Yet</h2>
                    <p>Take a mock test to see your history here</p>
                    <button
                        className="btn btn--primary btn-shine"
                        onClick={() => navigate('/test')}
                    >
                        Take a Mock Test
                        <Icon name="arrowRight" size={16} />
                    </button>
                </div>
            ) : (
                <div className="tests-grid">
                    {tests.map((test) => (
                        <div key={test.id} className="test-history-card hover-lift">
                            <div className="test-history-card__header">
                                <h3>{test.name}</h3>
                                <span className="test-date">{test.date}</span>
                            </div>

                            <div className="test-history-card__score">
                                <div className="score-circle">
                                    <span className="score-value">{test.percentage}%</span>
                                    <span className="score-label">
                                        {test.score}/{test.totalMarks}
                                    </span>
                                </div>
                                {test.percentile && (
                                    <div className="percentile-badge">
                                        <Icon name="trophy" size={14} />
                                        {test.percentile} %ile
                                    </div>
                                )}
                            </div>

                            {test.sections && test.sections.length > 0 && (
                                <div className="section-scores">
                                    {test.sections.map((section, idx) => (
                                        <div
                                            key={idx}
                                            className="section-score"
                                            style={{ borderColor: getSectionColor(section.name) }}
                                        >
                                            <span className="section-name">{section.name}</span>
                                            <span className="section-value">
                                                {section.score}/{section.total}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="test-history-card__meta">
                                <span>
                                    <Icon name="clock" size={14} />
                                    {test.duration}
                                </span>
                            </div>

                            <div className="test-history-card__actions">
                                <button
                                    className="btn btn--secondary"
                                    onClick={() => handleViewAnalysis(test)}
                                >
                                    <Icon name="chart" size={16} />
                                    View Analysis
                                </button>
                                {test.hasAIAnalysis && (
                                    <button
                                        className="btn btn--primary"
                                        onClick={() => handleOpenAITutor(test)}
                                    >
                                        <Icon name="agents" size={16} />
                                        AI Tutor
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* AI Tutor Modal */}
            {showAITutor && selectedTest && (
                <AITutor
                    test={selectedTest}
                    onClose={() => {
                        setShowAITutor(false);
                        setSelectedTest(null);
                    }}
                />
            )}
        </div>
    );
}

export default PreviousTests;
