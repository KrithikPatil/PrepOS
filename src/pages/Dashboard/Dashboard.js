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
 * Dashboard Page Component
 * Student overview with exam selection and performance insights
 * Uses real API with fallback to mock data
 */
function Dashboard() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [profile, setProfile] = useState(mockStudentProfile);
    const [tags, setTags] = useState(mockStrengthWeaknessTags);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch real profile data on mount
    useEffect(() => {
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

                        // Update strength/weakness tags from performance data
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
                setError('Using demo data');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthenticated]);

    // Update profile with user data from auth context
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

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard__header">
                <p className="dashboard__greeting">Welcome back</p>
                <h1 className="dashboard__title">
                    Hello, <span>{profile.name.split(' ')[0]}</span>
                </h1>
                <p className="dashboard__subtitle">
                    Let's continue your preparation journey. You're making great progress!
                </p>
            </header>

            {/* Stats Cards */}
            <section className="dashboard__stats">
                <div className="stat-card hover-lift" style={{ '--index': 0 }}>
                    <div className="stat-card__icon stat-card__icon--primary">
                        <Icon name="clipboard" size={24} />
                    </div>
                    <div className="stat-card__value">{profile.stats.testsCompleted}</div>
                    <div className="stat-card__label">Tests Completed</div>
                </div>
                <div className="stat-card hover-lift" style={{ '--index': 1 }}>
                    <div className="stat-card__icon stat-card__icon--success">
                        <Icon name="chart" size={24} />
                    </div>
                    <div className="stat-card__value">{profile.stats.averageScore}%</div>
                    <div className="stat-card__label">Average Score</div>
                </div>
                <div className="stat-card hover-lift" style={{ '--index': 2 }}>
                    <div className="stat-card__icon stat-card__icon--warning">
                        <Icon name="clock" size={24} />
                    </div>
                    <div className="stat-card__value">{profile.stats.studyHours}h</div>
                    <div className="stat-card__label">Study Hours</div>
                </div>
                <div className="stat-card hover-lift" style={{ '--index': 3 }}>
                    <div className="stat-card__icon stat-card__icon--info">
                        <Icon name="streak" size={24} />
                    </div>
                    <div className="stat-card__value">{profile.stats.currentStreak}</div>
                    <div className="stat-card__label">Day Streak</div>
                </div>
            </section>

            {/* Main Grid */}
            <div className="dashboard__grid">
                {/* CAT Sections Overview */}
                <div className="exam-section">
                    <h2 className="exam-section__title">
                        <Icon name="cat" size={28} className="text-accent" style={{ marginRight: 8 }} />
                        CAT 2025 Sections
                    </h2>

                    <div className="exam-cards">
                        {examTypes.CAT.sections.map((section) => (
                            <div
                                key={section.id}
                                className="exam-card hover-glow active"
                                style={{ borderColor: section.id === 'varc' ? '#6366f1' : section.id === 'dilr' ? '#f59e0b' : '#10b981' }}
                            >
                                <div className="exam-card__icon">
                                    <Icon name={section.id === 'varc' ? 'book' : section.id === 'dilr' ? 'chart' : 'calculator'} size={32} />
                                </div>
                                <div className="exam-card__name">{section.name}</div>
                                <div className="exam-card__full-name">{section.fullName}</div>
                                <div className="exam-card__meta">{section.questions} Qs • {section.duration} min</div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="cta-section">
                        <div className="cta-content">
                            <h3>Ready for a Smart Mock Test?</h3>
                            <p>AI-powered analysis to identify your improvement areas</p>
                        </div>
                        <button className="cta-button btn-shine" onClick={handleStartTest}>
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
                            <Icon name="trophy" size={20} style={{ marginRight: 8 }} />
                            Your Strengths
                        </h3>
                        <div className="tags-list">
                            {tags.strengths.map((tag) => (
                                <span key={tag.id} className="tag tag--strength">
                                    {tag.topic}
                                    <span className="tag__score">{Math.round(tag.score)}%</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="weakness-section">
                        <h3 className="tags-section__title tags-section__title--weakness">
                            <Icon name="crosshair" size={20} style={{ marginRight: 8 }} />
                            Focus Areas
                        </h3>
                        <div className="tags-list">
                            {tags.weaknesses.map((tag) => (
                                <span key={tag.id} className="tag tag--weakness">
                                    {tag.topic}
                                    <span className="tag__score">{Math.round(tag.score)}%</span>
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
