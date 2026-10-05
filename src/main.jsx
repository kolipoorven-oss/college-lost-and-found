import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { initClientMockApi } from './services/clientMockApi';

// Initialize in-browser API & Database engine for GitHub Pages, Vercel & offline resilience
initClientMockApi();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
