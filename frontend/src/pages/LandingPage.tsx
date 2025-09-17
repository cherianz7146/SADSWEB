import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
    </div>
  );
};

export default LandingPage;