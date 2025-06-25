// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get the root element with error checking
  const container = document.getElementById('root');
  
  if (!container) {
    console.error('Root element not found! Make sure your HTML has a div with id="root"');
    return;
  }

  // Create a root
  const root = createRoot(container);

  // Initial render with error boundary
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Error rendering React app:', error);
    
    // Fallback UI
    container.innerHTML = `
      <div style="padding: 20px; text-align: center; color: red;">
        <h2>Đã xảy ra lỗi khi tải ứng dụng</h2>
        <p>Vui lòng tải lại trang hoặc liên hệ hỗ trợ.</p>
        <button onclick="window.location.reload()">Tải lại trang</button>
      </div>
    `;
  }

  // Hot Module Replacement for development
  if (module.hot) {
    module.hot.accept('./App', () => {
      try {
        const NextApp = require('./App').default;
        root.render(
          <React.StrictMode>
            <NextApp />
          </React.StrictMode>
        );
      } catch (error) {
        console.error('Hot reload error:', error);
      }
    });
  }
});

// Alternative: Create root element if it doesn't exist
function ensureRootElement() {
  let container = document.getElementById('root');
  
  if (!container) {
    console.warn('Root element not found, creating one...');
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
  }
  
  return container;
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
  
  // Prevent default browser error handling
  event.preventDefault();
  
  // You can add global error reporting here
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
  }).catch(error => {
    console.log('Web vitals import error:', error);
  });
}