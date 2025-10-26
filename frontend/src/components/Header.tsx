import React from 'react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  const NavItem: React.FC<{ label: string; href?: string }> = ({ label, href = '#' }) => (
    <a href={href} className="text-white/90 hover:text-white transition-colors duration-200 text-sm tracking-wider font-semibold inline-flex items-center">
      <span>{label}</span>
    </a>
  );

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 inset-x-0 z-50 bg-gradient-to-b from-black/50 to-transparent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold tracking-widest text-white">SADS</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <NavItem label="HOME" href="#" />
            <NavItem label="FEATURES" href="/features" />
            <NavItem label="REGISTER" href="/register" />
            <NavItem label="LOGIN" href="/login" />
          </nav>
          <div className="md:hidden text-white text-sm">MENU</div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;