import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services';
import Icon from '../../components/Icon/Icon';
import AITutor from '../../components/AITutor/AITutor';
import './PreviousTests.css';

/**
 * Previous Tests Page - Premium UI
 * Shows history of attempted tests
 */
function PreviousTests() {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);
    const [showAITutor, setShowAITutor] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAttempts();
    }, []);

    const fetchAttempts = async () => {
        try {
            const result = await studentService.getAttempts();

            if (result.success) {
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

    const handleViewAnalysis = (test) => {
        navigate('/analysis', { state: { attemptId: test.id } });
    };

    const handleOpenAITutor = (test) => {
        navigate(`/tutor/${test.id}`);
    };

    const getSectionColor = (name) => {
        const colors = { 'VARC': '#8b5cf6', 'DILR': '#f59e0b', 'QA': '#10b981' };
        return colors[name] || '#6b7280';
    };

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return '#10b981';
        if (percentage >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const stats = {
        total: tests.length,
        avgScore: tests.length > 0
            ? Math.round(tests.reduce((sum, t) => sum + (t.percentage || 0), 0) / tests.length)
            : 0,
        bestScore: tests.length > 0
            ? Math.max(...tests.map(t => t.percentage || 0))
            : 0,
    };

    // Loading
    if (loading) {
        return (
            <div className="pt-page">
                <div className="pt-loading">
                    <div className="pt-loading__spinner"></div>
                    <p>Loading your test history...</p>
                </div>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="pt-page">
                <div className="pt-error">
                    <div className="pt-error__icon">
                        <Icon name="alertTriangle" size={48} />
                    </div>
                    <h2>Unable to Load History</h2>
                    <p>{error}</p>
                    <button className="pt-btn pt-btn--primary" onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-page">
            {/* Hero Section */}
            <div className="pt-hero">
                <div className="pt-hero__bg">
                    <div className="pt-hero__gradient"></div>
                    <div className="pt-hero__pattern"></div>
                </div>

                <div className="pt-hero__content">
                    <h1 className="pt-hero__title">
                        Test <span>History</span>
                    </h1>
                    <p className="pt-hero__subtitle">
                        Track your progress, review past attempts, and get AI-powered insights
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="pt-hero__stats">
                    <div className="pt-stat-card">
                        <Icon name="clipboard" size={24} />
                        <div className="pt-stat-card__content">
                            <span className="pt-stat-card__value">{stats.total}</span>
                            <span className="pt-stat-card__label">Tests Taken</span>
                        </div>
                    </div>
                    <div className="pt-stat-card">
                        <Icon name="chart" size={24} />
                        <div className="pt-stat-card__content">
                            <span className="pt-stat-card__value">{stats.avgScore}%</span>
                            <span className="pt-stat-card__label">Avg Score</span>
                        </div>
                    </div>
                    <div className="pt-stat-card">
                        <Icon name="trophy" size={24} />
                        <div className="pt-stat-card__content">
                            <span className="pt-stat-card__value">{stats.bestScore}%</span>
                            <span className="pt-stat-card__label">Best Score</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {tests.length === 0 ? (
                <div className="pt-empty">
                    <div className="pt-empty__illustration">
                        <div className="pt-empty__circle">
                            <Icon name="clipboard" size={64} />
                        </div>
                        <div className="pt-empty__orbit">
                            <div className="pt-empty__dot"></div>
                        </div>
                    </div>
                    <h2>No Tests Attempted Yet</h2>
                    <p>Start your CAT preparation journey by taking a mock test</p>
                    <div className="pt-empty__actions">
                        <button
                            className="pt-btn pt-btn--hero"
                            onClick={() => navigate('/test')}
                        >
                            <Icon name="plus" size={20} />
                            Take Your First Test
                        </button>
                    </div>

                    {/* Features */}
                    <div className="pt-empty__features">
                        <div className="pt-feature">
                            <div className="pt-feature__icon">
                                <Icon name="chart" size={24} />
                            </div>
                            <h4>Track Progress</h4>
                            <p>See your scores and improvement over time</p>
                        </div>
                        <div className="pt-feature">
                            <div className="pt-feature__icon">
                                <Icon name="agents" size={24} />
                            </div>
                            <h4>AI Analysis</h4>
                            <p>Get detailed insights on your performance</p>
                        </div>
                        <div className="pt-feature">
                            <div className="pt-feature__icon">
                                <Icon name="target" size={24} />
                            </div>
                            <h4>Focus Areas</h4>
                            <p>Identify weak topics to improve</p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Filters */}
                    <div className="pt-filters">
                        <button
                            className={`pt-filter ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All Tests
                        </button>
                        <button
                            className={`pt-filter ${filter === 'recent' ? 'active' : ''}`}
                            onClick={() => setFilter('recent')}
                        >
                            Recent
                        </button>
                        <button
                            className={`pt-filter ${filter === 'best' ? 'active' : ''}`}
                            onClick={() => setFilter('best')}
                        >
                            Best Scores
                        </button>
                    </div>

                    {/* Tests Grid */}
                    <div className="pt-grid">
                        {tests.map((test, index) => (
                            <div
                                key={test.id}
                                className="pt-card"
                                style={{ '--card-delay': `${index * 0.05}s` }}
                            >
                                <div className="pt-card__header">
                                    <div>
                                        <h3 className="pt-card__name">{test.name}</h3>
                                        <span className="pt-card__date">
                                            <Icon name="calendar" size={12} />
                                            {test.date}
                                        </span>
                                    </div>
                                    <div
                                        className="pt-card__score"
                                        style={{
                                            background: `conic-gradient(${getScoreColor(test.percentage)} ${test.percentage * 3.6}deg, var(--bg-tertiary) 0deg)`
                                        }}
                                    >
                                        <div className="pt-card__score-inner">
                                            <span className="pt-card__percentage">{test.percentage}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-card__details">
                                    <div className="pt-card__stat">
                                        <span className="label">Score</span>
                                        <span className="value">{test.score}/{test.totalMarks}</span>
                                    </div>
                                    <div className="pt-card__stat">
                                        <span className="label">Duration</span>
                                        <span className="value">{test.duration}</span>
                                    </div>
                                    {test.percentile && (
                                        <div className="pt-card__stat">
                                            <span className="label">Percentile</span>
                                            <span className="value">{test.percentile}%ile</span>
                                        </div>
                                    )}
                                </div>

                                {test.sections && test.sections.length > 0 && (
                                    <div className="pt-card__sections">
                                        {test.sections.map((section, idx) => (
                                            <div
                                                key={idx}
                                                className="pt-card__section"
                                                style={{ '--section-color': getSectionColor(section.name) }}
                                            >
                                                <span className="name">{section.name}</span>
                                                <span className="score">{section.score}/{section.total}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-card__actions">
                                    <button
                                        className="pt-btn pt-btn--ghost"
                                        onClick={() => handleViewAnalysis(test)}
                                    >
                                        <Icon name="chart" size={16} />
                                        Analysis
                                    </button>
                                    <button
                                        className="pt-btn pt-btn--primary"
                                        onClick={() => handleOpenAITutor(test)}
                                    >
                                        <Icon name="agents" size={16} />
                                        AI Tutor
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
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
