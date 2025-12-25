import React, { useState, useEffect } from 'react';
import { studentService } from '../../services';
import Icon from '../../components/Icon/Icon';
import './Roadmap.css';

/**
 * Roadmap Page Component
 * Personalized study roadmap fetched from real backend API
 */
function Roadmap() {
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedWeek, setExpandedWeek] = useState(null);

    // Fetch roadmap from API
    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                const result = await studentService.getRoadmap();

                if (result.success && result.roadmap) {
                    setRoadmap(result.roadmap);
                    // Expand first week by default
                    if (result.roadmap.weeklyPlan?.length > 0) {
                        setExpandedWeek(0);
                    }
                } else {
                    setError(result.error || 'Failed to load roadmap');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmap();
    }, []);

    const formatDuration = (minutes) => {
        if (!minutes) return '';
        if (minutes < 60) return `${minutes} min`;
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    };

    const getTaskTypeIcon = (type) => {
        const icons = {
            'concept_review': 'book',
            'practice': 'clipboard',
            'speed_drill': 'zap',
            'mock_test': 'target',
            'analysis': 'chart',
            'revision': 'refresh',
        };
        return icons[type] || 'list';
    };

    const getTaskTypeColor = (type) => {
        const colors = {
            'concept_review': '#8b5cf6',
            'practice': '#10b981',
            'speed_drill': '#f59e0b',
            'mock_test': '#3b82f6',
            'analysis': '#ec4899',
            'revision': '#6366f1',
        };
        return colors[type] || '#6b7280';
    };

    // Loading state
    if (loading) {
        return (
            <div className="roadmap">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading your personalized roadmap...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="roadmap">
                <div className="error-state">
                    <Icon name="alertTriangle" size={48} />
                    <h2>Failed to load roadmap</h2>
                    <p>{error}</p>
                    <button className="btn btn--primary" onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // No roadmap yet - show prompt to take a test
    if (!roadmap || !roadmap.weeklyPlan || roadmap.weeklyPlan.length === 0) {
        return (
            <div className="roadmap">
                <header className="roadmap__header">
                    <h1 className="roadmap__title">
                        <Icon name="roadmap" size={32} className="text-accent" style={{ marginRight: 12 }} />
                        Your Study Roadmap
                    </h1>
                    <p className="roadmap__subtitle">
                        Complete a mock test to get your personalized CAT preparation roadmap
                    </p>
                </header>

                <div className="roadmap-empty">
                    <div className="roadmap-empty__icon">
                        <Icon name="chart" size={64} />
                    </div>
                    <h2>No Roadmap Yet</h2>
                    <p>Take a mock test first, and our AI Strategist will create a personalized study plan for you.</p>
                    <a href="/test" className="btn btn--primary btn-shine">
                        Take a Mock Test
                        <Icon name="arrowRight" size={16} />
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="roadmap">
            {/* Header */}
            <header className="roadmap__header">
                <div>
                    <h1 className="roadmap__title">
                        <Icon name="roadmap" size={32} className="text-accent" style={{ marginRight: 12 }} />
                        Your CAT Roadmap
                    </h1>
                    <p className="roadmap__subtitle">
                        {roadmap.message || `${roadmap.daysUntilExam} days until CAT - Your personalized study plan`}
                    </p>
                </div>
                {roadmap.daysUntilExam && (
                    <div className="days-counter">
                        <span className="days-counter__value">{roadmap.daysUntilExam}</span>
                        <span className="days-counter__label">Days Left</span>
                    </div>
                )}
            </header>

            {/* Focus Areas */}
            {roadmap.focusAreas && roadmap.focusAreas.length > 0 && (
                <section className="focus-areas">
                    <h2>
                        <Icon name="target" size={20} style={{ marginRight: 8 }} />
                        Focus Areas
                    </h2>
                    <div className="focus-tags">
                        {roadmap.focusAreas.map((area, idx) => (
                            <span key={idx} className="focus-tag">{area}</span>
                        ))}
                    </div>
                </section>
            )}

            {/* Weekly Plan */}
            <section className="weekly-plan">
                <h2>
                    <Icon name="calendar" size={20} style={{ marginRight: 8 }} />
                    Weekly Schedule
                </h2>

                <div className="weeks-list">
                    {roadmap.weeklyPlan.map((week, weekIdx) => (
                        <div
                            key={weekIdx}
                            className={`week-card ${expandedWeek === weekIdx ? 'expanded' : ''}`}
                        >
                            <div
                                className="week-card__header"
                                onClick={() => setExpandedWeek(expandedWeek === weekIdx ? null : weekIdx)}
                            >
                                <div className="week-card__info">
                                    <span className="week-number">Week {weekIdx + 1}</span>
                                    <h3>{week.theme || `Week ${weekIdx + 1} Tasks`}</h3>
                                </div>
                                <div className="week-card__meta">
                                    <span>{week.tasks?.length || 0} tasks</span>
                                    <Icon
                                        name={expandedWeek === weekIdx ? 'chevronUp' : 'chevronDown'}
                                        size={20}
                                    />
                                </div>
                            </div>

                            {expandedWeek === weekIdx && week.tasks && (
                                <div className="week-card__tasks">
                                    {week.tasks.map((task, taskIdx) => (
                                        <div
                                            key={taskIdx}
                                            className="task-item"
                                            style={{ borderLeftColor: getTaskTypeColor(task.type) }}
                                        >
                                            <div className="task-item__icon">
                                                <Icon
                                                    name={getTaskTypeIcon(task.type)}
                                                    size={18}
                                                    style={{ color: getTaskTypeColor(task.type) }}
                                                />
                                            </div>
                                            <div className="task-item__content">
                                                <h4>{task.title}</h4>
                                                {task.description && (
                                                    <p>{task.description}</p>
                                                )}
                                                <div className="task-item__meta">
                                                    {task.duration && (
                                                        <span>
                                                            <Icon name="clock" size={12} />
                                                            {formatDuration(task.duration)}
                                                        </span>
                                                    )}
                                                    {task.day && (
                                                        <span>
                                                            <Icon name="calendar" size={12} />
                                                            {task.day}
                                                        </span>
                                                    )}
                                                    <span className="task-type-label">
                                                        {task.type?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Milestones */}
            {roadmap.milestones && roadmap.milestones.length > 0 && (
                <section className="milestones">
                    <h2>
                        <Icon name="trophy" size={20} style={{ marginRight: 8 }} />
                        Milestones
                    </h2>
                    <div className="milestones-list">
                        {roadmap.milestones.map((milestone, idx) => (
                            <div key={idx} className="milestone-card">
                                <div className="milestone-card__icon">
                                    <Icon name="flag" size={24} />
                                </div>
                                <div className="milestone-card__content">
                                    <h4>{milestone.title}</h4>
                                    <p>{milestone.criteria}</p>
                                    {milestone.targetDate && (
                                        <span className="milestone-date">
                                            <Icon name="calendar" size={12} />
                                            {milestone.targetDate}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default Roadmap;
