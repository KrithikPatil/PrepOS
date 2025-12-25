import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// TODO: Initialize analytics and monitoring services here
// TODO: Set up error boundary for production

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Note: StrictMode removed temporarily - was causing issues with Test page
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
