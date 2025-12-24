import React, { useState } from 'react';
import { mockRoadmap } from '../../services/mockData';
import './Roadmap.css';

/**
 * Roadmap Page Component
 * Personalized study roadmap with micro-schedule and milestones
 * 
 * TODO: Fetch roadmap from GET /api/student/roadmap
 * TODO: Update task status via PUT /api/roadmap/task/:id
 */
function Roadmap() {
    const roadmap = mockRoadmap;
    const [completedSubtasks, setCompletedSubtasks] = useState({});

    const toggleSubtask = (taskId, subtaskIndex) => {
        const key = `${taskId}-${subtaskIndex}`;
        setCompletedSubtasks((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const formatDuration = (minutes) => {
        if (minutes >= 60) {
            const hrs = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
        }
        return `${minutes}m`;
    };

    return (
        <div className="roadmap">
            {/* Header */}
            <header className="roadmap__header">
                <h1 className="roadmap__title">🗺️ Your Personalized Roadmap</h1>
                <p className="roadmap__subtitle">
                    AI-generated study plan tailored to strengthen your weak areas
                </p>
            </header>

            {/* Stats */}
            <section className="roadmap-stats">
                <div className="roadmap-stat">
                    <div className="roadmap-stat__icon">🎯</div>
                    <div className="roadmap-stat__value">{roadmap.daysUntilExam}</div>
                    <div className="roadmap-stat__label">Days Until Exam</div>
                </div>
                <div className="roadmap-stat">
                    <div className="roadmap-stat__icon">📚</div>
                    <div className="roadmap-stat__value">{roadmap.focusAreas.length}</div>
                    <div className="roadmap-stat__label">Focus Areas</div>
                </div>
                <div className="roadmap-stat">
                    <div className="roadmap-stat__icon">📋</div>
                    <div className="roadmap-stat__value">
                        {roadmap.weeklyPlan[0]?.tasks.length || 0}
                    </div>
                    <div className="roadmap-stat__label">Tasks This Week</div>
                </div>
                <div className="roadmap-stat">
                    <div className="roadmap-stat__icon">🏆</div>
                    <div className="roadmap-stat__value">{roadmap.milestones.length}</div>
                    <div className="roadmap-stat__label">Milestones</div>
                </div>
            </section>

            {/* Focus Areas */}
            <section className="focus-areas">
                {roadmap.focusAreas.map((area, index) => (
                    <span key={index} className="focus-tag">{area}</span>
                ))}
            </section>

            {/* Main Layout */}
            <div className="roadmap-layout">
                {/* Weekly Plan */}
                <section className="weekly-plan">
                    {roadmap.weeklyPlan.map((week) => (
                        <div key={week.week}>
                            <div className="weekly-plan__header">
                                <h2 className="weekly-plan__title">
                                    Week {week.week}: {week.theme}
                                </h2>
                                <span className="weekly-plan__dates">
                                    📅 {week.startDate} - {week.endDate}
                                </span>
                            </div>

                            <div className="task-list">
                                {week.tasks.map((task, taskIndex) => (
                                    <div
                                        key={task.id}
                                        className={`task-item ${task.status === 'completed' ? 'task-item--completed' : ''}`}
                                    >
                                        <div className="task-timeline">
                                            <span className="task-day">{task.day}</span>
                                            <div className="task-dot" />
                                            {taskIndex < week.tasks.length - 1 && (
                                                <div className="task-line" />
                                            )}
                                        </div>

                                        <div className="task-content">
                                            <div className="task-header">
                                                <h3 className="task-title">{task.title}</h3>
                                                <div className="task-badges">
                                                    <span className="task-badge task-badge--type">
                                                        {task.type.replace('_', ' ')}
                                                    </span>
                                                    <span className="task-badge task-badge--duration">
                                                        ⏱️ {formatDuration(task.duration)}
                                                    </span>
                                                    <span className={`task-badge task-badge--priority-${task.priority}`}>
                                                        {task.priority}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="subtask-list">
                                                {task.subtasks.map((subtask, subIndex) => {
                                                    const isCompleted = completedSubtasks[`${task.id}-${subIndex}`];
                                                    return (
                                                        <div
                                                            key={subIndex}
                                                            className={`subtask-item ${isCompleted ? 'completed' : ''}`}
                                                        >
                                                            <div
                                                                className={`subtask-checkbox ${isCompleted ? 'checked' : ''}`}
                                                                onClick={() => toggleSubtask(task.id, subIndex)}
                                                            />
                                                            {subtask}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>

                {/* Milestones Sidebar */}
                <aside className="milestones-sidebar">
                    <div className="milestones-card">
                        <h3 className="milestones-card__title">🏆 Milestones</h3>
                        {roadmap.milestones.map((milestone) => (
                            <div key={milestone.id} className="milestone-item">
                                <div className="milestone-header">
                                    <span className="milestone-title">{milestone.title}</span>
                                    <span className="milestone-progress-value">{milestone.progress}%</span>
                                </div>
                                <div className="milestone-target">Target: {milestone.target}</div>
                                <div className="milestone-progress-bar">
                                    <div
                                        className="milestone-progress-fill"
                                        style={{ width: `${milestone.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="ai-insights-card">
                        <h3 className="ai-insights-card__title">🤖 AI Insights</h3>
                        <p className="ai-insights-card__content">
                            Based on your test performance, focus on <strong>Electrochemistry</strong> first.
                            Your time management in this area needs improvement.
                            Aim for <strong>15 practice problems daily</strong> for optimal progress.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default Roadmap;
