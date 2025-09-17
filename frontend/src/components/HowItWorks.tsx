import React from 'react';
import { motion } from 'framer-motion';
import { VideoCameraIcon, CpuChipIcon, ExclamationTriangleIcon, BellAlertIcon } from '@heroicons/react/24/outline';

const steps = [
  {
    step: '01',
    icon: VideoCameraIcon,
    title: 'Camera Detection',
    description: 'High-resolution cameras continuously monitor your property, capturing images and video in real-time.'
  },
  {
    step: '02',
    icon: CpuChipIcon,
    title: 'AI Analysis',
    description: 'Advanced machine learning algorithms analyze the footage to identify and classify different animal species.'
  },
  {
    step: '03',
    icon: ExclamationTriangleIcon,
    title: 'Smart Response',
    description: 'The system automatically activates appropriate deterrent measures based on the detected animal type.'
  },
  {
    step: '04',
    icon: BellAlertIcon,
    title: 'Instant Alerts',
    description: 'Receive immediate notifications on your device with details about the detected animal and response taken.'
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              SADS Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our intelligent system works seamlessly in four simple steps to protect your property 24/7.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="flex items-start space-x-6"
              >
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-2xl">
                    <step.icon className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-600 mb-2">STEP {step.step}</div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white p-8 rounded-3xl shadow-2xl">
              <img
                src="https://images.pexels.com/photos/8728558/pexels-photo-8728558.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                alt="SADS in action"
                className="w-full h-80 object-cover rounded-2xl mb-6"
              />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-red-800 font-medium">Wildlife Detected</span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">Active</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-800 font-medium">Deterrent Activated</span>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">Success</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-blue-800 font-medium">Alert Sent</span>
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Delivered</span>
                </div>
              </div>
            </div>

            {/* Floating Animation Elements */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-emerald-500 text-white p-3 rounded-full shadow-lg"
            >
              <VideoCameraIcon className="h-6 w-6" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;