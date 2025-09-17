import React from 'react';
import { motion } from 'framer-motion';
import { 
  CameraIcon, 
  BoltIcon, 
  ShieldCheckIcon, 
  CloudIcon,
  BellIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: CameraIcon,
    title: 'AI-Powered Detection',
    description: 'Advanced computer vision algorithms identify various animal species with 99.9% accuracy in real-time.',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: BoltIcon,
    title: 'Instant Response',
    description: 'Automated deterrent systems activate within 0.5 seconds of detection for maximum effectiveness.',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Smart Protection',
    description: 'Intelligent algorithms distinguish between pets and unwanted animals for targeted deterrence.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: CloudIcon,
    title: 'Cloud Integration',
    description: 'Secure cloud storage and remote monitoring capabilities accessible from anywhere.',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    icon: BellIcon,
    title: 'Real-time Alerts',
    description: 'Instant notifications via mobile app, email, or SMS when animals are detected.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: ChartBarIcon,
    title: 'Analytics Dashboard',
    description: 'Comprehensive insights and patterns about animal activity around your property.',
    gradient: 'from-green-500 to-emerald-500'
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Complete Protection
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our advanced SADS technology combines cutting-edge AI with robust hardware to provide comprehensive animal deterrent solutions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 group"
            >
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;