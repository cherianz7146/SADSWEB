import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ShieldCheckIcon, LockClosedIcon, UserGroupIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            <p className="text-purple-50 mt-2">Effective Date: October 26, 2025 | Last Updated: October 26, 2025</p>
          </div>

          <div className="px-8 py-10 prose prose-purple max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. INTRODUCTION</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to SADS (Smart Animal Deterrent System). We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                By using SADS, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. INFORMATION WE COLLECT</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
              <div className="bg-purple-50 rounded-lg p-5 mb-4">
                <p className="text-gray-700 font-semibold mb-2">Required Information:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Full Name</strong> - To identify you in the system</li>
                  <li><strong>Email Address</strong> - For account verification and alerts</li>
                  <li><strong>Password</strong> - Encrypted for account security</li>
                  <li><strong>Plantation/Property Name</strong> - To create and manage your property</li>
                </ul>
              </div>

              <div className="bg-indigo-50 rounded-lg p-5 mb-4">
                <p className="text-gray-700 font-semibold mb-2">Optional Information:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Phone Number</strong> - For SMS/WhatsApp alerts (E.164 format)</li>
                  <li><strong>Property Location</strong> - For detection context</li>
                  <li><strong>Property Address</strong> - For property management</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li><strong>User ID:</strong> Unique identifier (e.g., 001, 002, 003) associated with all detections</li>
                <li><strong>Detection Data:</strong> Animal type, confidence score, timestamp, property name, location, source</li>
                <li><strong>System Data:</strong> IP address, browser type, device information, login timestamps</li>
                <li><strong>Session Data:</strong> JWT tokens for authentication</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Camera and Media</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Camera Access:</strong> Required for real-time detection</li>
                <li><strong>Webcam Feeds:</strong> Processed in real-time, not stored permanently</li>
                <li><strong>Uploaded Images:</strong> Stored for detection and reporting</li>
                <li><strong>Detection Screenshots:</strong> Saved for audit and reports</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. HOW WE USE YOUR INFORMATION</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <div className="flex items-center mb-2">
                    <ShieldCheckIcon className="h-6 w-6 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">Service Delivery</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1 ml-8">
                    <li>• Account Management</li>
                    <li>• Authentication</li>
                    <li>• Wildlife Detection</li>
                    <li>• Alert Delivery</li>
                  </ul>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                  <div className="flex items-center mb-2">
                    <BellAlertIcon className="h-6 w-6 text-indigo-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">Communication</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1 ml-8">
                    <li>• Detection Alerts</li>
                    <li>• System Notifications</li>
                    <li>• Welcome Messages</li>
                    <li>• Support</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. HOW WE SHARE YOUR INFORMATION</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Within SADS System</h3>
              <div className="bg-gray-50 rounded-lg p-5 mb-4">
                <p className="text-gray-700 mb-2"><strong>Admin Users:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mb-3">
                  <li>Can view all user information for system management</li>
                  <li>Can access all detection data across properties</li>
                  <li>Can send notifications to managers</li>
                </ul>
                <p className="text-gray-700 mb-2"><strong>Manager Users:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Can only view their own profile and detection data</li>
                  <li>Cannot view other managers' data</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Third-Party Service Providers</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-emerald-500 bg-emerald-50 p-4 rounded">
                  <p className="font-semibold text-gray-800 mb-2">🔔 Twilio (SMS/WhatsApp/Voice)</p>
                  <p className="text-sm text-gray-700 mb-1">What we share: Phone numbers, message content, delivery status</p>
                  <p className="text-sm text-gray-700 mb-1">Purpose: Send SMS, WhatsApp, and voice call alerts</p>
                  <a href="https://www.twilio.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">View Twilio Privacy Policy →</a>
                </div>

                <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                  <p className="font-semibold text-gray-800 mb-2">📧 Gmail SMTP (Email)</p>
                  <p className="text-sm text-gray-700 mb-1">What we share: Email addresses, email content</p>
                  <p className="text-sm text-gray-700 mb-1">Purpose: Send email notifications</p>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View Google Privacy Policy →</a>
                </div>

                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                  <p className="font-semibold text-gray-800 mb-2">🗄️ MongoDB (Database)</p>
                  <p className="text-sm text-gray-700 mb-1">What we share: All user data and detection records</p>
                  <p className="text-sm text-gray-700 mb-1">Purpose: Data storage and management</p>
                  <a href="https://www.mongodb.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">View MongoDB Privacy Policy →</a>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="font-semibold text-red-800 mb-2">❌ We Do NOT:</p>
                <ul className="list-disc list-inside space-y-1 text-red-700 ml-4 text-sm">
                  <li>Sell your personal information</li>
                  <li>Share data with advertisers</li>
                  <li>Use your data for marketing to third parties</li>
                  <li>Share camera feeds with unauthorized parties</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. DATA SECURITY</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <LockClosedIcon className="h-10 w-10 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800 mb-2">Encryption</h4>
                  <p className="text-sm text-gray-700">Passwords hashed with bcrypt, JWT tokens, HTTPS</p>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <ShieldCheckIcon className="h-10 w-10 text-indigo-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800 mb-2">Access Controls</h4>
                  <p className="text-sm text-gray-700">Role-based access, session management, rate limiting</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <UserGroupIcon className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800 mb-2">Monitoring</h4>
                  <p className="text-sm text-gray-700">Error logging, audit trails, security alerts</p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. YOUR PRIVACY RIGHTS</h2>
              
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border-2 border-purple-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">You Have The Right To:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-purple-700 mb-2">✓ Access Rights</p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• View your personal information</li>
                      <li>• Review all your detections</li>
                      <li>• See data associated with your User ID</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-indigo-700 mb-2">✓ Control Rights</p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• Update your profile details</li>
                      <li>• Configure alert preferences</li>
                      <li>• Set quiet hours</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-700 mb-2">✓ Export Rights</p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• Download detection data (PDF/Excel)</li>
                      <li>• Export detection reports</li>
                      <li>• Data portability</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-indigo-700 mb-2">✓ Deletion Rights</p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• Delete your account</li>
                      <li>• Remove specific detection records</li>
                      <li>• Opt-out of communications</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. DETECTION DATA SPECIFICS</h2>
              
              <div className="bg-gray-50 rounded-lg p-5">
                <p className="text-gray-700 mb-3 font-semibold">For Each Detection, We Collect:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded shadow-sm">
                    <p className="text-xs text-gray-600">User ID</p>
                    <p className="text-sm font-semibold text-gray-800">e.g., 002</p>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <p className="text-xs text-gray-600">Animal Name</p>
                    <p className="text-sm font-semibold text-gray-800">Tiger, Elephant</p>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <p className="text-xs text-gray-600">Confidence</p>
                    <p className="text-sm font-semibold text-gray-800">90.7%</p>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <p className="text-xs text-gray-600">Date & Time</p>
                    <p className="text-sm font-semibold text-gray-800">26/10/2025</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. CHILDREN'S PRIVACY</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-800">
                  <strong>⚠️ Age Restriction:</strong> SADS is not intended for users under 18 years of age. We do not knowingly collect information from children.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. CHANGES TO THIS POLICY</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy when we add new features or when laws change. You will be notified of material changes via email. Continued use after changes constitutes acceptance.
              </p>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. CONTACT US</h2>
              <div className="bg-purple-50 rounded-lg p-6">
                <p className="text-gray-700 mb-3 font-semibold">For questions about this Privacy Policy:</p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>General Inquiries:</strong> support@sads.com</p>
                  <p><strong>Privacy Concerns:</strong> privacy@sads.com</p>
                  <p><strong>Data Requests:</strong> data-requests@sads.com</p>
                  <p><strong>Website:</strong> [Your Website]</p>
                  <p><strong>Address:</strong> [Your Business Address]</p>
                </div>
              </div>
            </section>

            {/* Summary */}
            <section className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 SUMMARY OF KEY POINTS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start">
                  <span className="text-purple-600 mr-2">✅</span>
                  <p className="text-gray-700"><strong>What We Collect:</strong> Name, email, phone, property details, detection data</p>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-600 mr-2">✅</span>
                  <p className="text-gray-700"><strong>How We Use It:</strong> Service delivery, alerts, reports, improvements</p>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-600 mr-2">✅</span>
                  <p className="text-gray-700"><strong>Who We Share With:</strong> Twilio (SMS/WhatsApp), Gmail (email), MongoDB (storage)</p>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-600 mr-2">✅</span>
                  <p className="text-gray-700"><strong>Your Rights:</strong> Access, update, export, delete your data</p>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-600 mr-2">✅</span>
                  <p className="text-gray-700"><strong>Security:</strong> Encrypted passwords, JWT tokens, role-based access</p>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-600 mr-2">✅</span>
                  <p className="text-gray-700"><strong>Contact:</strong> support@sads.com for questions</p>
                </div>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white mt-8">
              <h2 className="text-2xl font-bold mb-3">ACKNOWLEDGMENT</h2>
              <p className="leading-relaxed">
                By clicking "I agree to the Terms of Service and Privacy Policy" during registration, you acknowledge that you have read, understood, and agree to this Privacy Policy.
              </p>
              <p className="text-sm text-purple-100 mt-4">
                <strong>Version 1.0</strong> | Effective Date: October 26, 2025
              </p>
            </section>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 text-center">
          <Link
            to="/terms-of-service"
            className="text-purple-600 hover:text-purple-700 font-semibold underline"
          >
            View Terms of Service →
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;

