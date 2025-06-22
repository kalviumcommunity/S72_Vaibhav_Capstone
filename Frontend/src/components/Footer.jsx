import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} CredBuzz. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link 
                to="/privacy" 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link 
                to="/contact" 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;