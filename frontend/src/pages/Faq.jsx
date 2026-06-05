import React from 'react';
import MetaData from '../components/MetaData';

const Faq = () => {
  const faqs = [
    {
      question: "How do I track my order?",
      answer: "Go to My Orders and open your order details to see delivery status and timeline updates."
    },
    {
      question: "Can I cancel after placing an order?",
      answer: "Yes, cancellation is available before shipment starts from your order details page."
    },
    {
      question: "Where can I apply coupons?",
      answer: "You can apply active coupon codes on the Cart page before checkout."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We support UPI, Cards, Net Banking, Wallets, and Cash on Delivery."
    },
    {
      question: "How long does delivery take?",
      answer: "Standard delivery usually takes 3–7 business days depending on your location."
    },
    {
      question: "Can I return a product?",
      answer: "Yes, eligible products can be returned within the return window mentioned on the product page."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <MetaData title="FAQ - VogueFlow" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 text-center">Frequently Asked Questions</h1>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 group cursor-pointer transition-all hover:border-gray-300 dark:hover:border-gray-700">
              <summary className="font-bold text-lg text-gray-900 dark:text-white list-none flex justify-between items-center">
                {faq.question}
                <span className="text-primary-500 group-open:rotate-45 transition-transform duration-300 text-2xl leading-none">+</span>
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;
