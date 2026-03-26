// API Configuration

// Detect environment
const isReplit = typeof window !== 'undefined' && window.location.hostname.includes('replit.dev');
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// For Replit: Backend runs on same instance, accessible via localhost:5000
// For local dev: Use localhost:5000
// For production: Use Render URL
export const API_URL = isReplit || isLocalhost
  ? 'http://localhost:5000'
  : 'https://s72-vaibhav-capstone.onrender.com'; 