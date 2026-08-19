// API Configuration

// Detect environment
const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1';

// Local development uses the Vite proxy; all other environments use the deployed Render backend.
export const API_URL = isLocalDev
  ? ''
  : 'https://s72-vaibhav-capstone.onrender.com';