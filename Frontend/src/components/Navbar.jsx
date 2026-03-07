import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const isHome = location.pathname === '/';
  const transparent = isHome && !scrolled;

  const navLinkClass = (path) =>
    `px-1 py-2 text-sm font-medium font-nav uppercase tracking-wider transition-colors duration-300 border-b-2 ${
      isActive(path)
        ? 'text-primary border-primary'
        : 'text-white/80 border-transparent hover:text-primary hover:border-primary/50'
    }`;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      transparent
        ? 'bg-transparent'
        : 'bg-dark-nav/95 backdrop-blur-sm shadow-lg border-b border-white/5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-heading font-bold text-white hover:text-primary transition-colors duration-300">
              Cred<span className="text-primary">Buzz</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/" className={navLinkClass('/')}>Home</Link>
            <Link to="/tasks" className={navLinkClass('/tasks')}>Marketplace</Link>
            {user && <Link to="/my-tasks" className={navLinkClass('/my-tasks')}>My Tasks</Link>}
            <Link to="/profile" className={navLinkClass('/profile')}>Profile</Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                <div className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded text-sm font-semibold font-nav">
                  {user.credits} ₵ Credits
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-white/20 text-white/80 rounded text-sm font-medium font-nav hover:border-primary hover:text-primary transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium font-nav text-white/80 hover:text-primary transition-colors duration-300">
                  Sign In
                </Link>
                <Link to="/register" className="px-5 py-2.5 bg-primary text-white rounded text-sm font-semibold font-nav hover:bg-primary-dark transition-all duration-300">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded text-white/80 hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-dark-lighter py-4">
            <nav className="flex flex-col space-y-1">
              <Link to="/" className={`px-4 py-2.5 text-sm font-medium font-nav uppercase tracking-wider rounded transition-colors ${isActive('/') ? 'text-primary bg-primary/10' : 'text-white/80 hover:text-primary hover:bg-white/5'}`}>Home</Link>
              <Link to="/tasks" className={`px-4 py-2.5 text-sm font-medium font-nav uppercase tracking-wider rounded transition-colors ${isActive('/tasks') ? 'text-primary bg-primary/10' : 'text-white/80 hover:text-primary hover:bg-white/5'}`}>Marketplace</Link>
              {user && <Link to="/my-tasks" className={`px-4 py-2.5 text-sm font-medium font-nav uppercase tracking-wider rounded transition-colors ${isActive('/my-tasks') ? 'text-primary bg-primary/10' : 'text-white/80 hover:text-primary hover:bg-white/5'}`}>My Tasks</Link>}
              <Link to="/profile" className={`px-4 py-2.5 text-sm font-medium font-nav uppercase tracking-wider rounded transition-colors ${isActive('/profile') ? 'text-primary bg-primary/10' : 'text-white/80 hover:text-primary hover:bg-white/5'}`}>Profile</Link>
              <div className="border-t border-white/10 pt-3 mt-2 px-4 flex flex-col space-y-2">
                {user ? (
                  <>
                    <div className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded text-sm font-semibold text-center">{user.credits} ₵ Credits</div>
                    <button onClick={handleLogout} className="w-full px-4 py-2 border border-white/20 text-white/80 rounded text-sm font-medium hover:border-primary hover:text-primary transition-all">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="px-4 py-2 text-center text-sm font-medium text-white/80 hover:text-primary transition-colors">Sign In</Link>
                    <Link to="/register" className="px-4 py-2 bg-primary text-white rounded text-sm font-semibold text-center hover:bg-primary-dark transition-all">Get Started</Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;