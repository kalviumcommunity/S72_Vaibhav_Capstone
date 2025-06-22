import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './pages/Home';
import TaskMarketplace from './pages/TaskMarketplace';
import SingleTask from './pages/SingleTask';
import CreateTask from './pages/CreateTask';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import MyTasks from './pages/MyTasks';
import UpdateTask from './pages/UpdateTask';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<TaskMarketplace />} />
            <Route 
              path="/my-tasks" 
              element={
                <ProtectedRoute>
                  <MyTasks />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/tasks/:id" 
              element={
                <ProtectedRoute>
                  <SingleTask />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/create-task" 
              element={
                <ProtectedRoute>
                  <CreateTask />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/edit-task/:id" 
              element={
                <ProtectedRoute>
                  <UpdateTask />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App; 