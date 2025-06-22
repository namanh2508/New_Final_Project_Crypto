// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Get the root element
const container = document.getElementById('root');

// Create a root
const root = createRoot(container);

// Initial render
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hot Module Replacement for development
if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    root.render(
      <React.StrictMode>
        <NextApp />
      </React.StrictMode>
    );
  });
}

// Service Worker Registration (optional)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // You can add global error reporting here
  // For example, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // reportError(event.reason);
  }
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // Handle global errors
  if (process.env.NODE_ENV === 'production') {
    // reportError(event.error);
  }
});

// Performance monitoring (optional)
if (process.env.NODE_ENV === 'production') {
  // Measure and report web vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
}