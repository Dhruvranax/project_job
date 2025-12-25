import React, { useState } from 'react';
import axios from 'axios';
// import './Payment.css';

const Payment = ({ userId, email, onPaymentSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);
        setError('');

        try {
            // 1. Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setError('Razorpay failed to load. Please check your connection.');
                return;
            }

            // 2. Create order on backend
            const orderResponse = await axios.post(
                'https://project-job-i2vd.vercel.app/api/payment/create-order',
                { userId, email }
            );

            if (!orderResponse.data.success) {
                throw new Error(orderResponse.data.message);
            }

            const order = orderResponse.data;

            // 3. Razorpay options
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Job Portal Security Fee',
                description: '₹1 Security Deposit',
                order_id: order.order_id,
                handler: async (response) => {
                    // 4. Verify payment on backend
                    const verifyResponse = await axios.post(
                        'https://project-job-i2vd.vercel.app/api/payment/verify-payment',
                        {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: userId
                        }
                    );

                    if (verifyResponse.data.success) {
                        onPaymentSuccess();
                    } else {
                        setError('Payment verification failed');
                    }
                },
                prefill: {
                    name: `${userId.firstName} ${userId.lastName}`,
                    email: email,
                    contact: userId.phone
                },
                theme: {
                    color: '#F37254'
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    }
                }
            };

            // 5. Open Razorpay checkout
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error('Payment error:', err);
            setError(err.response?.data?.message || err.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-container">
            <div className="card">
                <div className="card-body">
                    <h4 className="card-title">Complete Registration</h4>
                    <p className="card-text">
                        A security deposit of ₹1 is required to complete your registration.
                        This amount is fully refundable.
                    </p>
                    
                    {error && (
                        <div className="alert alert-danger">{error}</div>
                    )}
                    
                    <button
                        onClick={handlePayment}
                        className="btn btn-primary btn-lg w-100"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Pay ₹1 & Complete Registration'}
                    </button>
                    
                    <div className="mt-3 text-center">
                        <small className="text-muted">
                            Secure payment by Razorpay
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;