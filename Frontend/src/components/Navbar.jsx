import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="container-glass py-3">
        <div className="flex justify-between items-center">
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
                <div className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold shadow-sm">
                  Credits: {user.credits} 
                </div>
                <Button variant="ghost" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-white hover:text-gray-200">Sign in</Link>
                <Link to="/register"><Button>Get started</Button></Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;