import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAnalysisResults, mockTestQuestions } from '../../services/mockData';
import './Analysis.css';

/**
 * Analysis Page Component
 * Post-test analysis with mistake classification and detailed breakdown
 * 
 * TODO: Fetch analysis from POST /api/test/:testId/submit
 * TODO: Inject Detective Agent analysis here
 */
function Analysis() {
    const navigate = useNavigate();
    const results = mockAnalysisResults;
    const questions = mockTestQuestions;

    // Count mistake types
    const mistakeCounts = {
        conceptual: results.mistakeClassification.filter(m => m.type === 'conceptual_gap').length,
        silly: results.mistakeClassification.filter(m => m.type === 'silly_mistake').length,
        time: results.mistakeClassification.filter(m => m.type === 'time_management').length,
    };

    // Get time indicator
    const getTimeIndicator = (timeSpent, avgTime) => {
        const ratio = timeSpent / avgTime;
        if (ratio < 0.7) return { class: 'fast', icon: '⚡' };
        if (ratio > 1.3) return { class: 'slow', icon: '🐢' };
        return { class: 'normal', icon: '✓' };
    };

    return (
        <div className="analysis">
            {/* Header */}
            <header className="analysis__header">
                <h1 className="analysis__title">📊 Test Analysis</h1>
                <p className="analysis__subtitle">
                    Detailed breakdown of your performance with AI-powered insights
                </p>
            </header>

            {/* Score Overview */}
            <section className="score-overview">
                <div className="score-card" style={{ '--score-percent': results.score.percentage }}>
                    <div className="score-circle">
                        <div className="score-value">
                            {results.score.obtained}<span>/{results.score.total}</span>
                        </div>
                    </div>
                    <p className="score-label">
                        {results.score.percentage}% • Percentile: {results.score.percentile}
                    </p>
                    <div className="score-stats">
                        <div className="score-stat">
                            <div className="score-stat__value score-stat__value--correct">
                                {results.summary.correct}
                            </div>
                            <div className="score-stat__label">Correct</div>
                        </div>
                        <div className="score-stat">
                            <div className="score-stat__value score-stat__value--incorrect">
                                {results.summary.incorrect}
                            </div>
                            <div className="score-stat__label">Incorrect</div>
                        </div>
                        <div className="score-stat">
                            <div className="score-stat__value score-stat__value--unattempted">
                                {results.summary.unattempted}
                            </div>
                            <div className="score-stat__label">Skipped</div>
                        </div>
                    </div>
                </div>

                <div className="subject-breakdown">
                    <h3 className="subject-breakdown__title">Subject-wise Performance</h3>
                    {results.subjectWise.map((subject) => (
                        <div key={subject.subject} className="subject-item">
                            <div className="subject-header">
                                <span className="subject-name">{subject.subject}</span>
                                <span className="subject-score">
                                    {subject.score}/{subject.total} ({Math.round((subject.score / subject.total) * 100)}%)
                                </span>
                            </div>
                            <div className="subject-progress">
                                <div
                                    className={`subject-progress__bar subject-progress__bar--${subject.subject.toLowerCase()}`}
                                    style={{ width: `${(subject.score / subject.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mistake Classification */}
            <section className="mistake-section">
                <h2 className="section-title">🔍 Mistake Classification</h2>
                <div className="mistake-cards">
                    <div className="mistake-card mistake-card--conceptual">
                        <div className="mistake-card__header">
                            <div className="mistake-card__icon">📚</div>
                            <div className="mistake-card__count">{mistakeCounts.conceptual}</div>
                        </div>
                        <h3 className="mistake-card__title">Conceptual Gaps</h3>
                        <p className="mistake-card__description">
                            Questions where your understanding of fundamental concepts needs strengthening.
                            Focus on revisiting theory and practice basic problems.
                        </p>
                    </div>

                    <div className="mistake-card mistake-card--silly">
                        <div className="mistake-card__header">
                            <div className="mistake-card__icon">⚡</div>
                            <div className="mistake-card__count">{mistakeCounts.silly}</div>
                        </div>
                        <h3 className="mistake-card__title">Silly Mistakes</h3>
                        <p className="mistake-card__description">
                            Errors due to carelessness despite knowing the concept.
                            Practice double-checking your calculations before moving on.
                        </p>
                    </div>

                    <div className="mistake-card mistake-card--time">
                        <div className="mistake-card__header">
                            <div className="mistake-card__icon">⏱️</div>
                            <div className="mistake-card__count">{mistakeCounts.time}</div>
                        </div>
                        <h3 className="mistake-card__title">Time Issues</h3>
                        <p className="mistake-card__description">
                            Questions where time management impacted your performance.
                            Practice with timer and learn to flag & skip strategically.
                        </p>
                    </div>
                </div>
            </section>

            {/* Detailed Analysis Table */}
            <section className="analysis-table-section">
                <div className="analysis-table-header">
                    <h2 className="section-title">📋 Question-wise Analysis</h2>
                </div>
                <table className="analysis-table">
                    <thead>
                        <tr>
                            <th>Q#</th>
                            <th>Subject</th>
                            <th>Topic</th>
                            <th>Status</th>
                            <th>Your Answer</th>
                            <th>Correct</th>
                            <th>Time Spent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.perQuestionAnalysis.map((item, index) => {
                            const question = questions[index];
                            const timeIndicator = getTimeIndicator(item.timeSpent, item.avgTime);

                            return (
                                <tr key={item.qno}>
                                    <td>{item.qno}</td>
                                    <td>{question?.subject || '-'}</td>
                                    <td>{question?.topic || '-'}</td>
                                    <td>
                                        <span className={`status-badge status-badge--${item.status}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>{item.answer || '-'}</td>
                                    <td>{item.correct}</td>
                                    <td>
                                        <span className={`time-indicator time-indicator--${timeIndicator.class}`}>
                                            {timeIndicator.icon} {item.timeSpent}s
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>

            {/* CTAs */}
            <section className="analysis-cta">
                <div className="cta-card" onClick={() => navigate('/agents')}>
                    <div className="cta-card__icon">🤖</div>
                    <div className="cta-card__content">
                        <h3>View AI Agent Insights</h3>
                        <p>See what our AI agents discovered about your learning patterns</p>
                    </div>
                </div>
                <div className="cta-card" onClick={() => navigate('/roadmap')}>
                    <div className="cta-card__icon">🗺️</div>
                    <div className="cta-card__content">
                        <h3>Get Personalized Roadmap</h3>
                        <p>AI-generated study plan to improve your weak areas</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Analysis;
