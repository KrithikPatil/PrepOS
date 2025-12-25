import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { testService } from '../../services';
import useFocusMode from '../../hooks/useFocusMode';
import FocusWarning from '../../components/FocusWarning/FocusWarning';
import { useTestMode } from '../../contexts/TestModeContext';
import Icon from '../../components/Icon/Icon';
import './Test.css';

/**
 * Test Page Component - CAT Mock Test Interface
 * Fetches questions from real API and submits to backend
 */
function Test() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const testId = searchParams.get('testId');

    // Refs to prevent infinite loops
    const hasEnteredTestMode = useRef(false);
    const hasFetchedTest = useRef(false);

    // Test data state
    const [testConfig, setTestConfig] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Test state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [titaAnswers, setTitaAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState({});
    const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [testStarted, setTestStarted] = useState(false);

    // Timer state
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [lastQuestionTime, setLastQuestionTime] = useState(Date.now());

    // Get test mode context
    const { enterTestMode, exitTestMode } = useTestMode();

    // Focus Mode
    const {
        showWarning,
        warningMessage,
        remainingAttempts,
        enterFullscreen,
    } = useFocusMode({
        onAutoSubmit: (reason) => {
            handleSubmitTest(reason);
        },
        enabled: testStarted
    });

    // Fetch test data - only once
    useEffect(() => {
        if (hasFetchedTest.current) return;
        hasFetchedTest.current = true;

        const fetchTest = async () => {
            if (!testId) {
                setError('No test ID provided. Please select a test first.');
                setLoading(false);
                return;
            }

            try {
                const result = await testService.getTestById(testId);

                if (result.success && result.test) {
                    setTestConfig(result.test);
                    setQuestions(result.questions || []);
                    setTotalSeconds(result.test.duration * 60);
                } else {
                    setError(result.error || 'Failed to load test');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTest();
    }, [testId]);

    // Enter test mode - only once when test loads
    useEffect(() => {
        if (testConfig && questions.length > 0 && !hasEnteredTestMode.current) {
            hasEnteredTestMode.current = true;
            enterTestMode();

            // Enter fullscreen
            enterFullscreen().then(() => {
                setTestStarted(true);
            }).catch(() => {
                // Fullscreen failed, still start test
                setTestStarted(true);
            });
        }

        return () => {
            if (hasEnteredTestMode.current) {
                exitTestMode();
            }
        };
    }, [testConfig, questions.length]);

    // Timer countdown
    useEffect(() => {
        if (!testStarted || totalSeconds <= 0) return;

        const timer = setInterval(() => {
            setTotalSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitTest('time_up');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [testStarted]);

    // Track time spent
    const trackTimeSpent = useCallback(() => {
        const currentTime = Date.now();
        const timeSpent = Math.round((currentTime - lastQuestionTime) / 1000);

        setTimeSpentPerQuestion((prev) => ({
            ...prev,
            [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + timeSpent,
        }));

        setLastQuestionTime(currentTime);
    }, [currentQuestionIndex, lastQuestionTime]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const getTimerStatus = () => {
        if (!testConfig) return 'normal';
        const totalDuration = testConfig.duration * 60;
        if (totalSeconds <= 300) return 'danger';
        if (totalSeconds <= totalDuration * 0.1) return 'warning';
        return 'normal';
    };

    const handleOptionSelect = (optionKey) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [currentQuestionIndex]: optionKey,
        }));
    };

    const handleTitaInput = (value) => {
        setTitaAnswers((prev) => ({
            ...prev,
            [currentQuestionIndex]: value,
        }));
    };

    const goToQuestion = (index) => {
        trackTimeSpent();
        setCurrentQuestionIndex(index);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            goToQuestion(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            goToQuestion(currentQuestionIndex - 1);
        }
    };

    const handleSaveAndNext = () => {
        handleNext();
    };

    const handleMarkForReview = () => {
        setMarkedForReview((prev) => ({
            ...prev,
            [currentQuestionIndex]: !prev[currentQuestionIndex],
        }));
        handleNext();
    };

    const handleClearResponse = () => {
        const currentQ = questions[currentQuestionIndex];
        if (currentQ?.type === 'TITA') {
            setTitaAnswers((prev) => {
                const updated = { ...prev };
                delete updated[currentQuestionIndex];
                return updated;
            });
        } else {
            setSelectedOptions((prev) => {
                const updated = { ...prev };
                delete updated[currentQuestionIndex];
                return updated;
            });
        }
    };

    const handleSubmitTest = async (reason = 'manual') => {
        if (submitting) return;
        setSubmitting(true);
        trackTimeSpent();

        const responses = questions.map((q, index) => {
            const answer = q.type === 'TITA'
                ? titaAnswers[index]
                : selectedOptions[index];
            return {
                questionId: q.id || q._id,
                answer: answer || null,
                timeSpent: timeSpentPerQuestion[index] || 0,
            };
        });

        const totalTime = testConfig.duration * 60 - totalSeconds;

        try {
            const result = await testService.submitTest(testId, responses, totalTime);

            if (result.success) {
                navigate('/analysis', {
                    state: {
                        attemptId: result.attemptId,
                        score: result.score,
                        testName: testConfig.name,
                        totalMarks: testConfig.totalMarks,
                        responses: responses,
                    }
                });
            } else {
                alert('Failed to submit: ' + (result.error || 'Unknown error'));
                setSubmitting(false);
            }
        } catch (err) {
            alert('Error: ' + err.message);
            setSubmitting(false);
        }
    };

    const getQuestionStatus = (index) => {
        const q = questions[index];
        const isAnswered = q?.type === 'TITA'
            ? titaAnswers[index] !== undefined
            : selectedOptions[index] !== undefined;
        const isMarked = markedForReview[index];
        const isCurrent = index === currentQuestionIndex;

        if (isCurrent) return 'current';
        if (isAnswered && isMarked) return 'answered marked';
        if (isAnswered) return 'answered';
        if (isMarked) return 'marked';
        return 'unanswered';
    };

    const getSummaryStats = () => {
        let answered = 0;
        questions.forEach((q, index) => {
            if (q?.type === 'TITA' ? titaAnswers[index] : selectedOptions[index]) {
                answered++;
            }
        });
        const marked = Object.keys(markedForReview).filter((k) => markedForReview[k]).length;
        const pending = questions.length - answered;
        return { answered, marked, pending };
    };

    // Loading
    if (loading) {
        return (
            <div className="test-page test-page--loading">
                <div className="loading-container">
                    <div className="loading-spinner large"></div>
                    <h2>Loading Test...</h2>
                    <p>Fetching questions from server</p>
                </div>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="test-page test-page--error">
                <div className="error-container">
                    <div className="error-icon">
                        <Icon name="alertTriangle" size={64} />
                    </div>
                    <h2>Oops! Something went wrong</h2>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button className="btn btn--secondary" onClick={() => navigate('/test')}>
                            <Icon name="arrowLeft" size={16} />
                            Back to Tests
                        </button>
                        <button className="btn btn--primary" onClick={() => window.location.reload()}>
                            <Icon name="refresh" size={16} />
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!testConfig || questions.length === 0) {
        return (
            <div className="test-page test-page--error">
                <div className="error-container">
                    <div className="error-icon">
                        <Icon name="clipboard" size={64} />
                    </div>
                    <h2>No Questions Found</h2>
                    <p>This test doesn't have any questions yet.</p>
                    <button className="btn btn--primary" onClick={() => navigate('/test')}>
                        <Icon name="arrowLeft" size={16} />
                        Back to Tests
                    </button>
                </div>
            </div>
        );
    }

    const stats = getSummaryStats();
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="test-page">
            <FocusWarning
                show={showWarning}
                message={warningMessage}
                remainingAttempts={remainingAttempts}
                onDismiss={() => { }}
            />

            {/* Header */}
            <header className="test-header">
                <div className="test-info">
                    <h1 className="test-title">{testConfig.name}</h1>
                    <div className="test-meta">
                        <div className="test-meta__item">
                            <span>{questions.length}</span> Questions
                        </div>
                        <div className="test-meta__item">
                            <span>{testConfig.totalMarks}</span> Marks
                        </div>
                    </div>
                </div>

                <div className={`timer timer--${getTimerStatus()}`}>
                    <Icon name="clock" size={20} />
                    <span className="timer__display">{formatTime(totalSeconds)}</span>
                </div>
            </header>

            {/* Main Layout */}
            <div className="test-layout">
                {/* Question Panel */}
                <div className="question-panel">
                    <div className="question-header">
                        <div className="question-number">
                            Question <span>{currentQuestionIndex + 1}</span> of {questions.length}
                        </div>
                        <div className="question-badges">
                            {currentQuestion.section && (
                                <span className={`badge badge--section`}>
                                    {currentQuestion.section}
                                </span>
                            )}
                            {currentQuestion.topic && (
                                <span className="badge badge--topic">{currentQuestion.topic}</span>
                            )}
                            {currentQuestion.type === 'TITA' && (
                                <span className="badge badge--tita">TITA</span>
                            )}
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="question-content">
                        <p className="question-text">{currentQuestion.question}</p>

                        {currentQuestion.type === 'TITA' ? (
                            <div className="tita-input-container">
                                <label>Enter your answer:</label>
                                <input
                                    type="text"
                                    className="tita-input"
                                    value={titaAnswers[currentQuestionIndex] || ''}
                                    onChange={(e) => handleTitaInput(e.target.value)}
                                    placeholder="Type your answer"
                                    autoFocus
                                />
                            </div>
                        ) : currentQuestion.options ? (
                            <div className="options-list">
                                {currentQuestion.options.map((option, idx) => {
                                    const optKey = option.key || String.fromCharCode(65 + idx);
                                    return (
                                        <button
                                            key={optKey}
                                            className={`option ${selectedOptions[currentQuestionIndex] === optKey ? 'selected' : ''}`}
                                            onClick={() => handleOptionSelect(optKey)}
                                        >
                                            <span className="option-key">{optKey}</span>
                                            <span className="option-text">{option.text || option}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>

                    {/* Actions */}
                    <div className="question-actions">
                        <button className="btn btn--ghost" onClick={handleClearResponse}>
                            Clear
                        </button>
                        <button className="btn btn--ghost" onClick={handleMarkForReview}>
                            {markedForReview[currentQuestionIndex] ? '★ Marked' : 'Mark for Review'}
                        </button>
                        <div className="nav-buttons">
                            <button
                                className="btn btn--secondary"
                                onClick={handlePrevious}
                                disabled={currentQuestionIndex === 0}
                            >
                                ← Previous
                            </button>
                            <button className="btn btn--primary" onClick={handleSaveAndNext}>
                                Save & Next →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Nav Panel */}
                <div className="nav-panel">
                    <h3>Question Palette</h3>
                    <div className="nav-legend">
                        <span><span className="dot answered"></span> Answered</span>
                        <span><span className="dot marked"></span> Marked</span>
                        <span><span className="dot unanswered"></span> Unanswered</span>
                    </div>
                    <div className="question-palette">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                className={`palette-btn ${getQuestionStatus(index)}`}
                                onClick={() => goToQuestion(index)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <div className="nav-summary">
                        <div><strong>{stats.answered}</strong> Answered</div>
                        <div><strong>{stats.marked}</strong> Marked</div>
                        <div><strong>{stats.pending}</strong> Pending</div>
                    </div>
                    <button
                        className="btn btn--primary btn--lg submit-btn"
                        onClick={() => setShowConfirmModal(true)}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit Test'}
                    </button>
                </div>
            </div>

            {/* Confirm Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Submit Test?</h2>
                        <div className="modal-stats">
                            <div><strong>{stats.answered}</strong><br />Answered</div>
                            <div><strong>{stats.pending}</strong><br />Unanswered</div>
                            <div><strong>{stats.marked}</strong><br />Marked</div>
                        </div>
                        {stats.pending > 0 && (
                            <p className="modal-warning">You have {stats.pending} unanswered questions!</p>
                        )}
                        <div className="modal-actions">
                            <button className="btn btn--secondary" onClick={() => setShowConfirmModal(false)}>
                                Continue Test
                            </button>
                            <button
                                className="btn btn--primary"
                                onClick={() => handleSubmitTest('manual')}
                                disabled={submitting}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Test;
