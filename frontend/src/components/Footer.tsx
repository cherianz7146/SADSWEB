import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              SADS
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Smart Animal Deterrent System - Protecting your property with AI-powered wildlife detection and real-time alerts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-emerald-400">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm flex items-center"
                >
                  <span className="mr-2">→</span> Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/features" 
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm flex items-center"
                >
                  <span className="mr-2">→</span> Features
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm flex items-center"
                >
                  <span className="mr-2">→</span> Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm flex items-center"
                >
                  <span className="mr-2">→</span> Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-purple-400">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/terms-of-service" 
                  className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy-policy" 
                  className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center"
                >
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Link>
              </li>
            </ul>

            {/* Contact */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2 text-gray-400">Contact</h4>
              <p className="text-gray-400 text-xs">support@sads.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} SADS - Smart Animal Deterrent System. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                to="/terms-of-service" 
                className="text-gray-400 hover:text-emerald-400 text-xs transition-colors"
              >
                Terms
              </Link>
              <Link 
                to="/privacy-policy" 
                className="text-gray-400 hover:text-purple-400 text-xs transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


