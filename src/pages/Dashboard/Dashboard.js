import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    mockStudentProfile,
    mockStrengthWeaknessTags,
    examTypes
} from '../../services/mockData';
import { studentService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/Icon/Icon';
import './Dashboard.css';

/**
 * Dashboard Page - Premium Student Overview
 */
function Dashboard() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [profile, setProfile] = useState(mockStudentProfile);
    const [tags, setTags] = useState(mockStrengthWeaknessTags);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [isAuthenticated]);

    const fetchProfile = async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        try {
            const result = await studentService.getProfile();

            if (result.success && result.profile) {
                const formattedProfile = studentService.formatDashboardProfile(result.profile);
                if (formattedProfile) {
                    setProfile(formattedProfile);

                    if (result.profile.performance) {
                        const performance = result.profile.performance;
                        const strengthTags = performance.strongTopics?.map((topic, idx) => ({
                            id: `str-${idx}`,
                            topic,
                            score: 80 + Math.random() * 15
                        })) || mockStrengthWeaknessTags.strengths;

                        const weaknessTags = performance.weakTopics?.map((topic, idx) => ({
                            id: `weak-${idx}`,
                            topic,
                            score: 30 + Math.random() * 25
                        })) || mockStrengthWeaknessTags.weaknesses;

                        setTags({ strengths: strengthTags, weaknesses: weaknessTags });
                    }
                }
            }
        } catch (err) {
            console.warn('Using mock data:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            setProfile(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                avatar: user.avatar || prev.avatar,
            }));
        }
    }, [user]);

    const handleStartTest = () => {
        navigate('/test');
    };

    const firstName = profile.name.split(' ')[0];

    return (
        <div className="db-page">
            {/* Hero Section */}
            <div className="db-hero">
                <div className="db-hero__bg">
                    <div className="db-hero__gradient"></div>
                    <div className="db-hero__pattern"></div>
                </div>

                <div className="db-hero__content">
                    <span className="db-hero__greeting">Welcome back</span>
                    <h1 className="db-hero__title">
                        Hello, <span>{firstName}</span>
                    </h1>
                    <p className="db-hero__subtitle">
                        Let's continue your preparation journey. You're making great progress!
                    </p>
                </div>

                <div className="db-hero__avatar">
                    {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name} />
                    ) : (
                        <div className="db-avatar-placeholder">
                            {firstName.charAt(0)}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="db-stats">
                <div className="db-stat" style={{ '--stat-color': '#8b5cf6' }}>
                    <div className="db-stat__icon">
                        <Icon name="clipboard" size={24} />
                    </div>
                    <div className="db-stat__content">
                        <span className="db-stat__value">{profile.stats.testsCompleted}</span>
                        <span className="db-stat__label">Tests Completed</span>
                    </div>
                </div>
                <div className="db-stat" style={{ '--stat-color': '#10b981' }}>
                    <div className="db-stat__icon">
                        <Icon name="chart" size={24} />
                    </div>
                    <div className="db-stat__content">
                        <span className="db-stat__value">{profile.stats.averageScore}%</span>
                        <span className="db-stat__label">Average Score</span>
                    </div>
                </div>
                <div className="db-stat" style={{ '--stat-color': '#f59e0b' }}>
                    <div className="db-stat__icon">
                        <Icon name="clock" size={24} />
                    </div>
                    <div className="db-stat__content">
                        <span className="db-stat__value">{profile.stats.studyHours}h</span>
                        <span className="db-stat__label">Study Hours</span>
                    </div>
                </div>
                <div className="db-stat" style={{ '--stat-color': '#3b82f6' }}>
                    <div className="db-stat__icon">
                        <Icon name="zap" size={24} />
                    </div>
                    <div className="db-stat__content">
                        <span className="db-stat__value">{profile.stats.currentStreak}</span>
                        <span className="db-stat__label">Day Streak</span>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="db-grid">
                {/* CAT Sections */}
                <div className="db-sections">
                    <h2>
                        <Icon name="target" size={20} />
                        CAT 2025 Sections
                    </h2>

                    <div className="db-sections__cards">
                        {examTypes.CAT.sections.map((section) => (
                            <div
                                key={section.id}
                                className="db-section-card"
                                style={{
                                    '--section-color': section.id === 'varc' ? '#8b5cf6'
                                        : section.id === 'dilr' ? '#f59e0b' : '#10b981'
                                }}
                            >
                                <div className="db-section-card__icon">
                                    <Icon
                                        name={section.id === 'varc' ? 'book'
                                            : section.id === 'dilr' ? 'chart' : 'calculator'}
                                        size={28}
                                    />
                                </div>
                                <h3>{section.name}</h3>
                                <p>{section.fullName}</p>
                                <span className="db-section-card__meta">
                                    {section.questions} Qs • {section.duration} min
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="db-cta">
                        <div className="db-cta__content">
                            <h3>Ready for a Smart Mock Test?</h3>
                            <p>AI-powered analysis to identify your improvement areas</p>
                        </div>
                        <button className="db-btn db-btn--hero" onClick={handleStartTest}>
                            Start Test
                            <Icon name="arrowRight" size={18} />
                        </button>
                    </div>
                </div>

                {/* Strength & Weakness */}
                <div className="db-tags">
                    <div className="db-tags__section">
                        <h3 className="db-tags__title db-tags__title--strength">
                            <Icon name="trophy" size={18} />
                            Your Strengths
                        </h3>
                        <div className="db-tags__list">
                            {tags.strengths.map((tag) => (
                                <span key={tag.id} className="db-tag db-tag--strength">
                                    {tag.topic}
                                    <span className="db-tag__score">{Math.round(tag.score)}%</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="db-tags__section">
                        <h3 className="db-tags__title db-tags__title--weakness">
                            <Icon name="target" size={18} />
                            Focus Areas
                        </h3>
                        <div className="db-tags__list">
                            {tags.weaknesses.map((tag) => (
                                <span key={tag.id} className="db-tag db-tag--weakness">
                                    {tag.topic}
                                    <span className="db-tag__score">{Math.round(tag.score)}%</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="db-actions">
                <div className="db-action" onClick={() => navigate('/test')}>
                    <div className="db-action__icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
                        <Icon name="clipboard" size={24} />
                    </div>
                    <div className="db-action__content">
                        <h4>Take a Test</h4>
                        <p>Full mock or sectional</p>
                    </div>
                    <Icon name="arrowRight" size={18} className="db-action__arrow" />
                </div>
                <div className="db-action" onClick={() => navigate('/previous-tests')}>
                    <div className="db-action__icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                        <Icon name="clock" size={24} />
                    </div>
                    <div className="db-action__content">
                        <h4>Previous Tests</h4>
                        <p>View your history</p>
                    </div>
                    <Icon name="arrowRight" size={18} className="db-action__arrow" />
                </div>
                <div className="db-action" onClick={() => navigate('/agents')}>
                    <div className="db-action__icon" style={{ background: '#10b98120', color: '#10b981' }}>
                        <Icon name="agents" size={24} />
                    </div>
                    <div className="db-action__content">
                        <h4>AI Agents</h4>
                        <p>Get AI insights</p>
                    </div>
                    <Icon name="arrowRight" size={18} className="db-action__arrow" />
                </div>
                <div className="db-action" onClick={() => navigate('/roadmap')}>
                    <div className="db-action__icon" style={{ background: '#3b82f620', color: '#3b82f6' }}>
                        <Icon name="roadmap" size={24} />
                    </div>
                    <div className="db-action__content">
                        <h4>Study Roadmap</h4>
                        <p>Personalized plan</p>
                    </div>
                    <Icon name="arrowRight" size={18} className="db-action__arrow" />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
