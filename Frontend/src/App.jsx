import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import styled, { createGlobalStyle } from 'styled-components';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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

const GlobalStyle = createGlobalStyle`
  :root {
    --primary-color: #000000;
    --primary-color-dark: #333333;
    --secondary-color: #666666;
    --secondary-color-dark: #444444;
    --black: #000000;
    --white: #ffffff;
    --dark-gray: #333333;
    --medium-gray: #666666;
    --light-gray: #f5f5f5;
    --border-color: #dddddd;
    --text-color: #000000;
    --background-color: #ffffff;
    --error-color: #ff0000;
    --success-color: #000000;
    --warning-color: #666666;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.6;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem 0;
`;

const App = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <GlobalStyle />
        <Router>
          <AppContainer>
            <Navbar />
            <MainContent>
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
            </MainContent>
            <Footer />
          </AppContainer>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App; 