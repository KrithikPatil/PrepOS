import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    mockStudentProfile,
    mockStrengthWeaknessTags,
    examTypes
} from '../../services/mockData';
import './Dashboard.css';

/**
 * Dashboard Page Component
 * Student overview with exam selection and performance insights
 * 
 * TODO: Fetch student profile from /api/student/profile
 * TODO: Fetch strength/weakness tags from /api/student/analytics/tags
 */
function Dashboard() {
    const navigate = useNavigate();
    const [selectedExam, setSelectedExam] = useState('JEE');

    const profile = mockStudentProfile;
    const tags = mockStrengthWeaknessTags;

    const handleStartTest = () => {
        // TODO: Fetch recommended test from /api/tests/recommended
        navigate('/test');
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard__header">
                <p className="dashboard__greeting">Welcome back</p>
                <h1 className="dashboard__title">
                    Hello, <span>{profile.name.split(' ')[0]}</span> 👋
                </h1>
                <p className="dashboard__subtitle">
                    Let's continue your preparation journey. You're making great progress!
                </p>
            </header>

            {/* Stats Cards */}
            <section className="dashboard__stats">
                <div className="stat-card" style={{ '--index': 0 }}>
                    <div className="stat-card__icon stat-card__icon--primary">📝</div>
                    <div className="stat-card__value">{profile.stats.testsCompleted}</div>
                    <div className="stat-card__label">Tests Completed</div>
                </div>
                <div className="stat-card" style={{ '--index': 1 }}>
                    <div className="stat-card__icon stat-card__icon--success">📊</div>
                    <div className="stat-card__value">{profile.stats.averageScore}%</div>
                    <div className="stat-card__label">Average Score</div>
                </div>
                <div className="stat-card" style={{ '--index': 2 }}>
                    <div className="stat-card__icon stat-card__icon--warning">⏱️</div>
                    <div className="stat-card__value">{profile.stats.studyHours}h</div>
                    <div className="stat-card__label">Study Hours</div>
                </div>
                <div className="stat-card" style={{ '--index': 3 }}>
                    <div className="stat-card__icon stat-card__icon--info">🔥</div>
                    <div className="stat-card__value">{profile.stats.currentStreak}</div>
                    <div className="stat-card__label">Day Streak</div>
                </div>
            </section>

            {/* Main Grid */}
            <div className="dashboard__grid">
                {/* Exam Selection & CTA */}
                <div className="exam-section">
                    <h2 className="exam-section__title">
                        🎯 Select Your Exam
                    </h2>

                    <div className="exam-cards">
                        {Object.values(examTypes).map((exam) => (
                            <div
                                key={exam.name}
                                className={`exam-card ${selectedExam === exam.name ? 'active' : ''}`}
                                onClick={() => setSelectedExam(exam.name)}
                            >
                                <div className="exam-card__icon">{exam.icon}</div>
                                <div className="exam-card__name">{exam.name}</div>
                                <div className="exam-card__full-name">{exam.fullName}</div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="cta-section">
                        <div className="cta-content">
                            <h3>Ready for a Smart Mock Test?</h3>
                            <p>AI-powered analysis to identify your improvement areas</p>
                        </div>
                        <button className="cta-button" onClick={handleStartTest}>
                            Start Test
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Strength & Weakness Tags */}
                <div className="tags-section">
                    <div className="strength-section">
                        <h3 className="tags-section__title tags-section__title--strength">
                            💪 Your Strengths
                        </h3>
                        <div className="tags-list">
                            {tags.strengths.map((tag) => (
                                <span key={tag.id} className="tag tag--strength">
                                    {tag.topic}
                                    <span className="tag__score">{tag.score}%</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="weakness-section">
                        <h3 className="tags-section__title tags-section__title--weakness">
                            🎯 Focus Areas
                        </h3>
                        <div className="tags-list">
                            {tags.weaknesses.map((tag) => (
                                <span key={tag.id} className="tag tag--weakness">
                                    {tag.topic}
                                    <span className="tag__score">{tag.score}%</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
