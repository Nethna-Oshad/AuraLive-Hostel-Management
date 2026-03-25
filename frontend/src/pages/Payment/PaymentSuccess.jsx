import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, ArrowRight, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
  // 1. SAFETY NET: Grab the parameter whether you named it :id OR :bookingId in App.jsx
  const params = useParams();
  const validId = params.id || params.bookingId; 
  
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // If there's absolutely no ID in the URL, stop immediately
        if (!validId) {
          console.error("Error: No Booking ID found in the URL.");
          setHasError(true);
          setVerifying(false);
          return;
        }

        // Ping the backend to mark it as paid and create the invoice
        await axios.post('http://localhost:5000/api/payment/verify', { bookingId: validId });
        setVerifying(false);
      } catch (error) {
        console.error("Verification failed:", error.response?.data || error.message);
        setHasError(true);
        setVerifying(false); 
      }
    };
    
    verifyPayment();
  }, [validId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100"
      >
        {verifying ? (
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-6"></div>
            <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
            <p className="mt-8 text-sm font-bold text-[#2872A1] uppercase tracking-widest">Securing your room...</p>
          </div>
        ) : hasError ? (
          <>
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
              className="w-28 h-28 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
            >
              <XCircle className="w-14 h-14" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Verification Failed</h1>
            <p className="text-gray-500 mb-10 leading-relaxed">
              We couldn't verify this payment automatically. Don't worry, if you were charged, please contact the admin to update your room status manually.
            </p>
            <button 
              onClick={() => navigate('/profile')} 
              className="w-full bg-gray-800 text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition-all"
            >
              Return to Profile
            </button>
          </>
        ) : (
          <>
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-28 h-28 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
            >
              <CheckCircle className="w-14 h-14" />
            </motion.div>
            
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Payment Successful!</h1>
            <p className="text-gray-500 mb-10 leading-relaxed">
              Your deposit has been processed securely via Stripe. Your room is now officially locked in and confirmed. Welcome to AuraLive!
            </p>
            
            <button 
              onClick={() => navigate('/profile')} 
              className="w-full bg-gradient-to-r from-[#2872A1] to-[#1f5a80] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-1 transition-all shadow-md shadow-[#CBDDE9]"
            >
              Return to Profile <ArrowRight className="w-5 h-5" />
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;