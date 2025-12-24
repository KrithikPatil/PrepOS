import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Test from './pages/Test/Test';
import Analysis from './pages/Analysis/Analysis';
import AgentSwarm from './pages/AgentSwarm/AgentSwarm';
import Roadmap from './pages/Roadmap/Roadmap';

/**
 * PrepOS - Closed-Loop Agentic Learning System
 * Main Application Component
 * 
 * TODO: Add authentication wrapper
 * TODO: Implement protected routes
 * TODO: Add global error boundary
 */
function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/test" element={<Test />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/agents" element={<AgentSwarm />} />
                <Route path="/roadmap" element={<Roadmap />} />
            </Routes>
        </Layout>
    );
}

export default App;
