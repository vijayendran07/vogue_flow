import React from 'react';
import MetaData from '../components/MetaData';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <MetaData title="Cookie Policy - VogueFlow" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-8 sm:p-12 border border-gray-100 dark:border-gray-800">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-8">Cookie Policy</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. What are Cookies?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Cookies are small text files that are stored on your device when you visit a website. They help the website remember your actions and preferences over a period of time.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. How We Use Cookies</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            We use cookies to enhance your browsing experience, keep you logged in, remember your shopping cart items, and analyze site traffic to improve our services.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Types of Cookies We Use</h2>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 leading-relaxed space-y-2">
            <li><strong>Essential Cookies:</strong> Required for the basic functionality of our website.</li>
            <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our site.</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences and settings.</li>
            <li><strong>Targeting Cookies:</strong> Used to deliver relevant advertisements and track ad performance.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Managing Your Cookies</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            You can control or delete cookies through your browser settings. However, disabling certain cookies may impact the functionality and features of VogueFlow.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Updates to This Policy</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            We may update our Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
