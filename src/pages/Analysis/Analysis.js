import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { studentService } from '../../services';
import Icon from '../../components/Icon/Icon';
import './Analysis.css';

/**
 * Analysis Page - Premium Post-Test Analysis
 */
function Analysis() {
    const navigate = useNavigate();
    const location = useLocation();
    const attemptData = location.state;

    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalysis();
    }, [attemptData]);

    const fetchAnalysis = async () => {
        try {
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
                    setAnalysis({
                        score: attemptData.score || 0,
                        testName: attemptData.testName || 'Test',
                        totalMarks: attemptData.totalMarks || 100,
                        percentage: Math.round((attemptData.score / attemptData.totalMarks) * 100) || 0,
                    });
                }
            } else {
                const result = await studentService.getAttempts();

                if (result.success && result.attempts?.length > 0) {
                    const latest = result.attempts[0];
                    setAnalysis({
                        score: latest.score || 0,
                        testName: latest.testName || 'Recent Test',
                        totalMarks: latest.totalMarks || 100,
                        percentage: Math.round((latest.score / latest.totalMarks) * 100) || 0,
                        sectionScores: latest.sectionScores,
                    });
                } else {
                    setError('No test attempts found');
                }
            }
        } catch (err) {
            if (attemptData) {
                setAnalysis({
                    score: attemptData.score || 0,
                    testName: attemptData.testName || 'Test',
                    totalMarks: attemptData.totalMarks || 100,
                    percentage: Math.round(((attemptData.score || 0) / (attemptData.totalMarks || 100)) * 100),
                });
            } else {
                setError('Could not load analysis');
            }
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (pct) => {
        if (pct >= 80) return '#10b981';
        if (pct >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getSectionColor = (section) => {
        const colors = { 'VARC': '#8b5cf6', 'DILR': '#f59e0b', 'QA': '#10b981' };
        return colors[section] || '#6b7280';
    };

    const getGrade = (pct) => {
        if (pct >= 90) return { letter: 'A+', label: 'Excellent' };
        if (pct >= 80) return { letter: 'A', label: 'Great' };
        if (pct >= 70) return { letter: 'B', label: 'Good' };
        if (pct >= 60) return { letter: 'C', label: 'Average' };
        return { letter: 'D', label: 'Needs Work' };
    };

    // Loading
    if (loading) {
        return (
            <div className="an-page">
                <div className="an-loading">
                    <div className="an-loading__spinner"></div>
                    <p>Loading your analysis...</p>
                </div>
            </div>
        );
    }

    // Error / No Data
    if (error || !analysis) {
        return (
            <div className="an-page">
                <div className="an-empty">
                    <div className="an-empty__illustration">
                        <div className="an-empty__circle">
                            <Icon name="chart" size={64} />
                        </div>
                        <div className="an-empty__ring"></div>
                    </div>
                    <h2>No Analysis Available</h2>
                    <p>{error || 'Complete a test to see your detailed analysis'}</p>
                    <button className="an-btn an-btn--hero" onClick={() => navigate('/test')}>
                        <Icon name="plus" size={20} />
                        Take a Mock Test
                    </button>

                    <div className="an-empty__info">
                        <div className="an-info-card">
                            <Icon name="chart" size={24} />
                            <h4>Performance Breakdown</h4>
                            <p>See your score across all sections</p>
                        </div>
                        <div className="an-info-card">
                            <Icon name="agents" size={24} />
                            <h4>AI Insights</h4>
                            <p>Get personalized improvement tips</p>
                        </div>
                        <div className="an-info-card">
                            <Icon name="target" size={24} />
                            <h4>Weak Areas</h4>
                            <p>Identify topics to focus on</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const percentage = analysis.percentage || Math.round((analysis.score / analysis.totalMarks) * 100);
    const grade = getGrade(percentage);

    return (
        <div className="an-page">
            {/* Hero Score Section */}
            <div className="an-hero">
                <div className="an-hero__bg">
                    <div
                        className="an-hero__gradient"
                        style={{ background: `linear-gradient(135deg, ${getScoreColor(percentage)}40, transparent)` }}
                    ></div>
                </div>

                <div className="an-hero__content">
                    <div className="an-hero__test-info">
                        <span className="an-hero__badge">Analysis Complete</span>
                        <h1 className="an-hero__title">{analysis.testName}</h1>
                    </div>

                    <div className="an-hero__score-display">
                        <div
                            className="an-score-ring"
                            style={{
                                background: `conic-gradient(${getScoreColor(percentage)} ${percentage * 3.6}deg, var(--bg-tertiary) 0deg)`
                            }}
                        >
                            <div className="an-score-ring__inner">
                                <span className="an-score-ring__value">{percentage}%</span>
                                <span className="an-score-ring__label">{analysis.score}/{analysis.totalMarks}</span>
                            </div>
                        </div>

                        <div className="an-grade">
                            <span className="an-grade__letter" style={{ color: getScoreColor(percentage) }}>
                                {grade.letter}
                            </span>
                            <span className="an-grade__label">{grade.label}</span>
                        </div>
                    </div>
                </div>

                <button
                    className="an-btn an-btn--primary"
                    onClick={() => navigate('/agents', { state: { attemptId: attemptData?.attemptId } })}
                >
                    <Icon name="agents" size={18} />
                    Get AI Analysis
                </button>
            </div>

            {/* Stats Grid */}
            <div className="an-stats">
                <div className="an-stat" style={{ '--stat-color': '#10b981' }}>
                    <div className="an-stat__icon">
                        <Icon name="check" size={24} />
                    </div>
                    <div className="an-stat__content">
                        <span className="an-stat__value">{analysis.correct || Math.round(analysis.score / 3)}</span>
                        <span className="an-stat__label">Correct</span>
                    </div>
                </div>
                <div className="an-stat" style={{ '--stat-color': '#ef4444' }}>
                    <div className="an-stat__icon">
                        <Icon name="x" size={24} />
                    </div>
                    <div className="an-stat__content">
                        <span className="an-stat__value">{analysis.incorrect || 0}</span>
                        <span className="an-stat__label">Incorrect</span>
                    </div>
                </div>
                <div className="an-stat" style={{ '--stat-color': '#6b7280' }}>
                    <div className="an-stat__icon">
                        <Icon name="minus" size={24} />
                    </div>
                    <div className="an-stat__content">
                        <span className="an-stat__value">{analysis.unattempted || 0}</span>
                        <span className="an-stat__label">Skipped</span>
                    </div>
                </div>
                <div className="an-stat" style={{ '--stat-color': '#3b82f6' }}>
                    <div className="an-stat__icon">
                        <Icon name="clock" size={24} />
                    </div>
                    <div className="an-stat__content">
                        <span className="an-stat__value">{analysis.timeTaken || '—'}</span>
                        <span className="an-stat__label">Time</span>
                    </div>
                </div>
            </div>

            {/* Section Breakdown */}
            {analysis.sectionScores && (
                <div className="an-sections">
                    <h2>Section-wise Performance</h2>
                    <div className="an-sections__grid">
                        {Object.entries(analysis.sectionScores).map(([section, data]) => {
                            const sectionPct = data.total ? Math.round((data.score / data.total) * 100) : 0;
                            return (
                                <div
                                    key={section}
                                    className="an-section-card"
                                    style={{ '--section-color': getSectionColor(section) }}
                                >
                                    <div className="an-section-card__header">
                                        <h3>{section}</h3>
                                        <span className="an-section-card__pct">{sectionPct}%</span>
                                    </div>
                                    <div className="an-section-card__score">
                                        <span className="obtained">{data.score || 0}</span>
                                        <span className="total">/{data.total || 0}</span>
                                    </div>
                                    <div className="an-section-card__bar">
                                        <div
                                            className="an-section-card__fill"
                                            style={{ width: `${sectionPct}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Action Cards */}
            <div className="an-actions">
                <div className="an-action" onClick={() => navigate('/agents', { state: { attemptId: attemptData?.attemptId } })}>
                    <div className="an-action__icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
                        <Icon name="agents" size={28} />
                    </div>
                    <div className="an-action__content">
                        <h3>AI Agent Analysis</h3>
                        <p>Get detailed insights from our AI agents</p>
                    </div>
                    <Icon name="arrowRight" size={20} className="an-action__arrow" />
                </div>

                <div className="an-action" onClick={() => navigate('/roadmap')}>
                    <div className="an-action__icon" style={{ background: '#10b98120', color: '#10b981' }}>
                        <Icon name="roadmap" size={28} />
                    </div>
                    <div className="an-action__content">
                        <h3>Study Roadmap</h3>
                        <p>View your personalized study plan</p>
                    </div>
                    <Icon name="arrowRight" size={20} className="an-action__arrow" />
                </div>

                <div className="an-action" onClick={() => navigate('/test')}>
                    <div className="an-action__icon" style={{ background: '#3b82f620', color: '#3b82f6' }}>
                        <Icon name="clipboard" size={28} />
                    </div>
                    <div className="an-action__content">
                        <h3>Take Another Test</h3>
                        <p>Practice more to improve your score</p>
                    </div>
                    <Icon name="arrowRight" size={20} className="an-action__arrow" />
                </div>
            </div>

            {/* Performance Message */}
            <div className={`an-message an-message--${percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : 'danger'}`}>
                <Icon name={percentage >= 70 ? 'trophy' : percentage >= 50 ? 'target' : 'flag'} size={24} />
                <div>
                    <h4>
                        {percentage >= 70 ? 'Great Performance!' : percentage >= 50 ? 'Good Effort!' : 'Keep Practicing!'}
                    </h4>
                    <p>
                        {percentage >= 70
                            ? 'You\'re doing excellent! Keep up the momentum.'
                            : percentage >= 50
                                ? 'You\'re on the right track. Focus on your weak areas.'
                                : 'Review the topics and practice more. You\'ll improve!'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Analysis;
