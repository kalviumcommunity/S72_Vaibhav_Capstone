import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-black shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-black">
              CredBuzz
            </Link>
          </div>
          
          <nav className="hidden md:ml-10 md:flex items-center space-x-8">
            <Link to="/" className="px-3 py-2 text-sm font-medium text-black hover:text-gray-700 transition-colors duration-200">
              Home
            </Link>
            <Link to="/tasks" className="px-3 py-2 text-sm font-medium text-black hover:text-gray-700 transition-colors duration-200">
              Task Marketplace
            </Link>
            {user && (
              <Link to="/my-tasks" className="px-3 py-2 text-sm font-medium text-black hover:text-gray-700 transition-colors duration-200">
                My Tasks
              </Link>
            )}
            <Link to="/profile" className="px-3 py-2 text-sm font-medium text-black hover:text-gray-700 transition-colors duration-200">
              Profile
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm">
                  Credits: {user.credits} ₵
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 border border-black rounded-lg text-sm font-medium text-black hover:bg-gray-100 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-black hover:text-gray-700 transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors duration-200 shadow-sm"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;