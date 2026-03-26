// API Configuration

// Detect environment
const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isReplit = hostname && hostname.includes('.replit.dev');

// On Replit and local dev (with Vite proxy): Use empty string
// Vite proxy at /api will forward requests like /api/users/profile to http://localhost:5000/api/users/profile
// On production: Use Render base URL (code appends /api)
export const API_URL = (isReplit || hostname === 'localhost' || hostname === '127.0.0.1')
  ? '' // Empty base - requests go to /api/... which Vite proxy handles
  : 'https://s72-vaibhav-capstone.onrender.com'; 