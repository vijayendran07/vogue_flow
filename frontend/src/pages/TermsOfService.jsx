import React from 'react';
import MetaData from '../components/MetaData';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <MetaData title="Terms of Service - VogueFlow" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-8 sm:p-12 border border-gray-100 dark:border-gray-800">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-8">Terms of Service</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            By accessing and using VogueFlow, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. User Accounts</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            When you create an account, you are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Products and Pricing</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            We strive to display products as accurately as possible. However, we do not guarantee that the colors or details will be entirely accurate on all screens. Prices and product availability are subject to change without notice.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Shipping and Returns</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Shipping times are estimates and may vary. Our return policy allows you to return eligible items within a specified period. Please refer to our Returns Policy for detailed instructions.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Intellectual Property</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            All content on VogueFlow, including images, text, logos, and graphics, is the property of VogueFlow and protected by copyright laws. You may not use our content without written permission.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
