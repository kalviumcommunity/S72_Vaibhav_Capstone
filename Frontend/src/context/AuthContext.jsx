import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext(null);

// Set base URL for Axios requests
axios.defaults.baseURL = API_URL; // Set the base URL for all axios requests

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    // Initialize user from localStorage on mount
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Helper to persist user in localStorage
  const setUser = (userObj) => {
    setUserState(userObj);
    if (userObj) {
      localStorage.setItem('user', JSON.stringify(userObj));
    } else {
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // First check if we have cached user in localStorage
          const cachedUser = localStorage.getItem('user');
          if (cachedUser) {
            setUser(JSON.parse(cachedUser));
          }
          
          // Then try to fetch fresh user data from API
          try {
            const res = await axios.get('/api/auth/me');
            if (res.data.success && res.data.user) {
              setUser({ ...res.data.user, _id: res.data.user.id });
            }
          } catch (err) {
            console.error('Error fetching user from API:', err.message);
            // If API fails but we have cached user, keep using it
            if (!cachedUser) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
              delete axios.defaults.headers.common['Authorization'];
            }
          }
        } else {
          // No token, but check if we have cached user (shouldn't normally happen)
          const cachedUser = localStorage.getItem('user');
          if (cachedUser) {
            setUser(JSON.parse(cachedUser));
          } else {
            setUser(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const login = async (email, password, token = null, userData = null) => {
    try {
      if (token && userData) {
        // Google OAuth login
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(token);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { success: true };
      } else {
        // Regular email/password login
        const res = await axios.post('/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        return { success: true };
      }
    } catch (err) {
      console.error('Login failed:', err.response?.data?.message || err.message);
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return { success: true };
    } catch (err) {
      console.error('Registration failed:', err.response?.data?.message || err.message);
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = { user, token, loading, login, register, logout, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 