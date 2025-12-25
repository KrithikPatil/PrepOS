import React, { useState } from 'react';
import Icon from '../../components/Icon/Icon';
import './KnowYourExam.css';

/**
 * Know Your Exam Page
 * Comprehensive CAT exam guide for students
 */
function KnowYourExam() {
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        { id: 'overview', label: 'Overview', icon: 'target' },
        { id: 'sections', label: 'Exam Sections', icon: 'list' },
        { id: 'pattern', label: 'Pattern & Marking', icon: 'clipboard' },
        { id: 'strategy', label: 'Strategy Tips', icon: 'lightning' },
        { id: 'timeline', label: 'Preparation Timeline', icon: 'calendar' },
    ];

    return (
        <div className="know-exam">
            {/* Header */}
            <header className="know-exam__header">
                <h1 className="know-exam__title">
                    <Icon name="book" size={32} className="text-accent" />
                    Know Your CAT
                </h1>
                <p className="know-exam__subtitle">
                    Before the battle, know your enemy. Master every aspect of CAT 2025.
                </p>
            </header>

            {/* Quick Stats */}
            <div className="exam-quick-stats">
                <div className="quick-stat">
                    <span className="quick-stat__value">66</span>
                    <span className="quick-stat__label">Total Questions</span>
                </div>
                <div className="quick-stat">
                    <span className="quick-stat__value">120</span>
                    <span className="quick-stat__label">Minutes</span>
                </div>
                <div className="quick-stat">
                    <span className="quick-stat__value">3</span>
                    <span className="quick-stat__label">Sections</span>
                </div>
                <div className="quick-stat">
                    <span className="quick-stat__value">99+</span>
                    <span className="quick-stat__label">Percentile Goal</span>
                </div>
            </div>

            {/* Section Tabs */}
            <div className="exam-tabs">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        className={`exam-tab ${activeSection === section.id ? 'active' : ''}`}
                        onClick={() => setActiveSection(section.id)}
                    >
                        <Icon name={section.icon} size={18} />
                        {section.label}
                    </button>
                ))}
            </div>

            {/* Content Panels */}
            <div className="exam-content">
                {activeSection === 'overview' && (
                    <div className="content-panel">
                        <h2>What is CAT?</h2>
                        <p>
                            The <strong>Common Admission Test (CAT)</strong> is India's premier management entrance exam,
                            conducted by the IIMs on a rotational basis. It's your gateway to 20 IIMs and 1000+ B-schools.
                        </p>

                        <div className="info-cards">
                            <div className="info-card">
                                <h3>Eligibility</h3>
                                <ul>
                                    <li>Bachelor's degree with 50% marks (45% for reserved categories)</li>
                                    <li>Final year students can also apply</li>
                                    <li>No age limit</li>
                                </ul>
                            </div>
                            <div className="info-card">
                                <h3>Key Dates 2025</h3>
                                <ul>
                                    <li><strong>Registration:</strong> August 2025</li>
                                    <li><strong>Admit Card:</strong> October 2025</li>
                                    <li><strong>Exam Date:</strong> November 2025</li>
                                    <li><strong>Results:</strong> January 2026</li>
                                </ul>
                            </div>
                            <div className="info-card">
                                <h3>Mode of Exam</h3>
                                <ul>
                                    <li>Computer-based test (CBT)</li>
                                    <li>Conducted in 3 slots per day</li>
                                    <li>400+ test centers across India</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'sections' && (
                    <div className="content-panel">
                        <h2>Three Pillars of CAT</h2>

                        <div className="section-cards">
                            <div className="section-card section-card--varc">
                                <div className="section-card__header">
                                    <Icon name="book" size={28} />
                                    <h3>VARC</h3>
                                </div>
                                <p className="section-card__full">Verbal Ability & Reading Comprehension</p>
                                <div className="section-card__stats">
                                    <span>24 Questions</span>
                                    <span>40 Minutes</span>
                                </div>
                                <div className="section-card__topics">
                                    <h4>Topics Covered:</h4>
                                    <ul>
                                        <li><strong>Reading Comprehension (70%)</strong> - 4-5 passages, ~16 questions</li>
                                        <li><strong>Para Jumbles</strong> - Sentence rearrangement</li>
                                        <li><strong>Para Summary</strong> - Summarize in one sentence</li>
                                        <li><strong>Odd Sentence Out</strong> - Find misfit sentence</li>
                                    </ul>
                                </div>
                                <div className="section-card__tip">
                                    <Icon name="lightning" size={16} />
                                    <span>Pro Tip: RC is 70% of VARC. Master speed reading!</span>
                                </div>
                            </div>

                            <div className="section-card section-card--dilr">
                                <div className="section-card__header">
                                    <Icon name="chart" size={28} />
                                    <h3>DILR</h3>
                                </div>
                                <p className="section-card__full">Data Interpretation & Logical Reasoning</p>
                                <div className="section-card__stats">
                                    <span>20 Questions</span>
                                    <span>40 Minutes</span>
                                </div>
                                <div className="section-card__topics">
                                    <h4>Topics Covered:</h4>
                                    <ul>
                                        <li><strong>Data Interpretation</strong> - Tables, Charts, Graphs</li>
                                        <li><strong>Logical Reasoning</strong> - Puzzles, Arrangements</li>
                                        <li><strong>Games & Tournaments</strong> - Round-robin, Knockouts</li>
                                        <li><strong>Set-based Questions</strong> - 4-5 Qs per set</li>
                                    </ul>
                                </div>
                                <div className="section-card__tip">
                                    <Icon name="lightning" size={16} />
                                    <span>Pro Tip: Attempt easy sets first. Skip very hard sets!</span>
                                </div>
                            </div>

                            <div className="section-card section-card--qa">
                                <div className="section-card__header">
                                    <Icon name="calculator" size={28} />
                                    <h3>QA</h3>
                                </div>
                                <p className="section-card__full">Quantitative Aptitude</p>
                                <div className="section-card__stats">
                                    <span>22 Questions</span>
                                    <span>40 Minutes</span>
                                </div>
                                <div className="section-card__topics">
                                    <h4>Topics Covered:</h4>
                                    <ul>
                                        <li><strong>Arithmetic</strong> - Percentages, Ratios, Time & Work</li>
                                        <li><strong>Algebra</strong> - Equations, Progressions</li>
                                        <li><strong>Geometry & Mensuration</strong> - Triangles, Circles</li>
                                        <li><strong>Number System</strong> - Divisibility, Remainders</li>
                                        <li><strong>Modern Math</strong> - P&C, Probability</li>
                                    </ul>
                                </div>
                                <div className="section-card__tip">
                                    <Icon name="lightning" size={16} />
                                    <span>Pro Tip: Arithmetic alone can fetch 10+ marks!</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'pattern' && (
                    <div className="content-panel">
                        <h2>Exam Pattern & Marking Scheme</h2>

                        <div className="pattern-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Section</th>
                                        <th>Questions</th>
                                        <th>MCQs</th>
                                        <th>TITA</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>VARC</td>
                                        <td>24</td>
                                        <td>~19</td>
                                        <td>~5</td>
                                        <td>40 min</td>
                                    </tr>
                                    <tr>
                                        <td>DILR</td>
                                        <td>20</td>
                                        <td>~14</td>
                                        <td>~6</td>
                                        <td>40 min</td>
                                    </tr>
                                    <tr>
                                        <td>QA</td>
                                        <td>22</td>
                                        <td>~14</td>
                                        <td>~8</td>
                                        <td>40 min</td>
                                    </tr>
                                    <tr className="total-row">
                                        <td><strong>Total</strong></td>
                                        <td><strong>66</strong></td>
                                        <td><strong>~47</strong></td>
                                        <td><strong>~19</strong></td>
                                        <td><strong>120 min</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="marking-scheme">
                            <h3>Marking Scheme</h3>
                            <div className="marking-cards">
                                <div className="marking-card marking-card--correct">
                                    <span className="marking-icon">+3</span>
                                    <span className="marking-label">Correct Answer</span>
                                </div>
                                <div className="marking-card marking-card--wrong">
                                    <span className="marking-icon">-1</span>
                                    <span className="marking-label">Wrong MCQ</span>
                                </div>
                                <div className="marking-card marking-card--tita">
                                    <span className="marking-icon">0</span>
                                    <span className="marking-label">Wrong TITA</span>
                                </div>
                            </div>
                            <p className="marking-note">
                                <Icon name="alertTriangle" size={16} />
                                <strong>TITA</strong> = Type In The Answer. No negative marking for TITA!
                            </p>
                        </div>
                    </div>
                )}

                {activeSection === 'strategy' && (
                    <div className="content-panel">
                        <h2>Winning Strategies</h2>

                        <div className="strategy-cards">
                            <div className="strategy-card">
                                <div className="strategy-number">1</div>
                                <h3>Time Allocation</h3>
                                <p>Spend 2 minutes deciding which questions to attempt.
                                    Don't spend more than 3 mins on any single question.</p>
                            </div>
                            <div className="strategy-card">
                                <div className="strategy-number">2</div>
                                <h3>Accuracy Over Attempts</h3>
                                <p>Attempting 40 with 90% accuracy beats 55 with 70% accuracy.
                                    Quality {'>'} Quantity always.</p>
                            </div>
                            <div className="strategy-card">
                                <div className="strategy-number">3</div>
                                <h3>Section-wise Focus</h3>
                                <p>Maximize in your strong section. Target sectional cutoffs
                                    in weak sections. Both matter!</p>
                            </div>
                            <div className="strategy-card">
                                <div className="strategy-number">4</div>
                                <h3>Mock Test Strategy</h3>
                                <p>Take 30+ mocks. Analyze every mock for 2-3 hours.
                                    Fix patterns, not just errors.</p>
                            </div>
                        </div>

                        <div className="percentile-guide">
                            <h3>Percentile Target Guide</h3>
                            <div className="percentile-bars">
                                <div className="percentile-bar">
                                    <div className="bar-label">99+ Percentile</div>
                                    <div className="bar-track">
                                        <div className="bar-fill" style={{ width: '90%' }}></div>
                                    </div>
                                    <div className="bar-score">~105-110 marks</div>
                                </div>
                                <div className="percentile-bar">
                                    <div className="bar-label">95+ Percentile</div>
                                    <div className="bar-track">
                                        <div className="bar-fill" style={{ width: '75%' }}></div>
                                    </div>
                                    <div className="bar-score">~85-95 marks</div>
                                </div>
                                <div className="percentile-bar">
                                    <div className="bar-label">90+ Percentile</div>
                                    <div className="bar-track">
                                        <div className="bar-fill" style={{ width: '60%' }}></div>
                                    </div>
                                    <div className="bar-score">~70-80 marks</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'timeline' && (
                    <div className="content-panel">
                        <h2>12-Month Preparation Timeline</h2>

                        <div className="timeline">
                            <div className="timeline-item">
                                <div className="timeline-marker">M1-M3</div>
                                <div className="timeline-content">
                                    <h3>Foundation Building</h3>
                                    <ul>
                                        <li>Complete concepts for all three sections</li>
                                        <li>Focus on fundamentals of Quant & Verbal</li>
                                        <li>Develop reading habit (newspapers, novels)</li>
                                        <li>1-2 sectional tests per week</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-marker">M4-M6</div>
                                <div className="timeline-content">
                                    <h3>Intensive Practice</h3>
                                    <ul>
                                        <li>Topic-wise tests with time limits</li>
                                        <li>Start LRDI set practice</li>
                                        <li>RC: 2-3 passages daily</li>
                                        <li>2-3 sectional tests per week</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-marker">M7-M9</div>
                                <div className="timeline-content">
                                    <h3>Mock Test Phase</h3>
                                    <ul>
                                        <li>Start full-length mocks (1 per week)</li>
                                        <li>Detailed analysis after each mock</li>
                                        <li>Identify weak areas and fix them</li>
                                        <li>Build test-taking stamina</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-marker">M10-M12</div>
                                <div className="timeline-content">
                                    <h3>Final Sprint</h3>
                                    <ul>
                                        <li>2-3 mocks per week</li>
                                        <li>Revise all formulae and shortcuts</li>
                                        <li>Focus only on high-yield topics</li>
                                        <li>Mental preparation and rest</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default KnowYourExam;
