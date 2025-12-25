import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../components/Icon/Icon';
import './AITutor.css';

/**
 * AI Tutor Component
 * Post-exam AI assistant for explaining solutions
 * Simulates streaming responses for premium UX
 */
function AITutor({ question, isOpen, onClose }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initial greeting when opened with a question
    useEffect(() => {
        if (isOpen && question && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: `I'm PrepOS AI Tutor 🎓\n\nI see you're reviewing **Q${question.qno}: ${question.topic}**\n\nWould you like me to:\n• Explain the solution step-by-step\n• Clarify a specific concept\n• Show alternative approaches\n• Suggest similar practice questions`
            }]);
        }
    }, [isOpen, question, messages.length]);

    // Simulate AI response
    const generateResponse = async (userQuery) => {
        setIsTyping(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        let response = '';
        const lowerQuery = userQuery.toLowerCase();

        if (lowerQuery.includes('explain') || lowerQuery.includes('solution') || lowerQuery.includes('how')) {
            response = `📘 **Solution for Q${question.qno}**\n\n${question.explanation}\n\n**Key Concepts:**\n• Topic: ${question.topic}\n• Difficulty: ${question.difficulty}\n• Section: ${question.section || 'General'}\n\n**Tip:** ${getTopicTip(question.topic)}`;
        } else if (lowerQuery.includes('concept') || lowerQuery.includes('theory')) {
            response = `📚 **${question.topic} - Concept Overview**\n\n${getConceptExplanation(question.topic)}\n\n*Want me to provide more examples?*`;
        } else if (lowerQuery.includes('similar') || lowerQuery.includes('practice')) {
            response = `🎯 **Practice Suggestions for ${question.topic}**\n\n1. Try more ${question.difficulty} level questions\n2. Focus on time management (avg time: ${question.avgTimeSeconds}s)\n3. Review related topics in ${question.section || 'this section'}\n\n*I can generate custom practice questions for you!*`;
        } else if (lowerQuery.includes('wrong') || lowerQuery.includes('mistake')) {
            response = `🔍 **Common Mistakes in ${question.topic}**\n\n• Rushing through without reading carefully\n• Missing key details in the question\n• Calculation errors under time pressure\n• Not eliminating wrong options first\n\n**Pro tip:** Always verify your answer if time permits!`;
        } else {
            response = `I'd be happy to help you understand this question better!\n\n**Question:** ${question.question.substring(0, 100)}...\n\n**Correct Answer:** ${question.correctAnswer}\n\n${question.explanation}\n\n*Ask me anything specific about this question!*`;
        }

        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setIsTyping(false);
    };

    const getTopicTip = (topic) => {
        const tips = {
            'Reading Comprehension': 'Read the last paragraph first - it often contains the main conclusion!',
            'Para Jumbles': 'Look for transition words like "However", "Therefore", "Moreover" to find connections.',
            'Data Interpretation': 'Always verify units and check if percentages are of the same base.',
            'Logical Reasoning': 'Draw diagrams for arrangement problems - it saves time!',
            'Arithmetic': 'For profit/loss, always start with CP = 100 for easy calculations.',
            'Algebra': 'Memorize common identities - they appear frequently in CAT.',
            'Number System': 'Learn cyclicity of powers - it helps in remainder problems.',
        };
        return tips[topic] || 'Practice similar questions to build speed and accuracy!';
    };

    const getConceptExplanation = (topic) => {
        const explanations = {
            'Reading Comprehension': 'RC tests your ability to understand written passages, identify main ideas, infer meaning, and analyze arguments. Focus on understanding the author\'s tone and purpose.',
            'Para Jumbles': 'Para Jumbles test logical ordering of sentences. Look for: opening sentences (introduction), closing sentences (conclusion), and connecting words.',
            'Data Interpretation': 'DI involves analyzing data from tables, charts, and graphs. Key skills: percentage calculations, ratio comparisons, and growth rate analysis.',
            'Logical Reasoning': 'LR tests your ability to solve puzzles and arrangements. Common types: seating arrangements, scheduling, and blood relations.',
            'Arithmetic': 'Covers percentages, ratios, time-work, time-speed-distance. Focus on shortcuts and approximation techniques.',
            'Algebra': 'Includes equations, inequalities, progressions, and functions. Master algebraic identities for quick solving.',
            'Number System': 'Covers divisibility, remainders, HCF/LCM, and number properties. Learn cyclicity and divisibility rules.',
        };
        return explanations[topic] || 'This topic requires consistent practice and understanding of fundamental concepts.';
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
        generateResponse(inputValue);
        setInputValue('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickActions = [
        { label: 'Explain Solution', icon: 'book' },
        { label: 'Show Concept', icon: 'lightbulb' },
        { label: 'Similar Questions', icon: 'clipboard' },
        { label: 'Common Mistakes', icon: 'alertTriangle' },
    ];

    if (!isOpen) return null;

    return (
        <div className="ai-tutor-overlay">
            <div className="ai-tutor">
                {/* Header */}
                <div className="ai-tutor__header">
                    <div className="ai-tutor__title">
                        <Icon name="agents" size={24} className="text-accent" />
                        <span>AI Tutor</span>
                        <span className="ai-tutor__badge">BETA</span>
                    </div>
                    <button className="ai-tutor__close" onClick={onClose}>
                        <Icon name="close" size={20} />
                    </button>
                </div>

                {/* Question Reference */}
                {question && (
                    <div className="ai-tutor__context">
                        <span className="context-label">Discussing:</span>
                        <span className="context-question">Q{question.qno}: {question.topic}</span>
                    </div>
                )}

                {/* Messages */}
                <div className="ai-tutor__messages">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message message--${msg.role}`}>
                            {msg.role === 'assistant' && (
                                <div className="message__avatar">
                                    <Icon name="agents" size={16} />
                                </div>
                            )}
                            <div className="message__content">
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
                    {isTyping && (
                        <div className="message message--assistant">
                            <div className="message__avatar">
                                <Icon name="agents" size={16} />
                            </div>
                            <div className="message__typing">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="ai-tutor__actions">
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            className="quick-action"
                            onClick={() => {
                                setInputValue(action.label);
                                handleSend();
                            }}
                        >
                            <Icon name={action.icon} size={14} />
                            {action.label}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="ai-tutor__input">
                    <input
                        type="text"
                        placeholder="Ask about this question..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                    >
                        <Icon name="arrow" size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AITutor;
