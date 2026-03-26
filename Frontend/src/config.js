// API Configuration

// Detect environment
const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isReplit = hostname && (hostname.includes('.replit.dev') || hostname.includes('.replit.app'));

// On Replit and local dev (with Vite proxy): Use empty string or Replit Backend
// On other production: Use specific Backend URL
export const API_URL = isReplit
  ? 'https://s-72-vaibhav-capstone--vaibh74050.replit.app' // Replit production Backend
  : (hostname === 'localhost' || hostname === '127.0.0.1')
  ? '' // Empty base - Vite proxy handles local dev
  : 'https://s72-vaibhav-capstone.onrender.com'; // Fallback to Render 