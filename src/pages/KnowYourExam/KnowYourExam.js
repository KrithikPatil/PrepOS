import React, { useState } from 'react';
import Icon from '../../components/Icon/Icon';
import './KnowYourExam.css';

/**
 * Know Your Exam Page - Premium CAT Guide
 */
function KnowYourExam() {
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        { id: 'overview', label: 'Overview', icon: 'target' },
        { id: 'sections', label: 'Exam Sections', icon: 'list' },
        { id: 'pattern', label: 'Pattern & Marking', icon: 'clipboard' },
        { id: 'strategy', label: 'Strategy Tips', icon: 'zap' },
        { id: 'timeline', label: 'Preparation Timeline', icon: 'calendar' },
    ];

    return (
        <div className="kye-page">
            {/* Hero Section */}
            <div className="kye-hero">
                <div className="kye-hero__bg">
                    <div className="kye-hero__gradient"></div>
                    <div className="kye-hero__pattern"></div>
                </div>

                <div className="kye-hero__content">
                    <div className="kye-hero__badge">
                        <Icon name="book" size={14} />
                        Complete Guide
                    </div>
                    <h1 className="kye-hero__title">
                        Know Your <span>CAT</span>
                    </h1>
                    <p className="kye-hero__subtitle">
                        Before the battle, know your enemy. Master every aspect of CAT 2025.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="kye-hero__stats">
                    <div className="kye-stat">
                        <span className="kye-stat__value">66</span>
                        <span className="kye-stat__label">Questions</span>
                    </div>
                    <div className="kye-stat">
                        <span className="kye-stat__value">120</span>
                        <span className="kye-stat__label">Minutes</span>
                    </div>
                    <div className="kye-stat">
                        <span className="kye-stat__value">3</span>
                        <span className="kye-stat__label">Sections</span>
                    </div>
                </div>
            </div>

            {/* Section Tabs */}
            <div className="kye-tabs">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        className={`kye-tab ${activeSection === section.id ? 'active' : ''}`}
                        onClick={() => setActiveSection(section.id)}
                    >
                        <Icon name={section.icon} size={18} />
                        <span>{section.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Panels */}
            <div className="kye-content">
                {activeSection === 'overview' && (
                    <div className="kye-panel">
                        <h2>What is CAT?</h2>
                        <p className="kye-intro">
                            The <strong>Common Admission Test (CAT)</strong> is India's premier management entrance exam,
                            conducted by the IIMs on a rotational basis. It's your gateway to 20 IIMs and 1000+ B-schools.
                        </p>

                        <div className="kye-cards">
                            <div className="kye-card">
                                <div className="kye-card__icon">
                                    <Icon name="user" size={24} />
                                </div>
                                <h3>Eligibility</h3>
                                <ul>
                                    <li>Bachelor's degree with 50% marks (45% for reserved)</li>
                                    <li>Final year students can also apply</li>
                                    <li>No age limit</li>
                                </ul>
                            </div>
                            <div className="kye-card">
                                <div className="kye-card__icon">
                                    <Icon name="calendar" size={24} />
                                </div>
                                <h3>Key Dates 2025</h3>
                                <ul>
                                    <li><strong>Registration:</strong> August 2025</li>
                                    <li><strong>Admit Card:</strong> October 2025</li>
                                    <li><strong>Exam Date:</strong> November 2025</li>
                                    <li><strong>Results:</strong> January 2026</li>
                                </ul>
                            </div>
                            <div className="kye-card">
                                <div className="kye-card__icon">
                                    <Icon name="monitor" size={24} />
                                </div>
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
                    <div className="kye-panel">
                        <h2>Three Pillars of CAT</h2>

                        <div className="kye-sections">
                            <div className="kye-section kye-section--varc">
                                <div className="kye-section__header">
                                    <Icon name="book" size={32} />
                                    <div>
                                        <h3>VARC</h3>
                                        <span>Verbal Ability & Reading Comprehension</span>
                                    </div>
                                </div>
                                <div className="kye-section__meta">
                                    <span>24 Questions</span>
                                    <span>40 Minutes</span>
                                </div>
                                <div className="kye-section__topics">
                                    <h4>Topics Covered:</h4>
                                    <ul>
                                        <li><strong>Reading Comprehension (70%)</strong> - 4-5 passages</li>
                                        <li><strong>Para Jumbles</strong> - Sentence rearrangement</li>
                                        <li><strong>Para Summary</strong> - Summarize in one sentence</li>
                                        <li><strong>Odd Sentence Out</strong> - Find misfit sentence</li>
                                    </ul>
                                </div>
                                <div className="kye-section__tip">
                                    <Icon name="zap" size={16} />
                                    RC is 70% of VARC. Master speed reading!
                                </div>
                            </div>

                            <div className="kye-section kye-section--dilr">
                                <div className="kye-section__header">
                                    <Icon name="chart" size={32} />
                                    <div>
                                        <h3>DILR</h3>
                                        <span>Data Interpretation & Logical Reasoning</span>
                                    </div>
                                </div>
                                <div className="kye-section__meta">
                                    <span>20 Questions</span>
                                    <span>40 Minutes</span>
                                </div>
                                <div className="kye-section__topics">
                                    <h4>Topics Covered:</h4>
                                    <ul>
                                        <li><strong>Data Interpretation</strong> - Tables, Charts, Graphs</li>
                                        <li><strong>Logical Reasoning</strong> - Puzzles, Arrangements</li>
                                        <li><strong>Games & Tournaments</strong> - Round-robin, Knockouts</li>
                                        <li><strong>Set-based Questions</strong> - 4-5 Qs per set</li>
                                    </ul>
                                </div>
                                <div className="kye-section__tip">
                                    <Icon name="zap" size={16} />
                                    Attempt easy sets first. Skip very hard sets!
                                </div>
                            </div>

                            <div className="kye-section kye-section--qa">
                                <div className="kye-section__header">
                                    <Icon name="calculator" size={32} />
                                    <div>
                                        <h3>QA</h3>
                                        <span>Quantitative Aptitude</span>
                                    </div>
                                </div>
                                <div className="kye-section__meta">
                                    <span>22 Questions</span>
                                    <span>40 Minutes</span>
                                </div>
                                <div className="kye-section__topics">
                                    <h4>Topics Covered:</h4>
                                    <ul>
                                        <li><strong>Arithmetic</strong> - Percentages, Ratios, Time & Work</li>
                                        <li><strong>Algebra</strong> - Equations, Progressions</li>
                                        <li><strong>Geometry</strong> - Triangles, Circles</li>
                                        <li><strong>Number System</strong> - Divisibility, Remainders</li>
                                    </ul>
                                </div>
                                <div className="kye-section__tip">
                                    <Icon name="zap" size={16} />
                                    Arithmetic alone can fetch 10+ marks!
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'pattern' && (
                    <div className="kye-panel">
                        <h2>Exam Pattern & Marking</h2>

                        <div className="kye-table-wrapper">
                            <table className="kye-table">
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
                                    <tr className="total">
                                        <td><strong>Total</strong></td>
                                        <td><strong>66</strong></td>
                                        <td><strong>~47</strong></td>
                                        <td><strong>~19</strong></td>
                                        <td><strong>120 min</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="kye-marking">
                            <h3>Marking Scheme</h3>
                            <div className="kye-marking__cards">
                                <div className="kye-marking__card kye-marking__card--correct">
                                    <span className="value">+3</span>
                                    <span className="label">Correct Answer</span>
                                </div>
                                <div className="kye-marking__card kye-marking__card--wrong">
                                    <span className="value">-1</span>
                                    <span className="label">Wrong MCQ</span>
                                </div>
                                <div className="kye-marking__card kye-marking__card--tita">
                                    <span className="value">0</span>
                                    <span className="label">Wrong TITA</span>
                                </div>
                            </div>
                            <div className="kye-marking__note">
                                <Icon name="alertTriangle" size={16} />
                                <strong>TITA</strong> = Type In The Answer. No negative marking for TITA!
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'strategy' && (
                    <div className="kye-panel">
                        <h2>Winning Strategies</h2>

                        <div className="kye-strategies">
                            <div className="kye-strategy">
                                <div className="kye-strategy__number">1</div>
                                <div className="kye-strategy__content">
                                    <h3>Time Allocation</h3>
                                    <p>Spend 2 minutes deciding which questions to attempt. Don't spend more than 3 mins on any single question.</p>
                                </div>
                            </div>
                            <div className="kye-strategy">
                                <div className="kye-strategy__number">2</div>
                                <div className="kye-strategy__content">
                                    <h3>Accuracy Over Attempts</h3>
                                    <p>Attempting 40 with 90% accuracy beats 55 with 70% accuracy. Quality {'>'} Quantity always.</p>
                                </div>
                            </div>
                            <div className="kye-strategy">
                                <div className="kye-strategy__number">3</div>
                                <div className="kye-strategy__content">
                                    <h3>Section-wise Focus</h3>
                                    <p>Maximize in your strong section. Target sectional cutoffs in weak sections. Both matter!</p>
                                </div>
                            </div>
                            <div className="kye-strategy">
                                <div className="kye-strategy__number">4</div>
                                <div className="kye-strategy__content">
                                    <h3>Mock Test Strategy</h3>
                                    <p>Take 30+ mocks. Analyze every mock for 2-3 hours. Fix patterns, not just errors.</p>
                                </div>
                            </div>
                        </div>

                        <div className="kye-percentile">
                            <h3>Percentile Target Guide</h3>
                            <div className="kye-percentile__bars">
                                <div className="kye-bar">
                                    <div className="kye-bar__label">99+ Percentile</div>
                                    <div className="kye-bar__track">
                                        <div className="kye-bar__fill" style={{ width: '90%' }}></div>
                                    </div>
                                    <div className="kye-bar__score">~105-110 marks</div>
                                </div>
                                <div className="kye-bar">
                                    <div className="kye-bar__label">95+ Percentile</div>
                                    <div className="kye-bar__track">
                                        <div className="kye-bar__fill" style={{ width: '75%' }}></div>
                                    </div>
                                    <div className="kye-bar__score">~85-95 marks</div>
                                </div>
                                <div className="kye-bar">
                                    <div className="kye-bar__label">90+ Percentile</div>
                                    <div className="kye-bar__track">
                                        <div className="kye-bar__fill" style={{ width: '60%' }}></div>
                                    </div>
                                    <div className="kye-bar__score">~70-80 marks</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'timeline' && (
                    <div className="kye-panel">
                        <h2>12-Month Preparation Timeline</h2>

                        <div className="kye-timeline">
                            <div className="kye-timeline__item">
                                <div className="kye-timeline__marker">M1-M3</div>
                                <div className="kye-timeline__content">
                                    <h3>Foundation Building</h3>
                                    <ul>
                                        <li>Complete concepts for all three sections</li>
                                        <li>Focus on fundamentals of Quant & Verbal</li>
                                        <li>Develop reading habit</li>
                                        <li>1-2 sectional tests per week</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="kye-timeline__item">
                                <div className="kye-timeline__marker">M4-M6</div>
                                <div className="kye-timeline__content">
                                    <h3>Intensive Practice</h3>
                                    <ul>
                                        <li>Topic-wise tests with time limits</li>
                                        <li>Start LRDI set practice</li>
                                        <li>RC: 2-3 passages daily</li>
                                        <li>2-3 sectional tests per week</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="kye-timeline__item">
                                <div className="kye-timeline__marker">M7-M9</div>
                                <div className="kye-timeline__content">
                                    <h3>Mock Test Phase</h3>
                                    <ul>
                                        <li>Start full-length mocks (1 per week)</li>
                                        <li>Detailed analysis after each mock</li>
                                        <li>Identify weak areas and fix them</li>
                                        <li>Build test-taking stamina</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="kye-timeline__item">
                                <div className="kye-timeline__marker">M10-M12</div>
                                <div className="kye-timeline__content">
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
