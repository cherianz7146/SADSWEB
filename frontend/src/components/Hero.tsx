import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen w-full">
      <img
        src="https://images.pexels.com/photos/1324803/pexels-photo-1324803.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
        alt="Forest Lake"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 text-center">
        <h1 className="text-white/90 text-3xl sm:text-4xl tracking-[0.35em] font-extrabold mb-6">SADS FOR</h1>
        <h2 className="text-white text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-wider mb-6">SAFETY</h2>
        <p className="text-white/90 text-base sm:text-lg max-w-3xl mx-auto">
          We build intelligent, humane deterrence that <span className="font-semibold">PROTECTS SPACES</span> and
          <span className="font-semibold"> PRIORITISES SAFETY</span>
        </p>
      </div>
    </section>
  );
};

export default Hero;