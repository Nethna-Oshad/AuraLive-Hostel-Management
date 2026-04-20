import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-10"
      >
        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Terms of Service</h1>
            <p className="text-gray-500 text-sm mt-1">Please read these terms carefully before using AuraLive.</p>
          </div>
        </div>

        <div className="space-y-6 text-gray-600 leading-relaxed text-sm">
          <h3 className="text-lg font-bold text-gray-900">1. Acceptance of Terms</h3>
          <p>By accessing and using the AuraLive platform, you accept and agree to be bound by the terms and provisions of this agreement.</p>

          <h3 className="text-lg font-bold text-gray-900 mt-6">2. Booking and Payments</h3>
          <p>All room bookings are subject to availability and admin approval. A room is only considered "Secured" once the key money and first month's rent have been paid successfully through our payment gateway.</p>

          <h3 className="text-lg font-bold text-gray-900 mt-6">3. User Responsibilities</h3>
          <p>Students must adhere to the hostel rules, respect the property, and maintain peaceful conduct. Damage to hostel property will be deducted from the key money deposit.</p>

          <h3 className="text-lg font-bold text-gray-900 mt-6">4. Service Providers</h3>
          <p>Laundry, Maintenance, and Meal providers operating on AuraLive are independent contractors. AuraLive facilitates the connection but is not directly liable for disputes arising between students and service providers.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;