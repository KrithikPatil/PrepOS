import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testService } from '../../services';
import Icon from '../../components/Icon/Icon';
import './TestSelection.css';

/**
 * Test Selection Page - CAT Exam
 * Fetches tests from real backend API
 */
function TestSelection() {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSections, setSelectedSections] = useState([]);

    // CAT sections
    const sections = [
        { id: 'VARC', name: 'Verbal Ability & Reading Comprehension', icon: 'book' },
        { id: 'DILR', name: 'Data Interpretation & Logical Reasoning', icon: 'chart' },
        { id: 'QA', name: 'Quantitative Ability', icon: 'calculator' }
    ];

    const categories = [
        { id: 'all', label: 'All Tests', icon: 'list' },
        { id: 'full', label: 'Full Mock', icon: 'clipboard' },
        { id: 'sectional', label: 'Sectional', icon: 'book' },
    ];

    // Fetch tests from API
    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true);
            try {
                const result = await testService.getAvailableTests();
                if (result.success) {
                    setTests(result.tests);
                } else {
                    setError(result.error || 'Failed to load tests');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    const filteredTests = selectedCategory === 'all'
        ? tests
        : tests.filter(t => t.type === selectedCategory);

    const toggleSection = (sectionId) => {
        setSelectedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(s => s !== sectionId)
                : [...prev, sectionId]
        );
    };

    const handleStartTest = async (testId) => {
        navigate(`/test/start?testId=${testId}`);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'var(--accent-success)';
            case 'medium': return 'var(--accent-warning)';
            case 'hard': return 'var(--accent-danger)';
            default: return 'var(--text-secondary)';
        }
    };

    if (loading) {
        return (
            <div className="test-selection">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading available tests...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="test-selection">
                <div className="error-state">
                    <Icon name="alertTriangle" size={48} />
                    <h2>Failed to load tests</h2>
                    <p>{error}</p>
                    <button className="btn btn--primary" onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="test-selection">
            {/* Header */}
            <header className="test-selection__header">
                <h1 className="test-selection__title">
                    <Icon name="clipboard" size={32} className="text-accent" style={{ marginRight: 12 }} />
                    CAT Mock Tests
                </h1>
                <p className="test-selection__subtitle">
                    Practice with full-length mocks and sectional tests for VARC, DILR, and QA
                </p>
            </header>

            {/* Category Filters */}
            <section className="category-section">
                <div className="category-filters">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            <Icon name={cat.icon} size={18} />
                            {cat.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Available Tests Grid */}
            <section className="available-tests-section">
                <h2 className="section-title">
                    <Icon name="list" size={24} style={{ marginRight: 8 }} />
                    Available Tests ({filteredTests.length})
                </h2>

                {filteredTests.length === 0 ? (
                    <div className="empty-state">
                        <Icon name="clipboard" size={48} />
                        <p>No tests available in this category</p>
                    </div>
                ) : (
                    <div className="test-cards-grid">
                        {filteredTests.map((test) => (
                            <div key={test.id} className="test-card hover-lift">
                                <div className="test-card__type-badge">
                                    {test.type === 'full' ? 'Full Mock' : test.section || 'Sectional'}
                                </div>
                                <h3 className="test-card__name">{test.name}</h3>
                                <div className="test-card__meta">
                                    <span className="test-card__type">{test.type}</span>
                                </div>
                                <div className="test-card__stats">
                                    <div className="stat">
                                        <Icon name="clock" size={16} />
                                        <span>{test.duration} min</span>
                                    </div>
                                    <div className="stat">
                                        <Icon name="list" size={16} />
                                        <span>{test.totalQuestions} Questions</span>
                                    </div>
                                    <div className="stat">
                                        <Icon name="chart" size={16} />
                                        <span>{test.totalMarks} Marks</span>
                                    </div>
                                </div>
                                <button
                                    className="btn btn--primary btn-shine"
                                    onClick={() => handleStartTest(test.id)}
                                >
                                    Start Test
                                    <Icon name="arrowRight" size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* CAT Sections Info */}
            <section className="sections-info">
                <h2 className="section-title">
                    <Icon name="book" size={24} style={{ marginRight: 8 }} />
                    CAT 2025 Sections
                </h2>
                <div className="section-cards">
                    {sections.map((section) => (
                        <div key={section.id} className="section-info-card">
                            <div className="section-info-card__icon">
                                <Icon name={section.icon} size={28} />
                            </div>
                            <div className="section-info-card__content">
                                <h3>{section.id}</h3>
                                <p>{section.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default TestSelection;
