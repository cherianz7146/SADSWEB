import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
            <p className="text-emerald-50 mt-2">Effective Date: October 26, 2025 | Last Updated: October 26, 2025</p>
          </div>

          <div className="px-8 py-10 prose prose-emerald max-w-none">
            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. ACCEPTANCE OF TERMS</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to SADS (Smart Animal Deterrent System). By accessing or using our service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. SERVICE DESCRIPTION</h2>
              <p className="text-gray-700 leading-relaxed mb-3">SADS provides a wildlife detection and monitoring system that:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Detects animals using AI-powered camera systems</li>
                <li>Sends real-time alerts via email, SMS, and WhatsApp</li>
                <li>Provides detection reports and analytics</li>
                <li>Manages property and plantation monitoring</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. USER ACCOUNTS</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Registration</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must be at least 18 years old to use this service</li>
                <li>Each user is assigned a unique User ID for tracking purposes</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Account Types</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li><strong>Manager Account:</strong> Access to assigned property monitoring and alerts</li>
                <li><strong>Admin Account:</strong> Full system access including user management</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Account Security</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>You are responsible for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. USER RESPONSIBILITIES</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Acceptable Use</h3>
              <p className="text-gray-700 mb-2">You agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Use the service only for lawful purposes</li>
                <li>Provide accurate information about your property and contact details</li>
                <li>Maintain camera equipment in proper working condition</li>
                <li>Comply with local wildlife protection laws</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Prohibited Activities</h3>
              <p className="text-gray-700 mb-2">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Use the service to harm or harass wildlife</li>
                <li>Share your account credentials with unauthorized persons</li>
                <li>Attempt to reverse engineer or hack the system</li>
                <li>Upload malicious content or viruses</li>
                <li>Misuse detection alerts or data</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. DETECTION ALERTS</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Alert Delivery</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Alerts are sent via email, SMS, and WhatsApp based on your preferences</li>
                <li>We use Twilio for SMS and WhatsApp delivery</li>
                <li>Alert delivery depends on network availability and is not guaranteed</li>
                <li>SMS/WhatsApp alerts require a verified phone number</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Alert Accuracy</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Detection accuracy depends on camera quality and AI model performance</li>
                <li>Confidence scores are provided with each detection</li>
                <li>False positives and negatives may occur</li>
                <li>We do not guarantee 100% detection accuracy</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Critical Alerts</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Critical animals (tigers, elephants, leopards) may trigger voice calls</li>
                <li>Alerts respect your quiet hours settings (except critical alerts)</li>
                <li>You can customize alert preferences at any time</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. CAMERA AND DATA USAGE</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Camera Access</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>You grant us permission to access camera feeds for detection purposes</li>
                <li>Camera feeds are processed in real-time and not stored permanently</li>
                <li>Detection images are stored for reporting purposes only</li>
                <li>You can use webcam or upload images for detection</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Data Processing</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Detection data includes: animal type, confidence level, timestamp, location</li>
                <li>Data is associated with your User ID</li>
                <li>Admin users can view all detection data</li>
                <li>Managers can view only their assigned property data</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. INTELLECTUAL PROPERTY</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                All content, features, and functionality are owned by SADS. You retain ownership of data you upload but grant us a license to process your data for service delivery.
              </p>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. PRIVACY AND DATA</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We collect and process personal information as described in our{' '}
                <Link to="/privacy-policy" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">
                  Privacy Policy
                </Link>
                . This includes name, email, phone number, property details, and detection data.
              </p>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. LIMITATIONS OF LIABILITY</h2>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800 font-semibold">⚠️ Important Disclaimer:</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-700 ml-4 mt-2">
                  <li>SADS is a monitoring tool, not a guarantee of wildlife control</li>
                  <li>We are not responsible for property damage caused by wildlife</li>
                  <li>We are not liable for missed detections or alert failures</li>
                  <li>Service is provided "as is" without warranties</li>
                </ul>
              </div>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. TERMINATION</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You may terminate your account at any time. We may suspend or terminate your account if you violate these terms or engage in fraudulent activity.
              </p>
            </section>

            {/* Section 11 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. MODIFICATIONS TO TERMS</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these terms at any time. Material changes will be communicated via email. Continued use after changes constitutes acceptance.
              </p>
            </section>

            {/* Section 12 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. CONTACT INFORMATION</h2>
              <div className="bg-emerald-50 rounded-lg p-6">
                <p className="text-gray-700 mb-2">For questions about these Terms of Service:</p>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Email:</strong> support@sads.com</li>
                  <li><strong>Website:</strong> [Your Website]</li>
                  <li><strong>Address:</strong> [Your Business Address]</li>
                </ul>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6 border-2 border-emerald-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">ACKNOWLEDGMENT</h2>
              <p className="text-gray-700 leading-relaxed">
                By using SADS, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
              <p className="text-sm text-gray-600 mt-4">
                <strong>Version 1.0</strong> | Effective Date: October 26, 2025
              </p>
            </section>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 text-center">
          <Link
            to="/privacy-policy"
            className="text-emerald-600 hover:text-emerald-700 font-semibold underline"
          >
            View Privacy Policy →
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;

