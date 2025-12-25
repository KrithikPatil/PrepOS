import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Subscription Context
 * Manages user subscription state for freemium model
 * 
 * In production, this would sync with backend
 * For demo, stores in localStorage to persist unlocks
 */

const SubscriptionContext = createContext();

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within SubscriptionProvider');
    }
    return context;
};

export function SubscriptionProvider({ children }) {
    const [plan, setPlan] = useState(() => {
        // Check localStorage for demo unlock
        const saved = localStorage.getItem('prepos_subscription');
        return saved || 'free';
    });

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('prepos_subscription', plan);
    }, [plan]);

    const isPro = plan === 'pro' || plan === 'premium';
    const isPremium = plan === 'premium';

    // Dummy unlock functions
    const unlockPro = () => {
        setPlan('pro');
        setShowUpgradeModal(false);
    };

    const unlockPremium = () => {
        setPlan('premium');
        setShowUpgradeModal(false);
    };

    const resetToFree = () => {
        setPlan('free');
    };

    // Feature access checks
    const canAccessFeature = (feature) => {
        const freeFeatures = ['know-cat', 'basic-analytics', 'limited-tests'];
        const proFeatures = ['ai-agents', 'ai-tutor', 'roadmap', 'unlimited-tests', 'question-generation'];
        const premiumFeatures = ['mentorship', 'gdpi', 'college-prediction'];

        if (freeFeatures.includes(feature)) return true;
        if (isPro && proFeatures.includes(feature)) return true;
        if (isPremium && premiumFeatures.includes(feature)) return true;
        if (isPremium) return true; // Premium has all features

        return false;
    };

    const value = {
        plan,
        isPro,
        isPremium,
        unlockPro,
        unlockPremium,
        resetToFree,
        canAccessFeature,
        showUpgradeModal,
        setShowUpgradeModal,
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export default SubscriptionContext;
