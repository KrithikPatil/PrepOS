import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService, agentService } from '../../services';
import Icon from '../../components/Icon/Icon';
import './TutorSession.css';

/**
 * TutorSession Page - Interactive AI Tutor for question-by-question review
 */
function TutorSession() {
    const { attemptId } = useParams();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    // Chat state
    const [chatQuestion, setChatQuestion] = useState(null); // Index of question being chatted
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchAttemptDetails();
    }, [attemptId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const fetchAttemptDetails = async () => {
        try {
            const result = await studentService.getAttemptAnalysis(attemptId);
            if (result.success) {
                setAttempt(result.analysis);
            } else {
                setError(result.error || 'Failed to load attempt details');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChat = (questionIndex) => {
        setChatQuestion(questionIndex);
        setChatMessages([{
            role: 'assistant',
            content: `Hi! I'm your AI Tutor. 🎓\n\nI see you're reviewing **Question ${questionIndex + 1}**.\n\nHow can I help you understand this better? You can ask me to:\n• Explain the solution step-by-step\n• Clarify a concept\n• Show a different approach`
        }]);
    };

    const handleCloseChat = () => {
        setChatQuestion(null);
        setChatMessages([]);
        setChatInput('');
    };

    const handleSendChat = async () => {
        if (!chatInput.trim() || chatLoading) return;

        const userMessage = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setChatLoading(true);

        try {
            const result = await agentService.sendTutorChat(attemptId, chatQuestion, userMessage);
            if (result.success) {
                setChatMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
            } else {
                setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
            }
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    const getAnswerStatus = (response) => {
        if (!response.selectedAnswer) return 'skipped';
        return response.selectedAnswer === response.correctAnswer ? 'correct' : 'incorrect';
    };

    const getStatusColor = (status) => {
        if (status === 'correct') return '#10b981';
        if (status === 'incorrect') return '#ef4444';
        return '#6b7280';
    };

    // Loading
    if (loading) {
        return (
            <div className="ts-page">
                <div className="ts-loading">
                    <div className="ts-loading__spinner"></div>
                    <p>Loading your session...</p>
                </div>
            </div>
        );
    }

    // Error
    if (error || !attempt) {
        return (
            <div className="ts-page">
                <div className="ts-error">
                    <Icon name="alertTriangle" size={48} />
                    <h2>Unable to Load Session</h2>
                    <p>{error || 'No data available'}</p>
                    <button className="ts-btn ts-btn--primary" onClick={() => navigate('/previous-tests')}>
                        Back to Test History
                    </button>
                </div>
            </div>
        );
    }

    const responses = attempt.responses || [];
    const tutorData = attempt.aiAnalysis?.tutor;

    return (
        <div className="ts-page">
            {/* Hero */}
            <div className="ts-hero">
                <div className="ts-hero__bg">
                    <div className="ts-hero__gradient"></div>
                </div>
                <div className="ts-hero__content">
                    <button className="ts-back-btn" onClick={() => navigate('/previous-tests')}>
                        <Icon name="arrowLeft" size={20} />
                        Back
                    </button>
                    <h1 className="ts-hero__title">
                        AI <span>Tutor</span>
                    </h1>
                    <p className="ts-hero__subtitle">
                        Review your answers and get personalized explanations
                    </p>
                </div>
            </div>

            {/* Questions List */}
            <div className="ts-content">
                <div className="ts-questions-list">
                    {responses.map((response, index) => {
                        const status = getAnswerStatus(response);
                        const isExpanded = expandedQuestion === index;

                        // Find matching tutor explanation
                        const tutorExplanation = tutorData?.explanations?.find(
                            exp => exp.questionNumber === index + 1
                        );

                        return (
                            <div
                                key={index}
                                className={`ts-question-card ${isExpanded ? 'expanded' : ''}`}
                            >
                                {/* Question Header */}
                                <div
                                    className="ts-question-card__header"
                                    onClick={() => setExpandedQuestion(isExpanded ? null : index)}
                                >
                                    <div className="ts-question-card__number" style={{ background: getStatusColor(status) }}>
                                        Q{index + 1}
                                    </div>
                                    <div className="ts-question-card__info">
                                        <span className="ts-question-card__topic">{response.topic || 'General'}</span>
                                        <span className="ts-question-card__section">{response.section || 'Section'}</span>
                                    </div>
                                    <div className={`ts-question-card__status ts-question-card__status--${status}`}>
                                        <Icon name={status === 'correct' ? 'check' : status === 'incorrect' ? 'x' : 'minus'} size={16} />
                                        {status === 'correct' ? 'Correct' : status === 'incorrect' ? 'Incorrect' : 'Skipped'}
                                    </div>
                                    <Icon name={isExpanded ? 'chevronUp' : 'chevronDown'} size={20} className="ts-question-card__toggle" />
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="ts-question-card__body">
                                        {/* Question Text */}
                                        <div className="ts-question-text">
                                            <p>{response.questionText || 'Question text not available'}</p>
                                        </div>

                                        {/* Answers */}
                                        <div className="ts-answers">
                                            <div className="ts-answer">
                                                <span className="ts-answer__label">Your Answer:</span>
                                                <span className={`ts-answer__value ts-answer__value--${status}`}>
                                                    {response.selectedAnswer || 'Not answered'}
                                                </span>
                                            </div>
                                            <div className="ts-answer">
                                                <span className="ts-answer__label">Correct Answer:</span>
                                                <span className="ts-answer__value ts-answer__value--correct">
                                                    {response.correctAnswer}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Pre-generated Tutor Explanation */}
                                        {tutorExplanation && (
                                            <div className="ts-explanation">
                                                <h4><Icon name="book" size={16} /> Tutor's Insight</h4>
                                                {tutorExplanation.hook && <p className="ts-explanation__hook">{tutorExplanation.hook}</p>}
                                                {tutorExplanation.intuition && <p>{tutorExplanation.intuition}</p>}
                                                {tutorExplanation.keyInsight && (
                                                    <div className="ts-explanation__key">
                                                        <strong>Key Insight:</strong> {tutorExplanation.keyInsight}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Ask AI Button */}
                                        <button
                                            className="ts-btn ts-btn--primary ts-ask-ai-btn"
                                            onClick={(e) => { e.stopPropagation(); handleOpenChat(index); }}
                                        >
                                            <Icon name="agents" size={18} />
                                            Ask AI for More Help
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Modal */}
            {chatQuestion !== null && (
                <div className="ts-chat-overlay" onClick={handleCloseChat}>
                    <div className="ts-chat-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ts-chat-modal__header">
                            <div className="ts-chat-modal__title">
                                <Icon name="agents" size={24} />
                                <span>AI Tutor - Q{chatQuestion + 1}</span>
                            </div>
                            <button className="ts-chat-modal__close" onClick={handleCloseChat}>
                                <Icon name="x" size={20} />
                            </button>
                        </div>

                        <div className="ts-chat-modal__messages">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`ts-chat-message ts-chat-message--${msg.role}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="ts-chat-message__avatar">
                                            <Icon name="agents" size={16} />
                                        </div>
                                    )}
                                    <div className="ts-chat-message__content">
                                        {msg.content.split('\n').map((line, i) => (
                                            <p key={i} dangerouslySetInnerHTML={{
                                                __html: line
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="ts-chat-message ts-chat-message--assistant">
                                    <div className="ts-chat-message__avatar">
                                        <Icon name="agents" size={16} />
                                    </div>
                                    <div className="ts-chat-message__typing">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="ts-chat-modal__input">
                            <input
                                type="text"
                                placeholder="Ask a question..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                            />
                            <button onClick={handleSendChat} disabled={!chatInput.trim() || chatLoading}>
                                <Icon name="arrowRight" size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TutorSession;
