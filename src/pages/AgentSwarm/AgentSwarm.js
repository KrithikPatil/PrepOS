import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { agentService } from '../../services';
import Icon from '../../components/Icon/Icon';
import './AgentSwarm.css';

/**
 * Agent Swarm Page Component
 * Premium visualization of 4 AI agents
 */
function AgentSwarm() {
    const navigate = useNavigate();
    const location = useLocation();
    const attemptId = location.state?.attemptId;

    const [jobId, setJobId] = useState(null);
    const [agentData, setAgentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [activeAgentIndex, setActiveAgentIndex] = useState(0);

    // Agent definitions with rich details
    const agents = [
        {
            id: 'architect',
            name: 'The Architect',
            icon: 'settings',
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            description: 'Generates personalized practice questions',
            detail: 'Analyzes your weak areas and creates targeted questions to strengthen your fundamentals.',
            capability: 'Question Generation',
            model: 'Gemini 2.5 Pro',
            status: 'pending',
            output: null,
        },
        {
            id: 'detective',
            name: 'The Detective',
            icon: 'search',
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            description: 'Analyzes mistake patterns',
            detail: 'Identifies recurring errors, time management issues, and knowledge gaps in your attempts.',
            capability: 'Pattern Analysis',
            model: 'Gemini 2.5 Flash',
            status: 'pending',
            output: null,
        },
        {
            id: 'tutor',
            name: 'The Tutor',
            icon: 'book',
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            description: 'Provides Socratic explanations',
            detail: 'Explains concepts through guided questioning, helping you build lasting intuition.',
            capability: 'Concept Mastery',
            model: 'Gemini 2.5 Pro',
            status: 'pending',
            output: null,
        },
        {
            id: 'strategist',
            name: 'The Strategist',
            icon: 'chart',
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            description: 'Creates personalized roadmaps',
            detail: 'Builds week-by-week study plans optimized for your target score and available time.',
            capability: 'Study Planning',
            model: 'Gemini 2.5 Flash',
            status: 'pending',
            output: null,
        },
    ];

    // Animate through agents in intro
    useEffect(() => {
        if (!attemptId) {
            const interval = setInterval(() => {
                setActiveAgentIndex((prev) => (prev + 1) % agents.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [attemptId]);

    // Start analysis when component mounts
    useEffect(() => {
        if (!attemptId) {
            setLoading(false);
            return;
        }

        startAnalysis();
    }, [attemptId]);

    const startAnalysis = async () => {
        try {
            const result = await agentService.startAnalysis(attemptId);

            if (result.success) {
                setJobId(result.jobId);
                setAgentData({
                    overallProgress: 10,
                    estimatedCompletion: '~2 minutes',
                    agents: agents.map(a => ({ ...a, status: 'pending' })),
                });
                pollStatus(result.jobId);
            } else {
                setError(result.error || 'Failed to start analysis');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const pollStatus = async (jid) => {
        try {
            await agentService.pollAnalysis(jid, (status) => {
                if (status.agents) {
                    const formatted = agentService.formatAgentStatus(status.agents);
                    setAgentData(prev => ({
                        ...prev,
                        overallProgress: calculateProgress(status.agents),
                        estimatedCompletion: status.status === 'completed' ? 'Complete' : '~1 minute',
                        agents: agents.map(agent => {
                            const match = formatted.find(f => f.id === agent.id);
                            return match ? { ...agent, ...match } : agent;
                        }),
                    }));
                }
            });
        } catch (err) {
            console.error('Polling error:', err);
        }
    };

    const calculateProgress = (agentStatuses) => {
        const statuses = Object.values(agentStatuses);
        const completed = statuses.filter(a => a.status === 'completed').length;
        return Math.round((completed / 4) * 100);
    };

    const handleViewDetails = (agent) => {
        setSelectedAgent(agent);
    };

    const handleApplySuggestions = (agent) => {
        setToastMessage(`${agent.name} suggestions applied!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setTimeout(() => navigate('/roadmap'), 1500);
    };

    // Loading state
    if (loading) {
        return (
            <div className="agent-swarm">
                <div className="as-loading">
                    <div className="as-loading__orb">
                        <div className="as-loading__pulse"></div>
                        <Icon name="agents" size={32} />
                    </div>
                    <h2>Initializing AI Agents</h2>
                    <p>Preparing your personalized analysis...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="agent-swarm">
                <div className="as-error">
                    <div className="as-error__icon">
                        <Icon name="alertTriangle" size={48} />
                    </div>
                    <h2>Analysis Unavailable</h2>
                    <p>{error}</p>
                    <button className="as-btn as-btn--primary" onClick={() => navigate('/test')}>
                        Take a Mock Test
                    </button>
                </div>
            </div>
        );
    }

    // Premium Intro State - No Test Attempted
    if (!attemptId) {
        const activeAgent = agents[activeAgentIndex];

        return (
            <div className="agent-swarm">
                {/* Hero Section */}
                <div className="as-hero">
                    <div className="as-hero__bg">
                        <div className="as-hero__gradient" style={{ background: activeAgent.gradient }}></div>
                        <div className="as-hero__grid"></div>
                    </div>

                    <div className="as-hero__content">
                        <div className="as-hero__badge">
                            <span className="as-hero__badge-dot"></span>
                            Powered by Google Gemini
                        </div>

                        <h1 className="as-hero__title">
                            AI Agent <span className="as-hero__highlight">Swarm</span>
                        </h1>

                        <p className="as-hero__subtitle">
                            Four specialized AI agents work together to analyze your performance,
                            identify weaknesses, and create a personalized path to your target score.
                        </p>

                        <button
                            className="as-btn as-btn--hero"
                            onClick={() => navigate('/test')}
                        >
                            <span>Start Mock Test</span>
                            <Icon name="arrowRight" size={20} />
                        </button>
                    </div>

                    {/* Floating Agent Orbs */}
                    <div className="as-hero__orbs">
                        {agents.map((agent, index) => (
                            <div
                                key={agent.id}
                                className={`as-orb ${index === activeAgentIndex ? 'active' : ''}`}
                                style={{
                                    '--orb-color': agent.color,
                                    '--orb-delay': `${index * 0.5}s`,
                                }}
                                onClick={() => setActiveAgentIndex(index)}
                            >
                                <Icon name={agent.icon} size={24} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Agent Showcase */}
                <div className="as-showcase">
                    <div className="as-showcase__header">
                        <h2>Meet Your AI Team</h2>
                        <p>Each agent specializes in a unique aspect of your preparation</p>
                    </div>

                    <div className="as-showcase__grid">
                        {agents.map((agent, index) => (
                            <div
                                key={agent.id}
                                className={`as-agent-card ${index === activeAgentIndex ? 'featured' : ''}`}
                                onClick={() => setActiveAgentIndex(index)}
                                style={{ '--card-delay': `${index * 0.1}s` }}
                            >
                                <div className="as-agent-card__glow" style={{ background: agent.gradient }}></div>

                                <div className="as-agent-card__header">
                                    <div
                                        className="as-agent-card__icon"
                                        style={{ background: agent.gradient }}
                                    >
                                        <Icon name={agent.icon} size={28} />
                                    </div>
                                    <div className="as-agent-card__model">{agent.model}</div>
                                </div>

                                <h3 className="as-agent-card__name">{agent.name}</h3>
                                <p className="as-agent-card__capability">{agent.capability}</p>
                                <p className="as-agent-card__detail">{agent.detail}</p>

                                <div className="as-agent-card__footer">
                                    <span className="as-agent-card__status">
                                        <span className="status-dot"></span>
                                        Ready to analyze
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How It Works */}
                <div className="as-process">
                    <h2>How It Works</h2>
                    <div className="as-process__steps">
                        <div className="as-process__step">
                            <div className="as-process__number">1</div>
                            <h4>Take a Mock Test</h4>
                            <p>Complete any CAT mock test on the platform</p>
                        </div>
                        <div className="as-process__line"></div>
                        <div className="as-process__step">
                            <div className="as-process__number">2</div>
                            <h4>AI Analysis</h4>
                            <p>Four agents analyze your performance in parallel</p>
                        </div>
                        <div className="as-process__line"></div>
                        <div className="as-process__step">
                            <div className="as-process__number">3</div>
                            <h4>Get Insights</h4>
                            <p>Receive personalized recommendations and roadmap</p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="as-cta">
                    <div className="as-cta__content">
                        <h2>Ready to unlock your potential?</h2>
                        <p>Take a mock test and let our AI agents guide your preparation.</p>
                        <button
                            className="as-btn as-btn--primary as-btn--lg"
                            onClick={() => navigate('/test')}
                        >
                            Start Your First Test
                            <Icon name="arrowRight" size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Analysis in Progress State
    return (
        <div className="agent-swarm">
            {showToast && (
                <div className="as-toast">
                    <Icon name="check" size={20} />
                    {toastMessage}
                </div>
            )}

            {/* Header with Progress */}
            <header className="as-header">
                <div className="as-header__content">
                    <h1>AI Analysis in Progress</h1>
                    <p>Our agents are processing your test results</p>
                </div>
                <div className="as-header__progress">
                    <div className="as-progress-ring">
                        <svg viewBox="0 0 100 100">
                            <circle className="as-progress-ring__bg" cx="50" cy="50" r="45" />
                            <circle
                                className="as-progress-ring__fill"
                                cx="50" cy="50" r="45"
                                style={{
                                    strokeDasharray: `${(agentData?.overallProgress || 0) * 2.83} 283`
                                }}
                            />
                        </svg>
                        <span className="as-progress-ring__value">{agentData?.overallProgress || 0}%</span>
                    </div>
                    <span className="as-progress-label">{agentData?.estimatedCompletion}</span>
                </div>
            </header>

            {/* Agent Cards */}
            <div className="as-agents-grid">
                {agentData?.agents.map((agent, index) => (
                    <div
                        key={agent.id}
                        className={`as-live-card ${agent.status}`}
                        style={{ '--card-color': agent.color }}
                    >
                        <div className="as-live-card__header">
                            <div className="as-live-card__icon" style={{ background: agent.gradient }}>
                                <Icon name={agent.icon} size={24} />
                            </div>
                            <div className="as-live-card__info">
                                <h3>{agent.name}</h3>
                                <span className={`as-status as-status--${agent.status}`}>
                                    {agent.status === 'pending' && 'Waiting...'}
                                    {agent.status === 'processing' && 'Analyzing...'}
                                    {agent.status === 'completed' && 'Complete'}
                                </span>
                            </div>
                        </div>

                        <p className="as-live-card__desc">{agent.description}</p>

                        <div className="as-live-card__output">
                            {agent.status === 'pending' && (
                                <div className="as-waiting">
                                    <div className="as-waiting__dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                    <p>Queued for processing</p>
                                </div>
                            )}
                            {agent.status === 'processing' && (
                                <div className="as-processing">
                                    <div className="as-processing__bar"></div>
                                    <p>Analyzing your performance...</p>
                                </div>
                            )}
                            {agent.status === 'completed' && agent.output && (
                                <div className="as-complete">
                                    <Icon name="check" size={16} />
                                    <p>{agent.output.message || 'Analysis complete'}</p>
                                </div>
                            )}
                        </div>

                        {agent.status === 'completed' && (
                            <div className="as-live-card__actions">
                                <button className="as-btn as-btn--ghost" onClick={() => handleViewDetails(agent)}>
                                    Details
                                </button>
                                <button className="as-btn as-btn--primary" onClick={() => handleApplySuggestions(agent)}>
                                    Apply
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selectedAgent && (
                <div className="as-modal-overlay" onClick={() => setSelectedAgent(null)}>
                    <div className="as-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="as-modal__header">
                            <h2>{selectedAgent.name} Analysis</h2>
                            <button onClick={() => setSelectedAgent(null)}>
                                <Icon name="x" size={24} />
                            </button>
                        </div>
                        <div className="as-modal__body">
                            {selectedAgent.output ? (
                                <pre>{JSON.stringify(selectedAgent.output, null, 2)}</pre>
                            ) : (
                                <p>No detailed output available</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AgentSwarm;
