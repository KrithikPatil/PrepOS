import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testService } from '../../services';
import Icon from '../../components/Icon/Icon';
import './TestSelection.css';

/**
 * Test Selection Page - Premium CAT Mock Test Hub
 */
function TestSelection() {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Create Test Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createConfig, setCreateConfig] = useState({
        name: '',
        sections: [],
        difficulty: 'medium',
        questionCount: 20,
        duration: 40,
        topics: '',
    });

    const categories = [
        { id: 'all', label: 'All Tests', icon: 'list' },
        { id: 'full', label: 'Full Mock', icon: 'clipboard' },
        { id: 'sectional', label: 'Sectional', icon: 'book' },
        { id: 'ai', label: 'AI Generated', icon: 'agents' },
    ];

    const sectionOptions = [
        { id: 'VARC', name: 'VARC', fullName: 'Verbal Ability & RC', color: '#8b5cf6' },
        { id: 'DILR', name: 'DILR', fullName: 'Data Interpretation & LR', color: '#f59e0b' },
        { id: 'QA', name: 'QA', fullName: 'Quantitative Ability', color: '#10b981' },
    ];

    const difficultyOptions = [
        { id: 'easy', label: 'Easy', color: '#10b981' },
        { id: 'medium', label: 'Medium', color: '#f59e0b' },
        { id: 'hard', label: 'Hard', color: '#ef4444' },
        { id: 'mixed', label: 'Mixed', color: '#8b5cf6' },
    ];

    // Fetch tests
    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const result = await testService.getAvailableTests();
            if (result.success) {
                setTests(result.tests || []);
            } else {
                setError(result.error || 'Failed to load tests');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredTests = selectedCategory === 'all'
        ? tests
        : tests.filter(t => t.type === selectedCategory || (selectedCategory === 'ai' && t.isAIGenerated));

    const handleStartTest = (testId) => {
        navigate(`/test/start?testId=${testId}`);
    };

    const toggleSection = (sectionId) => {
        setCreateConfig(prev => ({
            ...prev,
            sections: prev.sections.includes(sectionId)
                ? prev.sections.filter(s => s !== sectionId)
                : [...prev.sections, sectionId]
        }));
    };

    const handleCreateTest = async () => {
        if (createConfig.sections.length === 0) {
            alert('Please select at least one section');
            return;
        }

        setCreating(true);

        try {
            const result = await testService.createAITest({
                name: createConfig.name || `Custom Test - ${new Date().toLocaleDateString()}`,
                sections: createConfig.sections,
                difficulty: createConfig.difficulty,
                questionCount: createConfig.questionCount,
                duration: createConfig.duration,
                focusTopics: createConfig.topics.split(',').map(t => t.trim()).filter(t => t),
            });

            if (result.success) {
                setShowCreateModal(false);
                // Refresh tests to show new one
                await fetchTests();
                // Optionally start the test immediately
                if (result.testId) {
                    handleStartTest(result.testId);
                }
            } else {
                alert('Failed to create test: ' + result.error);
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setCreating(false);
        }
    };

    const getSectionColor = (section) => {
        const colors = { VARC: '#8b5cf6', DILR: '#f59e0b', QA: '#10b981' };
        return colors[section] || '#6b7280';
    };

    // Loading
    if (loading) {
        return (
            <div className="ts-page">
                <div className="ts-loading">
                    <div className="ts-loading__spinner"></div>
                    <p>Loading tests...</p>
                </div>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="ts-page">
                <div className="ts-error">
                    <Icon name="alertTriangle" size={48} />
                    <h2>Failed to load tests</h2>
                    <p>{error}</p>
                    <button className="ts-btn ts-btn--primary" onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="ts-page">
            {/* Hero Section */}
            <div className="ts-hero">
                <div className="ts-hero__bg">
                    <div className="ts-hero__gradient"></div>
                    <div className="ts-hero__pattern"></div>
                </div>

                <div className="ts-hero__content">
                    <h1 className="ts-hero__title">
                        CAT Mock <span>Tests</span>
                    </h1>
                    <p className="ts-hero__subtitle">
                        Practice with curated mock tests or let AI generate a personalized test based on your needs
                    </p>

                    <div className="ts-hero__actions">
                        <button
                            className="ts-btn ts-btn--hero"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <Icon name="plus" size={20} />
                            Create Your Own Test
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="ts-hero__stats">
                    <div className="ts-stat">
                        <span className="ts-stat__value">{tests.length}</span>
                        <span className="ts-stat__label">Tests Available</span>
                    </div>
                    <div className="ts-stat">
                        <span className="ts-stat__value">3</span>
                        <span className="ts-stat__label">Sections</span>
                    </div>
                    <div className="ts-stat">
                        <span className="ts-stat__value">AI</span>
                        <span className="ts-stat__label">Powered</span>
                    </div>
                </div>
            </div>

            {/* Category Filters */}
            <div className="ts-filters">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        className={`ts-filter ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                    >
                        <Icon name={cat.icon} size={18} />
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Tests Grid */}
            <div className="ts-tests">
                <div className="ts-tests__header">
                    <h2>
                        {selectedCategory === 'all' ? 'All Tests' : categories.find(c => c.id === selectedCategory)?.label}
                        <span className="ts-tests__count">{filteredTests.length}</span>
                    </h2>
                </div>

                {filteredTests.length === 0 ? (
                    <div className="ts-empty">
                        <div className="ts-empty__icon">
                            <Icon name="clipboard" size={48} />
                        </div>
                        <h3>No tests in this category</h3>
                        <p>Create a custom AI-generated test to get started</p>
                        <button className="ts-btn ts-btn--primary" onClick={() => setShowCreateModal(true)}>
                            <Icon name="plus" size={16} />
                            Create Test
                        </button>
                    </div>
                ) : (
                    <div className="ts-grid">
                        {/* Create New Test Card */}
                        <div className="ts-card ts-card--create" onClick={() => setShowCreateModal(true)}>
                            <div className="ts-card__create-icon">
                                <Icon name="plus" size={32} />
                            </div>
                            <h3>Create Custom Test</h3>
                            <p>AI generates questions based on your preferences</p>
                        </div>

                        {/* Test Cards */}
                        {filteredTests.map((test, index) => (
                            <div
                                key={test.id}
                                className="ts-card"
                                style={{ '--card-delay': `${index * 0.05}s` }}
                            >
                                {test.isAIGenerated && (
                                    <div className="ts-card__ai-badge">
                                        <Icon name="agents" size={12} />
                                        AI Generated
                                    </div>
                                )}

                                <div className="ts-card__header">
                                    <div
                                        className="ts-card__type"
                                        style={{
                                            background: test.type === 'full'
                                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                                : `linear-gradient(135deg, ${getSectionColor(test.section)}, ${getSectionColor(test.section)}88)`
                                        }}
                                    >
                                        {test.type === 'full' ? 'Full Mock' : test.section || 'Sectional'}
                                    </div>
                                </div>

                                <h3 className="ts-card__name">{test.name}</h3>

                                <div className="ts-card__stats">
                                    <div className="ts-card__stat">
                                        <Icon name="clock" size={14} />
                                        <span>{test.duration} min</span>
                                    </div>
                                    <div className="ts-card__stat">
                                        <Icon name="list" size={14} />
                                        <span>{test.totalQuestions} Qs</span>
                                    </div>
                                    <div className="ts-card__stat">
                                        <Icon name="target" size={14} />
                                        <span>{test.totalMarks} marks</span>
                                    </div>
                                </div>

                                <button
                                    className="ts-btn ts-btn--primary ts-btn--full"
                                    onClick={() => handleStartTest(test.id)}
                                >
                                    Start Test
                                    <Icon name="arrowRight" size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section Info */}
            <div className="ts-sections">
                <h2>CAT 2025 Sections</h2>
                <div className="ts-sections__grid">
                    {sectionOptions.map((section) => (
                        <div
                            key={section.id}
                            className="ts-section-card"
                            style={{ '--section-color': section.color }}
                        >
                            <div className="ts-section-card__bar"></div>
                            <h3>{section.id}</h3>
                            <p>{section.fullName}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Test Modal */}
            {showCreateModal && (
                <div className="ts-modal-overlay" onClick={() => !creating && setShowCreateModal(false)}>
                    <div className="ts-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ts-modal__header">
                            <div>
                                <h2>Create Your Own Test</h2>
                                <p>AI will generate questions based on your preferences</p>
                            </div>
                            <button
                                className="ts-modal__close"
                                onClick={() => !creating && setShowCreateModal(false)}
                            >
                                <Icon name="x" size={24} />
                            </button>
                        </div>

                        <div className="ts-modal__body">
                            {/* Test Name */}
                            <div className="ts-form-group">
                                <label>Test Name (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., QA Practice Set 1"
                                    value={createConfig.name}
                                    onChange={(e) => setCreateConfig(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            {/* Sections */}
                            <div className="ts-form-group">
                                <label>Select Sections *</label>
                                <div className="ts-section-selector">
                                    {sectionOptions.map((section) => (
                                        <button
                                            key={section.id}
                                            className={`ts-section-btn ${createConfig.sections.includes(section.id) ? 'selected' : ''}`}
                                            style={{ '--btn-color': section.color }}
                                            onClick={() => toggleSection(section.id)}
                                        >
                                            <Icon name={createConfig.sections.includes(section.id) ? 'check' : 'plus'} size={16} />
                                            {section.id}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div className="ts-form-group">
                                <label>Difficulty Level</label>
                                <div className="ts-difficulty-selector">
                                    {difficultyOptions.map((diff) => (
                                        <button
                                            key={diff.id}
                                            className={`ts-diff-btn ${createConfig.difficulty === diff.id ? 'selected' : ''}`}
                                            style={{ '--diff-color': diff.color }}
                                            onClick={() => setCreateConfig(prev => ({ ...prev, difficulty: diff.id }))}
                                        >
                                            {diff.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Questions and Duration */}
                            <div className="ts-form-row">
                                <div className="ts-form-group">
                                    <label>Number of Questions</label>
                                    <select
                                        value={createConfig.questionCount}
                                        onChange={(e) => setCreateConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                                    >
                                        <option value={10}>10 Questions</option>
                                        <option value={15}>15 Questions</option>
                                        <option value={20}>20 Questions</option>
                                        <option value={30}>30 Questions</option>
                                        <option value={50}>50 Questions</option>
                                    </select>
                                </div>

                                <div className="ts-form-group">
                                    <label>Duration (minutes)</label>
                                    <select
                                        value={createConfig.duration}
                                        onChange={(e) => setCreateConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                                    >
                                        <option value={20}>20 minutes</option>
                                        <option value={30}>30 minutes</option>
                                        <option value={40}>40 minutes</option>
                                        <option value={60}>60 minutes</option>
                                        <option value={90}>90 minutes</option>
                                        <option value={120}>120 minutes</option>
                                    </select>
                                </div>
                            </div>

                            {/* Focus Topics */}
                            <div className="ts-form-group">
                                <label>Focus Topics (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Probability, Percentages, Para Jumbles"
                                    value={createConfig.topics}
                                    onChange={(e) => setCreateConfig(prev => ({ ...prev, topics: e.target.value }))}
                                />
                                <span className="ts-form-hint">Separate multiple topics with commas</span>
                            </div>
                        </div>

                        <div className="ts-modal__footer">
                            <button
                                className="ts-btn ts-btn--secondary"
                                onClick={() => setShowCreateModal(false)}
                                disabled={creating}
                            >
                                Cancel
                            </button>
                            <button
                                className="ts-btn ts-btn--primary"
                                onClick={handleCreateTest}
                                disabled={creating || createConfig.sections.length === 0}
                            >
                                {creating ? (
                                    <>
                                        <div className="ts-btn-spinner"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="agents" size={18} />
                                        Generate Test
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TestSelection;
