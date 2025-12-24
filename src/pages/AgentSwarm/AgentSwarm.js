import React, { useState, useEffect } from 'react';
import { mockAgentStatus } from '../../services/mockData';
import './AgentSwarm.css';

/**
 * Agent Swarm Page Component
 * Visualization of 4 AI agents processing test results
 * 
 * TODO: Stream agent responses via WebSocket
 * TODO: Real-time status updates from backend
 */
function AgentSwarm() {
    const [agentData, setAgentData] = useState(mockAgentStatus);

    // Simulate agent processing (demo only)
    useEffect(() => {
        // TODO: Replace with WebSocket connection
        // ws.connect('/api/agents/stream')

        const timer = setTimeout(() => {
            setAgentData((prev) => ({
                ...prev,
                overallProgress: 100,
                estimatedCompletion: 'Complete',
                agents: prev.agents.map((agent) => ({
                    ...agent,
                    status: 'completed',
                    output: agent.output || {
                        message: 'Analysis complete. Ready to generate recommendations.',
                    },
                })),
            }));
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const renderAgentOutput = (agent) => {
        if (!agent.output) {
            return (
                <div className="agent-waiting">
                    <div className="agent-waiting__icon">⏳</div>
                    <p className="agent-waiting__text">Waiting to process...</p>
                </div>
            );
        }

        return (
            <div className="agent-card__output">
                <p className="agent-output__message">{agent.output.message}</p>
                <div className="agent-output__stats">
                    {agent.id === 'architect' && agent.output.generatedQuestions && (
                        <>
                            <span className="agent-output__stat">
                                📝 <strong>{agent.output.generatedQuestions}</strong> questions generated
                            </span>
                            <span className="agent-output__stat">
                                🎯 Targeting: {agent.output.targetTopics?.join(', ')}
                            </span>
                        </>
                    )}
                    {agent.id === 'detective' && agent.output.patterns && (
                        <>
                            <span className="agent-output__stat">
                                📚 <strong>{agent.output.patterns.conceptual}</strong> conceptual
                            </span>
                            <span className="agent-output__stat">
                                ⚡ <strong>{agent.output.patterns.silly}</strong> silly
                            </span>
                            <span className="agent-output__stat">
                                ⏱️ <strong>{agent.output.patterns.timeManagement}</strong> time issues
                            </span>
                        </>
                    )}
                    {agent.id === 'tutor' && agent.output.lessonsReady !== undefined && (
                        <>
                            <span className="agent-output__stat">
                                ✅ <strong>{agent.output.lessonsReady}</strong> lessons ready
                            </span>
                            <span className="agent-output__stat">
                                ⏳ <strong>{agent.output.inProgress}</strong> in progress
                            </span>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="agent-swarm">
            {/* Header */}
            <header className="agent-swarm__header">
                <h1 className="agent-swarm__title">🤖 AI Agent Swarm</h1>
                <p className="agent-swarm__subtitle">
                    Our specialized AI agents are analyzing your test performance to create
                    personalized improvement strategies.
                </p>
            </header>

            {/* Overall Progress */}
            <section className="swarm-progress">
                <div className="swarm-progress__header">
                    <h2 className="swarm-progress__title">Overall Analysis Progress</h2>
                    <span className="swarm-progress__eta">
                        {agentData.overallProgress < 100 ? (
                            <>
                                ⏱️ Est. completion: {agentData.estimatedCompletion}
                            </>
                        ) : (
                            <>✅ Analysis Complete</>
                        )}
                    </span>
                </div>
                <div className="swarm-progress__bar">
                    <div
                        className="swarm-progress__fill"
                        style={{ width: `${agentData.overallProgress}%` }}
                    />
                </div>
            </section>

            {/* Agent Cards */}
            <div className="agent-grid">
                {agentData.agents.map((agent, index) => (
                    <div
                        key={agent.id}
                        className={`agent-card agent-card--${agent.status}`}
                        style={{
                            '--index': index,
                            '--agent-color': agent.color,
                        }}
                    >
                        <div className="agent-card__header">
                            <div className="agent-card__icon">{agent.icon}</div>
                            <div className="agent-card__info">
                                <h3 className="agent-card__name">{agent.name}</h3>
                                <p className="agent-card__description">{agent.description}</p>
                            </div>
                        </div>

                        <span className={`agent-status agent-status--${agent.status}`}>
                            {agent.status === 'processing' && (
                                <span className="processing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            )}
                            {agent.status}
                        </span>

                        {renderAgentOutput(agent)}

                        {agent.status === 'completed' && (
                            <div className="agent-card__actions">
                                <button className="agent-action-btn">View Details</button>
                                <button className="agent-action-btn">Apply Suggestions</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AgentSwarm;
