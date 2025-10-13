import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-12">
      <div className="container-glass">
        <div className="border-t border-white/6 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm muted">
              &copy; {new Date().getFullYear()} CredBuzz. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link to="/privacy" className="text-sm muted hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="text-sm muted hover:text-white">Terms of Service</Link>
              <Link to="/contact" className="text-sm muted hover:text-white">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;