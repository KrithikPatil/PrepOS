import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { studentService, agentService } from '../../services';
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

    // AI Analysis State
    const [detectiveData, setDetectiveData] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisStatus, setAnalysisStatus] = useState(null); // pending, processing, completed
    const [analysisJobId, setAnalysisJobId] = useState(null);

    useEffect(() => {
        fetchAnalysis();
    }, [attemptData]);

    const fetchAnalysis = async () => {
        try {
            if (attemptData?.attemptId) {
                const result = await studentService.getAttemptAnalysis(attemptData.attemptId);

                if (result.success) {
                    const backendScore = result.analysis.score;
                    setAnalysis({
                        ...result.analysis,
                        score: attemptData.score ?? backendScore?.obtained ?? 0,
                        testName: attemptData.testName || 'Test',
                        totalMarks: attemptData.totalMarks ?? backendScore?.total ?? 100,
                        correct: backendScore?.correct || 0,
                        incorrect: backendScore?.incorrect || 0,
                        unattempted: backendScore?.unattempted || 0,
                        percentage: backendScore?.percentage || 0
                    });

                    // Check if AI analysis (detective) already exists
                    console.log('Backend /details response:', result);
                    const aiData = result.analysis?.aiAnalysis;

                    if (aiData && aiData.detective) {
                        const detectiveOutput = aiData.detective.output || aiData.detective;
                        console.log('Found existing Detective analysis:', detectiveOutput);
                        setDetectiveData(detectiveOutput);
                        setAnalysisStatus('completed');
                    } else {
                        console.log('No existing Detective analysis found in:', aiData);
                    }
                } else {
                    // Use passed score object if available
                    const passedAnalysis = attemptData.analysis || {};
                    const score = attemptData.score || 0;
                    const total = attemptData.totalMarks || 100;

                    setAnalysis({
                        ...passedAnalysis,
                        score: score,
                        testName: attemptData.testName || 'Test',
                        totalMarks: total,
                        percentage: passedAnalysis.percentage || Math.round((score / total) * 100) || 0,
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
            console.error('Error fetching analysis:', err);
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

    const handleAnalyzeMistakes = async () => {
        if (!attemptData?.attemptId) return;

        setAnalyzing(true);
        setAnalysisStatus('processing');
        console.log('Starting AI analysis for attempt:', attemptData.attemptId);

        try {
            const result = await agentService.startAnalysis(attemptData.attemptId);

            if (result.success) {
                setAnalysisJobId(result.jobId);
                pollAnalysisStatus(result.jobId);
            } else {
                console.error('Failed to start analysis:', result.error);
                setError(result.error);
                setAnalyzing(false);
                setAnalysisStatus('error');
            }
        } catch (err) {
            console.error('Error initiating analysis:', err);
            setAnalyzing(false);
            setAnalysisStatus('error');
        }
    };

    const pollAnalysisStatus = async (jobId) => {
        console.log('Polling analysis status for job:', jobId);

        try {
            await agentService.pollAnalysis(jobId, (status) => {
                // Update progress or status if needed
                console.log('Analysis status update:', status);
                if (status.status === 'completed' && status.agents?.detective) {
                    setDetectiveData(status.agents.detective.output);
                }
            });

            // Final check
            const finalStatus = await agentService.getAnalysisStatus(jobId);
            if (finalStatus.success && finalStatus.agents?.detective?.output) {
                setDetectiveData(finalStatus.agents.detective.output);
                setAnalysisStatus('completed');
            }
        } catch (err) {
            console.error('Polling failed:', err);
            setAnalysisStatus('error');
        } finally {
            setAnalyzing(false);
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

                {!detectiveData && !analyzing && (
                    <button
                        className="an-btn an-btn--primary"
                        onClick={handleAnalyzeMistakes}
                        disabled={analyzing}
                    >
                        <Icon name="agents" size={18} />
                        Analyze Mistakes with AI
                    </button>
                )}
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

            {/* AI Detective Analysis Section */}
            {(detectiveData || analyzing) && (
                <div className="an-detective-section animate-fadeInUp">
                    <div className="an-detective-header">
                        <div className="an-detective-icon">
                            <Icon name={analyzing ? "refresh" : "search"} size={32} className={analyzing ? "animate-spin" : ""} />
                        </div>
                        <div>
                            <h2>Detective Agent Analysis</h2>
                            <p>{analyzing ? "Classifying your mistakes and finding patterns..." : "Deep dive into your mistake patterns and weak areas"}</p>
                        </div>
                    </div>

                    {analyzing && (
                        <div className="an-detective-loading">
                            <div className="an-loading-bar">
                                <div className="an-loading-bar__fill"></div>
                            </div>
                            <p>Powered by Gemini 1.5 Flash</p>
                        </div>
                    )}

                    {detectiveData && (
                        <div className="an-detective-content animate-fadeIn">
                            {/* Summary Message */}
                            <div className="an-detective-message">
                                <p>{detectiveData.message}</p>
                            </div>

                            <div className="an-detective-grid">
                                {/* Mistake Patterns */}
                                <div className="an-card an-patterns-card">
                                    <h3>Mistake Patterns</h3>
                                    <div className="an-patterns-list">
                                        {Object.entries(detectiveData.patterns || {}).map(([type, count]) => (
                                            count > 0 && (
                                                <div key={type} className="an-pattern-item">
                                                    <div className="an-pattern-info">
                                                        <span className="an-pattern-label">
                                                            {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                        </span>
                                                        <span className="an-pattern-count">{count}</span>
                                                    </div>
                                                    <div className="an-pattern-bar-bg">
                                                        <div
                                                            className="an-pattern-bar-fill"
                                                            style={{
                                                                width: `${(count / (detectiveData.totalMistakes || 1)) * 100}%`,
                                                                background: type === 'silly' ? '#f59e0b' : type === 'conceptual' ? '#ef4444' : '#3b82f6'
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>

                                {/* Weak Topics */}
                                <div className="an-card an-weak-card">
                                    <h3>Weak Topics</h3>
                                    <div className="an-tags">
                                        {detectiveData.weakTopics?.map((topic, i) => (
                                            <span key={i} className="an-tag an-tag--red">{topic}</span>
                                        ))}
                                        {(!detectiveData.weakTopics || detectiveData.weakTopics.length === 0) && (
                                            <p className="text-muted">No specific weak topics detected.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Insights */}
                            {detectiveData.insights?.length > 0 && (
                                <div className="an-insights-list">
                                    <h3>Key Insights</h3>
                                    {detectiveData.insights.map((insight, idx) => (
                                        <div key={idx} className="an-insight-card">
                                            <div className="an-insight-header">
                                                <span className={`an-insight-type type-${insight.mistakeType}`}>
                                                    {insight.mistakeType?.toUpperCase()}
                                                </span>
                                                <span className="an-insight-topic">{insight.topic}</span>
                                            </div>
                                            <p className="an-insight-reason"><strong>Analysis:</strong> {insight.reason}</p>
                                            <p className="an-insight-fix"><strong>Fix:</strong> {insight.fix}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

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

            {/* Footer Actions */}
            <div className="an-footer-actions">
                <button className="an-btn an-btn--secondary" onClick={() => navigate('/roadmap')}>
                    <Icon name="roadmap" size={20} />
                    View Study Roadmap
                </button>
                <button className="an-btn an-btn--primary" onClick={() => navigate('/test')}>
                    <Icon name="refresh" size={20} />
                    Take Another Test
                </button>
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
