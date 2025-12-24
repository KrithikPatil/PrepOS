import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockTestQuestions, mockTestConfig } from '../../services/mockData';
import './Test.css';

/**
 * Test Page Component - Mock Test Interface
 * Premium dark mode UI with question navigation and timer
 * 
 * MANDATORY FILE: This is the primary entry screen for Mock Tests
 * This file is located at src/pages/Test/Test.js
 * 
 * TODO: Fetch questions from GET /api/test/:testId/questions
 * TODO: Submit answers to POST /api/test/:testId/submit
 * TODO: Track analytics for timeSpentPerQuestion
 */
function Test() {
    const navigate = useNavigate();

    // Test state
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [markedForReview, setMarkedForReview] = useState({});
    const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Timer state
    const [totalSeconds, setTotalSeconds] = useState(mockTestConfig.duration * 60);
    const [lastQuestionTime, setLastQuestionTime] = useState(Date.now());

    // Initialize questions
    useEffect(() => {
        // TODO: Fetch from /api/test/:testId/questions
        setQuestions(mockTestQuestions);
    }, []);

    // Timer countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setTotalSeconds((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleSubmitTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Track time spent on current question
    const trackTimeSpent = useCallback(() => {
        const currentTime = Date.now();
        const timeSpent = Math.round((currentTime - lastQuestionTime) / 1000);

        setTimeSpentPerQuestion((prev) => ({
            ...prev,
            [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + timeSpent,
        }));

        setLastQuestionTime(currentTime);
    }, [currentQuestionIndex, lastQuestionTime]);

    // Format time display
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Get timer status for styling
    const getTimerStatus = () => {
        const totalDuration = mockTestConfig.duration * 60;
        if (totalSeconds <= 300) return 'danger'; // Last 5 minutes
        if (totalSeconds <= totalDuration * 0.1) return 'warning'; // Last 10%
        return 'normal';
    };

    // Handle option selection
    const handleOptionSelect = (optionKey) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [currentQuestionIndex]: optionKey,
        }));
    };

    // Navigate to question
    const goToQuestion = (index) => {
        trackTimeSpent();
        setCurrentQuestionIndex(index);
    };

    // Navigation handlers
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

    // Save and next
    const handleSaveAndNext = () => {
        if (selectedOptions[currentQuestionIndex]) {
            handleNext();
        }
    };

    // Mark for review
    const handleMarkForReview = () => {
        setMarkedForReview((prev) => ({
            ...prev,
            [currentQuestionIndex]: !prev[currentQuestionIndex],
        }));
        handleNext();
    };

    // Clear response
    const handleClearResponse = () => {
        setSelectedOptions((prev) => {
            const updated = { ...prev };
            delete updated[currentQuestionIndex];
            return updated;
        });
    };

    // Submit test
    const handleSubmitTest = () => {
        trackTimeSpent();

        // TODO: Submit to POST /api/test/:testId/submit
        const submissionData = {
            answers: selectedOptions,
            timeSpentPerQuestion,
            totalTimeTaken: mockTestConfig.duration * 60 - totalSeconds,
        };

        console.log('Submitting test:', submissionData);

        // Navigate to analysis page
        navigate('/analysis', {
            state: {
                answers: selectedOptions,
                timeSpent: timeSpentPerQuestion,
            }
        });
    };

    // Get question status for navigation palette
    const getQuestionStatus = (index) => {
        const isAnswered = selectedOptions[index] !== undefined;
        const isMarked = markedForReview[index];
        const isCurrent = index === currentQuestionIndex;

        if (isCurrent) return 'current';
        if (isAnswered && isMarked) return 'answered marked';
        if (isAnswered) return 'answered';
        if (isMarked) return 'marked';
        return 'unanswered';
    };

    // Calculate summary stats
    const getSummaryStats = () => {
        const answered = Object.keys(selectedOptions).length;
        const marked = Object.keys(markedForReview).filter((k) => markedForReview[k]).length;
        const pending = questions.length - answered;
        return { answered, marked, pending };
    };

    const stats = getSummaryStats();
    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) {
        return (
            <div className="test-page">
                <div className="loading">Loading questions...</div>
            </div>
        );
    }

    return (
        <div className="test-page">
            {/* Header */}
            <header className="test-header">
                <div className="test-info">
                    <h1 className="test-title">{mockTestConfig.testName}</h1>
                    <div className="test-meta">
                        <div className="test-meta__item">
                            <span>{questions.length}</span> Questions
                        </div>
                        <div className="test-meta__item">
                            <span>{mockTestConfig.totalMarks}</span> Marks
                        </div>
                    </div>
                </div>

                <div className={`timer timer--${getTimerStatus()}`}>
                    <svg className="timer__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                    <span className="timer__display">{formatTime(totalSeconds)}</span>
                </div>
            </header>

            {/* Main Layout */}
            <div className="test-layout">
                {/* Question Panel */}
                <div className="question-panel">
                    <div className="question-header">
                        <div className="question-number">
                            Question <span>{currentQuestion.qno}</span> of {questions.length}
                        </div>
                        <div className="question-badges">
                            <span className="badge badge--subject">{currentQuestion.subject}</span>
                            <span className={`badge badge--difficulty-${currentQuestion.difficulty}`}>
                                {currentQuestion.difficulty}
                            </span>
                        </div>
                    </div>

                    <div className="question-content">
                        <p className="question-text">{currentQuestion.question}</p>

                        <div className="options-list">
                            {currentQuestion.options.map((option) => (
                                <div
                                    key={option.key}
                                    className={`option ${selectedOptions[currentQuestionIndex] === option.key ? 'selected' : ''}`}
                                    onClick={() => handleOptionSelect(option.key)}
                                >
                                    <div className="option__indicator">{option.key}</div>
                                    <div className="option__text">{option.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="question-actions">
                        <div className="action-group">
                            <button
                                className="btn btn--secondary"
                                onClick={handlePrevious}
                                disabled={currentQuestionIndex === 0}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>
                            <button
                                className="btn btn--secondary"
                                onClick={handleClearResponse}
                                disabled={!selectedOptions[currentQuestionIndex]}
                            >
                                Clear
                            </button>
                        </div>

                        <div className="action-group">
                            <button className="btn btn--warning" onClick={handleMarkForReview}>
                                {markedForReview[currentQuestionIndex] ? '★ Marked' : '☆ Mark for Review'}
                            </button>
                            <button className="btn btn--primary" onClick={handleSaveAndNext}>
                                Save & Next
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Palette */}
                <div className="nav-palette">
                    <div className="nav-palette__header">
                        <h3 className="nav-palette__title">Question Navigator</h3>
                    </div>

                    <div className="nav-legend">
                        <div className="legend-item">
                            <span className="legend-dot legend-dot--unanswered"></span>
                            Not Answered
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot legend-dot--answered"></span>
                            Answered
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot legend-dot--marked"></span>
                            Marked
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot legend-dot--current"></span>
                            Current
                        </div>
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

                    <div className="submit-section">
                        <button className="submit-btn" onClick={() => setShowConfirmModal(true)}>
                            Submit Test
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <div className="modal__icon">⚠️</div>
                            <h2 className="modal__title">Submit Test?</h2>
                            <p className="modal__description">
                                Are you sure you want to submit? This action cannot be undone.
                            </p>
                        </div>

                        <div className="modal__summary">
                            <div className="modal__summary-row">
                                <span className="modal__summary-label">Total Questions</span>
                                <span className="modal__summary-value">{questions.length}</span>
                            </div>
                            <div className="modal__summary-row">
                                <span className="modal__summary-label">Answered</span>
                                <span className="modal__summary-value" style={{ color: 'var(--accent-success)' }}>
                                    {stats.answered}
                                </span>
                            </div>
                            <div className="modal__summary-row">
                                <span className="modal__summary-label">Marked for Review</span>
                                <span className="modal__summary-value" style={{ color: 'var(--accent-warning)' }}>
                                    {stats.marked}
                                </span>
                            </div>
                            <div className="modal__summary-row">
                                <span className="modal__summary-label">Unanswered</span>
                                <span className="modal__summary-value" style={{ color: 'var(--accent-danger)' }}>
                                    {stats.pending}
                                </span>
                            </div>
                            <div className="modal__summary-row">
                                <span className="modal__summary-label">Time Remaining</span>
                                <span className="modal__summary-value">{formatTime(totalSeconds)}</span>
                            </div>
                        </div>

                        <div className="modal__actions">
                            <button className="btn btn--secondary" onClick={() => setShowConfirmModal(false)}>
                                Continue Test
                            </button>
                            <button className="btn btn--success" onClick={handleSubmitTest}>
                                Yes, Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Test;
