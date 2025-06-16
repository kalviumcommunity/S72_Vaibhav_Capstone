import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
// import Home from './pages/Home';
// import TaskMarketplace from './pages/TaskMarketplace';
// import SingleTask from './pages/SingleTask';
// import CreateTask from './pages/CreateTask';
// import Profile from './pages/Profile';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import MyTasks from './pages/MyTasks';
// import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
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
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
