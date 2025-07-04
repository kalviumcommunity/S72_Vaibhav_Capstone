import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext(null);

// Set base URL for Axios requests
axios.defaults.baseURL = API_URL; // Set the base URL for all axios requests

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
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
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await axios.get('/api/auth/me');
          if (res.data.success && res.data.user) {
            setUser({ ...res.data.user, _id: res.data.user.id });
          } else if (localStorage.getItem('user')) {
            setUser(JSON.parse(localStorage.getItem('user')));
          }
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else if (localStorage.getItem('user')) {
        setUser(JSON.parse(localStorage.getItem('user')));
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password, token = null, userData = null) => {
    try {
      if (token && userData) {
        // Google OAuth login
        setToken(token);
        localStorage.setItem('token', token);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { success: true };
      } else {
        // Regular email/password login
        const res = await axios.post('/api/auth/login', { email, password });
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
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
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
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

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 