import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { agentService } from '../../services';
import Icon from '../../components/Icon/Icon';
import './AgentSwarm.css';

/**
 * Agent Swarm Page Component
 * Visualization of 4 AI agents processing test results
 * Connected to real backend API
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

    // Initial agent structure
    const defaultAgents = [
        {
            id: 'architect',
            name: 'Architect',
            icon: 'settings',
            color: '#8b5cf6',
            description: 'Generates personalized practice questions',
            status: 'pending',
            output: null,
        },
        {
            id: 'detective',
            name: 'Detective',
            icon: 'search',
            color: '#f59e0b',
            description: 'Analyzes mistakes and patterns',
            status: 'pending',
            output: null,
        },
        {
            id: 'tutor',
            name: 'Tutor',
            icon: 'book',
            color: '#10b981',
            description: 'Provides Socratic explanations',
            status: 'pending',
            output: null,
        },
        {
            id: 'strategist',
            name: 'Strategist',
            icon: 'chart',
            color: '#3b82f6',
            description: 'Creates personalized study roadmap',
            status: 'pending',
            output: null,
        },
    ];

    // Start analysis when component mounts
    useEffect(() => {
        if (!attemptId) {
            setAgentData({
                overallProgress: 0,
                estimatedCompletion: 'N/A',
                agents: defaultAgents,
            });
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
                    agents: defaultAgents.map(a => ({ ...a, status: 'pending' })),
                });

                // Start polling for status
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
                // Update agent data with current status
                if (status.agents) {
                    const formatted = agentService.formatAgentStatus(status.agents);

                    setAgentData(prev => ({
                        ...prev,
                        overallProgress: calculateProgress(status.agents),
                        estimatedCompletion: status.status === 'completed' ? 'Complete' : '~1 minute',
                        agents: defaultAgents.map(agent => {
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

    const calculateProgress = (agents) => {
        const statuses = Object.values(agents);
        const completed = statuses.filter(a => a.status === 'completed').length;
        return Math.round((completed / 4) * 100);
    };

    const handleViewDetails = (agent) => {
        setSelectedAgent(agent);
    };

    const handleApplySuggestions = (agent) => {
        setToastMessage(`${agent.name} suggestions applied to your roadmap!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setTimeout(() => navigate('/roadmap'), 1500);
    };

    const renderAgentOutput = (agent) => {
        if (agent.status === 'pending') {
            return (
                <div className="agent-waiting">
                    <div className="agent-waiting__icon">
                        <Icon name="hourglass" size={24} />
                    </div>
                    <p className="agent-waiting__text">Waiting to process...</p>
                </div>
            );
        }

        if (agent.status === 'processing') {
            return (
                <div className="agent-waiting">
                    <div className="agent-waiting__icon animate-spin">
                        <Icon name="settings" size={24} />
                    </div>
                    <p className="agent-waiting__text">Analyzing...</p>
                </div>
            );
        }

        if (!agent.output) {
            return (
                <div className="agent-waiting">
                    <p className="agent-waiting__text">No output available</p>
                </div>
            );
        }

        return (
            <div className="agent-card__output">
                <p className="agent-output__message">{agent.output.message || 'Analysis complete'}</p>
                <div className="agent-output__stats">
                    {agent.id === 'architect' && agent.output.questionsGenerated && (
                        <span className="agent-output__stat">
                            <Icon name="clipboard" size={16} style={{ marginRight: 6 }} />
                            <strong>{agent.output.questionsGenerated}</strong> questions generated
                        </span>
                    )}
                    {agent.id === 'detective' && agent.output.mistakesFound !== undefined && (
                        <span className="agent-output__stat">
                            <Icon name="target" size={16} style={{ marginRight: 6 }} />
                            <strong>{agent.output.mistakesFound}</strong> patterns identified
                        </span>
                    )}
                    {agent.id === 'tutor' && agent.output.lessonsReady !== undefined && (
                        <span className="agent-output__stat">
                            <Icon name="book" size={16} style={{ marginRight: 6 }} />
                            <strong>{agent.output.lessonsReady}</strong> lessons ready
                        </span>
                    )}
                    {agent.id === 'strategist' && agent.output.weeklyPlan && (
                        <span className="agent-output__stat">
                            <Icon name="chart" size={16} style={{ marginRight: 6 }} />
                            <strong>{agent.output.weeklyPlan.length}</strong>-week plan ready
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // Loading state
    if (loading) {
        return (
            <div className="agent-swarm">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Starting AI analysis...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="agent-swarm">
                <div className="error-state">
                    <Icon name="alertTriangle" size={48} />
                    <h2>Analysis Failed</h2>
                    <p>{error}</p>
                    <button className="btn btn--primary" onClick={() => navigate('/test')}>
                        Back to Tests
                    </button>
                </div>
            </div>
        );
    }

    // No attempt ID - show intro
    if (!attemptId) {
        return (
            <div className="agent-swarm">
                <header className="agent-swarm__header">
                    <h1 className="agent-swarm__title">
                        <Icon name="agents" size={32} className="text-accent" style={{ marginRight: 12 }} />
                        AI Agent Swarm
                    </h1>
                    <p className="agent-swarm__subtitle">
                        Complete a mock test to see AI agents analyze your performance
                    </p>
                </header>

                <div className="agent-intro">
                    <div className="agent-intro__cards">
                        {defaultAgents.map((agent) => (
                            <div
                                key={agent.id}
                                className="agent-intro-card"
                                style={{ borderColor: agent.color }}
                            >
                                <div
                                    className="agent-intro-card__icon"
                                    style={{ background: `${agent.color}20`, color: agent.color }}
                                >
                                    <Icon name={agent.icon} size={28} />
                                </div>
                                <h3>{agent.name}</h3>
                                <p>{agent.description}</p>
                            </div>
                        ))}
                    </div>

                    <button
                        className="btn btn--primary btn-shine"
                        onClick={() => navigate('/test')}
                    >
                        Take a Mock Test
                        <Icon name="arrowRight" size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="agent-swarm">
            {/* Toast Notification */}
            {showToast && (
                <div className="toast-notification">
                    <Icon name="check" size={20} />
                    {toastMessage}
                </div>
            )}

            {/* Header */}
            <header className="agent-swarm__header">
                <div>
                    <h1 className="agent-swarm__title">
                        <Icon name="agents" size={32} className="text-accent" style={{ marginRight: 12 }} />
                        AI Analysis in Progress
                    </h1>
                    <p className="agent-swarm__subtitle">
                        Our AI agents are analyzing your test performance
                    </p>
                </div>
                <div className="overall-progress">
                    <div className="progress-circle">
                        <span className="progress-value">{agentData?.overallProgress || 0}%</span>
                    </div>
                    <span className="progress-label">{agentData?.estimatedCompletion}</span>
                </div>
            </header>

            {/* Agent Cards Grid */}
            <div className="agent-cards-grid">
                {agentData?.agents.map((agent) => (
                    <div
                        key={agent.id}
                        className={`agent-card ${agent.status}`}
                        style={{ borderColor: agent.color }}
                    >
                        <div className="agent-card__header">
                            <div
                                className="agent-card__icon"
                                style={{ background: `${agent.color}20`, color: agent.color }}
                            >
                                <Icon name={agent.icon} size={24} />
                            </div>
                            <div className="agent-card__info">
                                <h3>{agent.name}</h3>
                                <span className={`status-badge status-badge--${agent.status}`}>
                                    {agent.status}
                                </span>
                            </div>
                        </div>

                        <p className="agent-card__description">{agent.description}</p>

                        {renderAgentOutput(agent)}

                        {agent.status === 'completed' && (
                            <div className="agent-card__actions">
                                <button
                                    className="btn btn--secondary"
                                    onClick={() => handleViewDetails(agent)}
                                >
                                    View Details
                                </button>
                                <button
                                    className="btn btn--primary"
                                    onClick={() => handleApplySuggestions(agent)}
                                >
                                    Apply
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Agent Detail Modal */}
            {selectedAgent && (
                <div className="agent-modal-overlay" onClick={() => setSelectedAgent(null)}>
                    <div className="agent-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="agent-modal__header">
                            <h2>{selectedAgent.name} Analysis</h2>
                            <button
                                className="agent-modal__close"
                                onClick={() => setSelectedAgent(null)}
                            >
                                <Icon name="x" size={24} />
                            </button>
                        </div>
                        <div className="agent-modal__content">
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
