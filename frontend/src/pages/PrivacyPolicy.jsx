import React from 'react';
import MetaData from '../components/MetaData';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <MetaData title="Privacy Policy - VogueFlow" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-8 sm:p-12 border border-gray-100 dark:border-gray-800">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            At VogueFlow, we collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This includes your name, email address, shipping address, payment information, and any other details you choose to share.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            We use the information we collect to process your orders, provide customer support, personalize your shopping experience, and send you important updates about our services.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Data Security</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            We implement robust security measures to protect your personal information. Your payment data is encrypted and securely processed by our certified payment partners. We never store your full credit card details on our servers.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Sharing of Information</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            We do not sell your personal information. We may share necessary details with trusted third parties, such as shipping carriers and payment processors, strictly for the purpose of fulfilling your orders.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Contact Us</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            If you have any questions or concerns about this Privacy Policy, please contact us at support@vogueflow.com.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
