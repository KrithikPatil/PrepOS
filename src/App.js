import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TestModeProvider } from './contexts/TestModeContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import TestSelection from './pages/TestSelection/TestSelection';
import Test from './pages/Test/Test';
import Analysis from './pages/Analysis/Analysis';
import AgentSwarm from './pages/AgentSwarm/AgentSwarm';
import Roadmap from './pages/Roadmap/Roadmap';
import KnowYourExam from './pages/KnowYourExam/KnowYourExam';
import PreviousTests from './pages/PreviousTests/PreviousTests';
import QuestionGenerator from './pages/QuestionGenerator/QuestionGenerator';
import TutorSession from './pages/TutorSession/TutorSession';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import AuthCallback from './pages/Auth/AuthCallback';

/**
 * PrepOS - CAT Preparation Platform
 * AI-Powered Learning with Multi-Agent Analysis
 * 
 * Architecture:
 * - AuthProvider: Authentication state management
 * - TestModeProvider: Test-in-progress UI isolation
 * - Layout: Sidebar + main content structure
 */

// Protected Route wrapper
function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Main App Routes
function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected Routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout>
                        <Navigate to="/dashboard" replace />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout>
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/know-cat" element={
                <ProtectedRoute>
                    <Layout>
                        <KnowYourExam />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/test" element={
                <ProtectedRoute>
                    <Layout>
                        <TestSelection />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/test/start" element={
                <ProtectedRoute>
                    <Layout>
                        <Test />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/analysis" element={
                <ProtectedRoute>
                    <Layout>
                        <Analysis />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/agents" element={
                <ProtectedRoute>
                    <Layout>
                        <AgentSwarm />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/roadmap" element={
                <ProtectedRoute>
                    <Layout>
                        <Roadmap />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/previous-tests" element={
                <ProtectedRoute>
                    <Layout>
                        <PreviousTests />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/generate" element={
                <ProtectedRoute>
                    <Layout>
                        <QuestionGenerator />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/tutor/:attemptId" element={
                <ProtectedRoute>
                    <Layout>
                        <TutorSession />
                    </Layout>
                </ProtectedRoute>
            } />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <SubscriptionProvider>
                <TestModeProvider>
                    <AppRoutes />
                </TestModeProvider>
            </SubscriptionProvider>
        </AuthProvider>
    );
}

export default App;
