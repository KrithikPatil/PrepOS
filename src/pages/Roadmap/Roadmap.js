import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services';
import Icon from '../../components/Icon/Icon';
import './Roadmap.css';

/**
 * Roadmap Page - Premium Personalized Study Plan
 */
function Roadmap() {
    const navigate = useNavigate();
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedWeek, setExpandedWeek] = useState(null);

    useEffect(() => {
        fetchRoadmap();
    }, []);

    const fetchRoadmap = async () => {
        try {
            const result = await studentService.getRoadmap();

            if (result.success && result.roadmap) {
                setRoadmap(result.roadmap);
                if (result.roadmap.weeklyPlan?.length > 0) {
                    setExpandedWeek(0);
                }
            } else {
                setError(result.error || 'No roadmap available');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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

    // Loading
    if (loading) {
        return (
            <div className="rm-page">
                <div className="rm-loading">
                    <div className="rm-loading__spinner"></div>
                    <p>Loading your personalized roadmap...</p>
                </div>
            </div>
        );
    }

    // Shared Hero Component
    const HeroSection = ({ hasData }) => (
        <div className="rm-hero">
            <div className="rm-hero__bg">
                <div className="rm-hero__gradient"></div>
                <div className="rm-hero__pattern"></div>
            </div>

            <div className="rm-hero__content">
                <h1 className="rm-hero__title">
                    Study <span>Roadmap</span>
                </h1>
                <p className="rm-hero__subtitle">
                    {hasData
                        ? `${roadmap?.daysUntilExam || '60'} days until CAT - Your AI-generated study plan`
                        : 'Get a personalized study plan based on your performance'}
                </p>
            </div>

            {hasData && roadmap?.daysUntilExam && (
                <div className="rm-hero__countdown">
                    <div className="rm-countdown">
                        <span className="rm-countdown__value">{roadmap.daysUntilExam}</span>
                        <span className="rm-countdown__label">Days Left</span>
                    </div>
                </div>
            )}
        </div>
    );

    // Error / Empty State
    if (error || !roadmap || !roadmap.weeklyPlan || roadmap.weeklyPlan.length === 0) {
        return (
            <div className="rm-page">
                <HeroSection hasData={false} />

                <div className="rm-empty">
                    <div className="rm-empty__illustration">
                        <div className="rm-empty__circle">
                            <Icon name="roadmap" size={64} />
                        </div>
                        <div className="rm-empty__orbit">
                            <div className="rm-empty__dot"></div>
                        </div>
                    </div>
                    <h2>No Roadmap Yet</h2>
                    <p>Take a mock test first, and our AI Strategist will create a personalized study plan for you.</p>
                    <button className="rm-btn rm-btn--hero" onClick={() => navigate('/test')}>
                        <Icon name="plus" size={20} />
                        Take a Mock Test
                    </button>

                    <div className="rm-empty__features">
                        <div className="rm-feature">
                            <div className="rm-feature__icon">
                                <Icon name="calendar" size={24} />
                            </div>
                            <h4>Weekly Schedule</h4>
                            <p>Structured week-by-week plan</p>
                        </div>
                        <div className="rm-feature">
                            <div className="rm-feature__icon">
                                <Icon name="target" size={24} />
                            </div>
                            <h4>Focus Areas</h4>
                            <p>Topics that need attention</p>
                        </div>
                        <div className="rm-feature">
                            <div className="rm-feature__icon">
                                <Icon name="trophy" size={24} />
                            </div>
                            <h4>Milestones</h4>
                            <p>Track your progress goals</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rm-page">
            <HeroSection hasData={true} />

            {/* Focus Areas */}
            {roadmap.focusAreas && roadmap.focusAreas.length > 0 && (
                <section className="rm-focus">
                    <h2>
                        <Icon name="target" size={20} />
                        Focus Areas
                    </h2>
                    <div className="rm-focus__tags">
                        {roadmap.focusAreas.map((area, idx) => (
                            <span key={idx} className="rm-focus__tag">{area}</span>
                        ))}
                    </div>
                </section>
            )}

            {/* Weekly Plan */}
            <section className="rm-weeks">
                <h2>
                    <Icon name="calendar" size={20} />
                    Weekly Schedule
                </h2>

                <div className="rm-weeks__list">
                    {roadmap.weeklyPlan.map((week, weekIdx) => (
                        <div
                            key={weekIdx}
                            className={`rm-week ${expandedWeek === weekIdx ? 'expanded' : ''}`}
                        >
                            <div
                                className="rm-week__header"
                                onClick={() => setExpandedWeek(expandedWeek === weekIdx ? null : weekIdx)}
                            >
                                <div className="rm-week__info">
                                    <span className="rm-week__number">Week {weekIdx + 1}</span>
                                    <h3>{week.theme || `Week ${weekIdx + 1} Tasks`}</h3>
                                </div>
                                <div className="rm-week__meta">
                                    <span>{week.tasks?.length || 0} tasks</span>
                                    <Icon name={expandedWeek === weekIdx ? 'chevronUp' : 'chevronDown'} size={20} />
                                </div>
                            </div>

                            {expandedWeek === weekIdx && week.tasks && (
                                <div className="rm-week__tasks">
                                    {week.tasks.map((task, taskIdx) => (
                                        <div
                                            key={taskIdx}
                                            className="rm-task"
                                            style={{ '--task-color': getTaskTypeColor(task.type) }}
                                        >
                                            <div className="rm-task__icon">
                                                <Icon name={getTaskTypeIcon(task.type)} size={18} />
                                            </div>
                                            <div className="rm-task__content">
                                                <h4>{task.title}</h4>
                                                {task.description && <p>{task.description}</p>}
                                                <div className="rm-task__meta">
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
                                                    <span className="rm-task__type">
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
                <section className="rm-milestones">
                    <h2>
                        <Icon name="trophy" size={20} />
                        Milestones
                    </h2>
                    <div className="rm-milestones__grid">
                        {roadmap.milestones.map((milestone, idx) => (
                            <div key={idx} className="rm-milestone">
                                <div className="rm-milestone__icon">
                                    <Icon name="flag" size={24} />
                                </div>
                                <div className="rm-milestone__content">
                                    <h4>{milestone.title}</h4>
                                    <p>{milestone.criteria}</p>
                                    {milestone.targetDate && (
                                        <span className="rm-milestone__date">
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
