import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const NavItem: React.FC<{ label: string; href?: string }> = ({ label, href = '#' }) => (
    <Link 
      to={href} 
      className="text-white/90 hover:text-white transition-colors duration-200 text-sm tracking-wider font-semibold inline-flex items-center"
    >
      <span>{label}</span>
    </Link>
  );

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 inset-x-0 z-50 bg-black/40 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center space-x-2"
          >
            <Link to="/">
            <span className="text-2xl font-extrabold tracking-widest text-white">SADS</span>
            </Link>
          </motion.div>
          <motion.nav 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="hidden md:flex items-center space-x-8"
          >
            <NavItem label="HOME" href="/" />
            <NavItem label="FEATURES" href="/features" />
            <NavItem label="REGISTER" href="/register" />
            <NavItem label="LOGIN" href="/login" />
          </motion.nav>
          <div className="md:hidden text-white text-sm">MENU</div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;