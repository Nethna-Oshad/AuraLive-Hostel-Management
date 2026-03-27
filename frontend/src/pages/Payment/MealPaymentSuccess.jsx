import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, ArrowRight, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MealPaymentSuccess = () => {
  const { mealBookingId } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        if (!mealBookingId) {
          setHasError(true);
          setVerifying(false);
          return;
        }
        await axios.post('http://localhost:5000/api/payment/verify-meal', { mealBookingId });
        setVerifying(false);
      } catch (error) {
        setHasError(true);
        setVerifying(false);
      }
    };
    verify();
  }, [mealBookingId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
        {verifying ? (
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-6" />
            <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-4" />
            <p className="mt-8 text-sm font-bold text-[#2872A1] uppercase tracking-widest">Verifying your meal payment...</p>
          </div>
        ) : hasError ? (
          <>
            <div className="w-28 h-28 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <XCircle className="w-14 h-14" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Verification Failed</h1>
            <p className="text-gray-500 mb-10 leading-relaxed">
              We could not verify this meal payment automatically. Please contact admin if the amount was charged.
            </p>
            <button onClick={() => navigate('/student/meals')} className="w-full bg-gray-800 text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition-all">
              Return to Meals
            </button>
          </>
        ) : (
          <>
            <div className="w-28 h-28 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle className="w-14 h-14" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Meal Payment Successful</h1>
            <p className="text-gray-500 mb-10 leading-relaxed">
              Your external meal order payment has been confirmed. Your order will now be processed by the selected shop.
            </p>
            <button onClick={() => navigate('/student/meals')} className="w-full bg-gradient-to-r from-[#2872A1] to-[#1f5a80] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-xl transition-all shadow-md">
              Back to Meal Dashboard <ArrowRight className="w-5 h-5" />
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default MealPaymentSuccess;
