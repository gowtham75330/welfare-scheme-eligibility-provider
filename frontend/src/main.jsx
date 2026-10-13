import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Automatic API routing support for Vercel / Remote Hosting
const originalFetch = window.fetch;
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

if (API_BASE) {
  window.fetch = (url, options) => {
    if (typeof url === 'string' && url.startsWith('/api/')) {
      return originalFetch(`${API_BASE}${url}`, options);
    }
    return originalFetch(url, options);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
