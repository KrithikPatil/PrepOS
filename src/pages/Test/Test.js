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

    // Proctoring state
    const [showStartScreen, setShowStartScreen] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [violationCount, setViolationCount] = useState(0);
    const [showViolationWarning, setShowViolationWarning] = useState(false);
    const [violationMessage, setViolationMessage] = useState('');
    const MAX_VIOLATIONS = 2;

    // Timer state
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [lastQuestionTime, setLastQuestionTime] = useState(Date.now());

    // Get test mode context (not used for layout changes)
    const { enterTestMode, exitTestMode } = useTestMode();

    // Proctoring: Log a violation
    const logViolation = useCallback((type, message) => {
        setViolationCount(prev => {
            const newCount = prev + 1;
            if (newCount > MAX_VIOLATIONS) {
                // Auto-submit due to malpractice
                setTimeout(() => handleSubmitTest('malpractice'), 1500);
            }
            return newCount;
        });
        setViolationMessage(`⚠️ ${message} (Warning ${violationCount + 1}/${MAX_VIOLATIONS})`);
        setShowViolationWarning(true);
        setTimeout(() => setShowViolationWarning(false), 4000);
    }, [violationCount]);

    // Proctoring: Start test with fullscreen
    const handleStartTestWithFullscreen = useCallback(async () => {
        try {
            const elem = document.documentElement;
            await elem.requestFullscreen?.();
            setIsFullscreen(true);
            setShowStartScreen(false);
            setTestStarted(true);
        } catch (err) {
            console.error('Fullscreen failed:', err);
            // Still start the test but show warning
            setViolationMessage('⚠️ Fullscreen is required. Please enable fullscreen to continue.');
            setShowViolationWarning(true);
        }
    }, []);

    // Fetch test data - only once
    useEffect(() => {
        console.log('[Test] useEffect for fetch - hasFetchedTest.current:', hasFetchedTest.current, 'testId:', testId);

        if (hasFetchedTest.current) {
            console.log('[Test] Already fetched, skipping');
            return;
        }
        hasFetchedTest.current = true;

        const fetchTest = async () => {
            // Mock data disabled - using real backend
            const USE_MOCK_DATA = false;

            if (USE_MOCK_DATA) {
                console.log('[Test] Using mock data - bypassing backend');
                setTestConfig({ id: 'mock', name: 'Mock Test', duration: 10, totalMarks: 15 });
                setQuestions([
                    { id: 'q1', qno: 1, section: 'QA', topic: 'Test', difficulty: 'medium', type: 'MCQ', question: 'What is 2+2?', options: [{ key: 'A', text: '3' }, { key: 'B', text: '4' }], marks: 3, negativeMarks: 1 },
                ]);
                setTotalSeconds(600);
                setLoading(false);
                return;
            }

            if (!testId) {
                console.log('[Test] No testId provided');
                setError('No test ID provided. Please select a test first.');
                setLoading(false);
                return;
            }

            console.log('[Test] Fetching test:', testId);
            try {
                const result = await testService.getTestById(testId);
                console.log('[Test] API result:', result);

                if (result.success && result.test) {
                    setTestConfig(result.test);
                    setQuestions(result.questions || []);
                    setTotalSeconds(result.test.duration * 60);
                } else {
                    setError(result.error || 'Failed to load test');
                }
            } catch (err) {
                console.error('[Test] Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTest();
    }, [testId]);

    // Enter test mode - DISABLED: This was causing Layout to change which remounts Test component
    // The testConfig and questions are set, just start the test directly
    // Proctoring: Event Listeners
    useEffect(() => {
        if (!testStarted || showStartScreen || submitting) return;

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
                logViolation('fullscreen', 'Fullscreen exited');
            } else {
                setIsFullscreen(true);
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                logViolation('tab_switch', 'Tab switched or window minimized');
            }
        };

        const handleWindowBlur = () => {
            // Only log if not already handled by visibility change
            if (!document.hidden) {
                logViolation('focus_lost', 'Window focus lost');
            }
        };

        // Add listeners
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);

        // Prevent context menu (right click)
        const preventContextMenu = (e) => e.preventDefault();
        document.addEventListener('contextmenu', preventContextMenu);

        // Check fullscreen status on mount
        if (!document.fullscreenElement) {
            setIsFullscreen(false);
        }

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('contextmenu', preventContextMenu);
        };
    }, [testStarted, showStartScreen, submitting, logViolation]);

    // Initialize test but wait for user to start (for fullscreen)
    useEffect(() => {
        if (testConfig && questions.length > 0 && !hasEnteredTestMode.current) {
            hasEnteredTestMode.current = true;
            // setTestStarted(true); // Don't auto-start, wait for Start Screen interaction
            console.log('[Test] Test loaded, waiting for user to start');
        }

        return () => {
            // Cleanup
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
                // Ensure score is a primitive value (number) not an object
                const scoreValue = typeof result.score === 'object' && result.score !== null
                    ? result.score.obtained
                    : result.score;

                navigate('/analysis', {
                    state: {
                        attemptId: result.attemptId,
                        score: scoreValue,
                        testName: testConfig.name,
                        totalMarks: testConfig.totalMarks,
                        responses: responses,
                        // Pass full analysis if available
                        analysis: typeof result.score === 'object' ? result.score : null
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


    // Start Screen (Proctoring)
    if (showStartScreen && testConfig) {
        return (
            <div className="test-page test-page--start">
                <div className="start-screen">
                    <div className="start-screen__icon">
                        <Icon name="shield" size={64} />
                    </div>
                    <h1>Proctored Test Mode</h1>
                    <div className="start-screen__info">
                        <div className="info-item">
                            <Icon name="maximize" size={20} />
                            <span>Fullscreen is required</span>
                        </div>
                        <div className="info-item">
                            <Icon name="alertTriangle" size={20} />
                            <span>Don't switch tabs or windows</span>
                        </div>
                        <div className="info-item">
                            <Icon name="clock" size={20} />
                            <span>{testConfig.duration} minutes duration</span>
                        </div>
                    </div>
                    <div className="start-screen__warning">
                        <p><strong>Warning:</strong> Switching tabs or exiting fullscreen will result in a warning.</p>
                        <p>After {MAX_VIOLATIONS} warnings, the test will be auto-submitted.</p>
                    </div>
                    <button
                        className="btn btn--primary btn--lg start-btn"
                        onClick={handleStartTestWithFullscreen}
                    >
                        Start Test
                    </button>
                    <button
                        className="btn btn--secondary btn--lg"
                        onClick={() => navigate('/test')}
                    >
                        Back
                    </button>
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
                show={showViolationWarning}
                message={violationMessage}
                remainingAttempts={MAX_VIOLATIONS - violationCount}
                onDismiss={() => setShowViolationWarning(false)}
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

                {/* Nav Panel - Enhanced Question Palette */}
                <div className="nav-palette">
                    <div className="nav-palette__header">
                        <h3 className="nav-palette__title">Question Palette</h3>
                        <button
                            className="fullscreen-btn"
                            onClick={() => {
                                const elem = document.documentElement;
                                if (document.fullscreenElement) {
                                    document.exitFullscreen?.();
                                } else {
                                    elem.requestFullscreen?.();
                                }
                            }}
                        >
                            <Icon name="maximize" size={14} />
                            {document.fullscreenElement ? 'Exit' : 'Fullscreen'}
                        </button>
                    </div>
                    <div className="nav-legend">
                        <span className="legend-item">
                            <span className="legend-dot legend-dot--answered"></span> Answered
                        </span>
                        <span className="legend-item">
                            <span className="legend-dot legend-dot--marked"></span> Marked
                        </span>
                        <span className="legend-item">
                            <span className="legend-dot legend-dot--current"></span> Current
                        </span>
                        <span className="legend-item">
                            <span className="legend-dot legend-dot--unanswered"></span> Unanswered
                        </span>
                    </div>
                    <div className="question-grid">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                className={`question-btn question-btn--${getQuestionStatus(index)}`}
                                onClick={() => goToQuestion(index)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <div className="summary-stats">
                        <div className="summary-stat summary-stat--answered">
                            <div className="summary-stat__value">{stats.answered}</div>
                            <div className="summary-stat__label">Answered</div>
                        </div>
                        <div className="summary-stat summary-stat--marked">
                            <div className="summary-stat__value">{stats.marked}</div>
                            <div className="summary-stat__label">Marked</div>
                        </div>
                        <div className="summary-stat summary-stat--pending">
                            <div className="summary-stat__value">{stats.pending}</div>
                            <div className="summary-stat__label">Pending</div>
                        </div>
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
