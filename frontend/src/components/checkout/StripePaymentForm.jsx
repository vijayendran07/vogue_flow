import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { FiLock, FiShield } from 'react-icons/fi';

const StripePaymentForm = ({ orderId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(false);
        setIsProcessing(true);

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/order-success?order_id=${orderId}`,
            },
        });

        if (result.error) {
            toast.error(result.error.message || 'Payment failed. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl">
                <PaymentElement />
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed space-y-1">
                <div className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <FiShield className="w-3.5 h-3.5" />
                    <span>Secure Gateway Authorization</span>
                </div>
                <p className="text-[11px] opacity-80">
                    Your credentials are encrypted and processed securely by Stripe. Supports Cards, UPI, and Netbanking natively.
                </p>
            </div>

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full h-14 bg-gray-950 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing Vault Lock...</span>
                    </>
                ) : (
                    <>
                        <FiLock className="w-4 h-4" />
                        <span>Authorize and Pay</span>
                    </>
                )}
            </button>
        </form>
    );
};

export default StripePaymentForm;
