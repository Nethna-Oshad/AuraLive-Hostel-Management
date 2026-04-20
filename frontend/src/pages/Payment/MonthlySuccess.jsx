import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Loader, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MonthlySuccess = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/payment/monthly/verify', { bookingId });
        if (response.data.success) {
          setSuccess(true);
          toast.success('Monthly Rent Paid Successfully!');
          setTimeout(() => navigate('/profile'), 3000); // Send them back to profile after 3 seconds
        }
      } catch (error) {
        toast.error('Payment verification failed.');
      } finally {
        setVerifying(false);
      }
    };
    verifyPayment();
  }, [bookingId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-[#CBDDE9]/50 text-center max-w-md w-full border border-gray-100">
        {verifying ? (
          <>
            <Loader className="w-20 h-20 text-[#2872A1] animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900">Verifying Payment...</h2>
            <p className="text-gray-500 mt-2 font-medium">Please wait, updating your rent status.</p>
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6 animate-bounce" />
            <h2 className="text-3xl font-extrabold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-500 mt-3 font-medium">Your monthly rent has been successfully paid and your invoice generated.</p>
            <p className="text-sm text-[#2872A1] font-bold mt-6">Redirecting to your profile...</p>
          </>
        ) : (
          <>
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-gray-500 mt-2 font-medium">Please contact administration.</p>
            <button onClick={() => navigate('/profile')} className="mt-8 bg-[#2872A1] hover:bg-[#1f5a80] text-white px-6 py-3.5 rounded-xl font-bold w-full transition-colors shadow-md">
              Return to Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlySuccess;