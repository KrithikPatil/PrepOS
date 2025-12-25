import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { studentService } from '../../services';
import Icon from '../../components/Icon/Icon';
import './Analysis.css';

/**
 * Analysis Page Component
 * Shows post-test analysis based on real attempt data
 */
function Analysis() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get data from Test page navigation
    const attemptData = location.state;

    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                // If we have attempt data from navigation, use it
                if (attemptData?.attemptId) {
                    const result = await studentService.getAttemptAnalysis(attemptData.attemptId);

                    if (result.success) {
                        setAnalysis({
                            ...result.analysis,
                            score: attemptData.score,
                            testName: attemptData.testName,
                            totalMarks: attemptData.totalMarks,
                        });
                    } else {
                        // Use the basic data we have
                        setAnalysis({
                            score: attemptData.score || 0,
                            testName: attemptData.testName || 'Test',
                            totalMarks: attemptData.totalMarks || 100,
                            percentage: Math.round((attemptData.score / attemptData.totalMarks) * 100) || 0,
                        });
                    }
                } else {
                    // No attempt data - fetch recent attempts
                    const result = await studentService.getAttempts();

                    if (result.success && result.attempts?.length > 0) {
                        const latestAttempt = result.attempts[0];
                        setAnalysis({
                            score: latestAttempt.score || 0,
                            testName: latestAttempt.testName || 'Recent Test',
                            totalMarks: latestAttempt.totalMarks || 100,
                            percentage: Math.round((latestAttempt.score / latestAttempt.totalMarks) * 100) || 0,
                            sectionScores: latestAttempt.sectionScores,
                        });
                    } else {
                        setError('No test attempts found. Take a test first!');
                    }
                }
            } catch (err) {
                console.error('Analysis fetch error:', err);
                // Fallback to basic display from navigation state
                if (attemptData) {
                    setAnalysis({
                        score: attemptData.score || 0,
                        testName: attemptData.testName || 'Test',
                        totalMarks: attemptData.totalMarks || 100,
                        percentage: Math.round(((attemptData.score || 0) / (attemptData.totalMarks || 100)) * 100),
                    });
                } else {
                    setError('Could not load analysis data');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [attemptData]);

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return '#10b981';
        if (percentage >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getSectionColor = (section) => {
        const colors = {
            'VARC': '#8b5cf6',
            'DILR': '#f59e0b',
            'QA': '#10b981',
        };
        return colors[section] || '#6b7280';
    };

    // Loading
    if (loading) {
        return (
            <div className="analysis">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading analysis...</p>
                </div>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="analysis">
                <div className="error-state">
                    <Icon name="alertTriangle" size={48} />
                    <h2>No Analysis Available</h2>
                    <p>{error}</p>
                    <button className="btn btn--primary" onClick={() => navigate('/test')}>
                        Take a Test
                    </button>
                </div>
            </div>
        );
    }

    // No analysis
    if (!analysis) {
        return (
            <div className="analysis">
                <div className="error-state">
                    <Icon name="clipboard" size={48} />
                    <h2>No Test Data</h2>
                    <p>Complete a test to see your analysis</p>
                    <button className="btn btn--primary" onClick={() => navigate('/test')}>
                        Take a Test
                    </button>
                </div>
            </div>
        );
    }

    const percentage = analysis.percentage || Math.round((analysis.score / analysis.totalMarks) * 100);

    return (
        <div className="analysis">
            {/* Header */}
            <header className="analysis__header">
                <div>
                    <h1 className="analysis__title">
                        <Icon name="chart" size={32} className="text-accent" style={{ marginRight: 12 }} />
                        Test Analysis
                    </h1>
                    <p className="analysis__subtitle">{analysis.testName}</p>
                </div>
                <button
                    className="btn btn--primary"
                    onClick={() => navigate('/agents', { state: { attemptId: attemptData?.attemptId } })}
                >
                    <Icon name="agents" size={16} />
                    AI Analysis
                </button>
            </header>

            {/* Score Overview */}
            <section className="score-overview">
                <div className="score-card main-score">
                    <div
                        className="score-circle"
                        style={{
                            background: `conic-gradient(${getScoreColor(percentage)} ${percentage * 3.6}deg, #1e1e2e ${percentage * 3.6}deg)`
                        }}
                    >
                        <div className="score-circle__inner">
                            <span className="score-value">{percentage}%</span>
                            <span className="score-label">{analysis.score}/{analysis.totalMarks}</span>
                        </div>
                    </div>
                    <h3>Overall Score</h3>
                </div>

                <div className="score-breakdown">
                    {analysis.sectionScores ? (
                        Object.entries(analysis.sectionScores).map(([section, data]) => (
                            <div
                                key={section}
                                className="section-score-card"
                                style={{ borderLeftColor: getSectionColor(section) }}
                            >
                                <h4>{section}</h4>
                                <div className="section-score-card__value">
                                    <span className="score">{data.score || 0}</span>
                                    <span className="total">/{data.total || 0}</span>
                                </div>
                                <div className="section-score-card__bar">
                                    <div
                                        className="bar-fill"
                                        style={{
                                            width: `${data.total ? (data.score / data.total) * 100 : 0}%`,
                                            background: getSectionColor(section)
                                        }}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-sections">
                            <p>Section-wise breakdown will be available after AI analysis</p>
                            <button
                                className="btn btn--secondary"
                                onClick={() => navigate('/agents', { state: { attemptId: attemptData?.attemptId } })}
                            >
                                Get AI Analysis
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Quick Stats */}
            <section className="quick-stats">
                <div className="stat-card">
                    <Icon name="check" size={24} />
                    <div className="stat-card__content">
                        <span className="stat-value">
                            {analysis.correct || Math.round(analysis.score / 3)}
                        </span>
                        <span className="stat-label">Correct</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Icon name="x" size={24} />
                    <div className="stat-card__content">
                        <span className="stat-value">
                            {analysis.incorrect || 0}
                        </span>
                        <span className="stat-label">Incorrect</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Icon name="minus" size={24} />
                    <div className="stat-card__content">
                        <span className="stat-value">
                            {analysis.unattempted || 0}
                        </span>
                        <span className="stat-label">Skipped</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Icon name="clock" size={24} />
                    <div className="stat-card__content">
                        <span className="stat-value">
                            {analysis.timeTaken || '0m'}
                        </span>
                        <span className="stat-label">Time Taken</span>
                    </div>
                </div>
            </section>

            {/* Action Cards */}
            <section className="action-cards">
                <div
                    className="action-card hover-lift"
                    onClick={() => navigate('/agents', { state: { attemptId: attemptData?.attemptId } })}
                >
                    <div className="action-card__icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
                        <Icon name="agents" size={28} />
                    </div>
                    <h3>AI Agent Analysis</h3>
                    <p>Get detailed insights from our AI agents</p>
                    <span className="action-card__arrow">→</span>
                </div>

                <div
                    className="action-card hover-lift"
                    onClick={() => navigate('/roadmap')}
                >
                    <div className="action-card__icon" style={{ background: '#10b98120', color: '#10b981' }}>
                        <Icon name="roadmap" size={28} />
                    </div>
                    <h3>Study Roadmap</h3>
                    <p>View your personalized study plan</p>
                    <span className="action-card__arrow">→</span>
                </div>

                <div
                    className="action-card hover-lift"
                    onClick={() => navigate('/test')}
                >
                    <div className="action-card__icon" style={{ background: '#3b82f620', color: '#3b82f6' }}>
                        <Icon name="clipboard" size={28} />
                    </div>
                    <h3>Take Another Test</h3>
                    <p>Practice more to improve</p>
                    <span className="action-card__arrow">→</span>
                </div>
            </section>

            {/* Performance Message */}
            <section className="performance-message">
                <div className={`message-card ${percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : 'danger'}`}>
                    <Icon name={percentage >= 70 ? 'trophy' : percentage >= 50 ? 'target' : 'flag'} size={24} />
                    <div>
                        <h4>
                            {percentage >= 70
                                ? 'Great Performance!'
                                : percentage >= 50
                                    ? 'Good Effort!'
                                    : 'Keep Practicing!'}
                        </h4>
                        <p>
                            {percentage >= 70
                                ? 'You\'re doing excellent! Keep up the good work.'
                                : percentage >= 50
                                    ? 'You\'re on the right track. Focus on weak areas.'
                                    : 'Review the topics and practice more. You\'ll improve!'}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Analysis;
