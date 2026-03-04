import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Ping the backend to mark it as paid in the database
        await axios.post('http://localhost:5000/api/payment/verify', { bookingId });
        setVerifying(false);
      } catch (error) {
        console.error("Verification failed", error);
        setVerifying(false); 
      }
    };
    verifyPayment();
  }, [bookingId]);

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
            <p className="mt-8 text-sm font-bold text-gray-400 uppercase tracking-widest">Securing your room...</p>
          </div>
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