import React from 'react';
import { motion } from 'framer-motion';
import { Info, Home, Shield, Users } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-10"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-50 text-[#2872A1] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">About Aura<span className="text-[#2872A1]">Live</span></h1>
          <p className="text-gray-500 text-lg">Elevating the student living experience in Sri Lanka.</p>
        </div>

        <div className="space-y-8 text-gray-600 leading-relaxed">
          <p>
            Welcome to <strong>AuraLive</strong>, the premier hostel management and student accommodation platform designed specifically for university students in Sri Lanka. We understand that moving away from home can be daunting, which is why we built a platform to make finding and managing your hostel seamless and secure.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
              <Home className="w-8 h-8 text-[#2872A1] mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Modern Living</h3>
              <p className="text-sm">High-quality, verified rooms near your campus.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
              <Shield className="w-8 h-8 text-[#2872A1] mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Secure & Safe</h3>
              <p className="text-sm">Trusted providers and secure online payments.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
              <Users className="w-8 h-8 text-[#2872A1] mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Community</h3>
              <p className="text-sm">Connecting students with essential daily services.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutUs;