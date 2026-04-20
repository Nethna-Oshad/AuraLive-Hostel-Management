import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-10"
      >
        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
            <p className="text-gray-500 text-sm mt-1">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-6 text-gray-600 leading-relaxed text-sm">
          <h3 className="text-lg font-bold text-gray-900">1. Information We Collect</h3>
          <p>When you register on AuraLive, we collect personal information such as your name, email address, phone number, university details, and emergency contact information. We also collect health and allergy data if provided voluntarily for your safety.</p>

          <h3 className="text-lg font-bold text-gray-900 mt-6">2. How We Use Your Data</h3>
          <p>Your data is used strictly to facilitate hostel bookings, manage room allocations, provide necessary services (like meals and laundry), and handle emergencies. Payment data is securely processed via Stripe and is never stored on our servers.</p>

          <h3 className="text-lg font-bold text-gray-900 mt-6">3. Data Sharing</h3>
          <p>We do not sell your personal data. Your basic contact and room information is shared only with our verified service partners (Maintainers, Laundry Partners, Meal Suppliers) specifically assigned to your hostel.</p>

          <h3 className="text-lg font-bold text-gray-900 mt-6">4. Security</h3>
          <p>We implement strict security measures to protect your data, including encrypted passwords and secure server protocols.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;