import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="text-2xl font-heading font-bold text-white">
              Cred<span className="text-primary">Buzz</span>
            </Link>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              Exchange skills, time, and services in a collaborative community. Create tasks, earn credits, and get things done.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-heading font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-primary transition-colors duration-300 text-sm">Home</Link></li>
              <li><Link to="/tasks" className="text-gray-400 hover:text-primary transition-colors duration-300 text-sm">Task Marketplace</Link></li>
              <li><Link to="/create-task" className="text-gray-400 hover:text-primary transition-colors duration-300 text-sm">Create Task</Link></li>
              <li><Link to="/profile" className="text-gray-400 hover:text-primary transition-colors duration-300 text-sm">Profile</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-heading font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors duration-300 text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-primary transition-colors duration-300 text-sm">Terms of Service</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-primary transition-colors duration-300 text-sm">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} <span className="text-primary">CredBuzz</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;