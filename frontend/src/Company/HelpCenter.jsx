import React from 'react';
import { motion } from 'framer-motion';
import { LifeBuoy, Mail, Phone, MessageSquare } from 'lucide-react';

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-10"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Help Center</h1>
          <p className="text-gray-500 text-lg">How can we support you today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 bg-[#CBDDE9]/20 rounded-2xl border border-[#CBDDE9]/50 flex items-start gap-4">
            <Mail className="w-6 h-6 text-[#2872A1] shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Email Support</h3>
              <p className="text-sm text-gray-600 mb-3">Drop us an email. We typically reply within 24 hours.</p>
              <a href="mailto:hello@auralive.lk" className="text-[#2872A1] font-bold text-sm hover:underline">hello@auralive.lk</a>
            </div>
          </div>
          
          <div className="p-6 bg-[#CBDDE9]/20 rounded-2xl border border-[#CBDDE9]/50 flex items-start gap-4">
            <Phone className="w-6 h-6 text-[#2872A1] shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Emergency Hotline</h3>
              <p className="text-sm text-gray-600 mb-3">Available 24/7 for urgent hostel or safety issues.</p>
              <a href="tel:+94771234567" className="text-[#2872A1] font-bold text-sm hover:underline">+94 77 123 4567</a>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#2872A1]" /> Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <div className="p-5 border border-gray-100 rounded-xl bg-gray-50">
              <h4 className="font-bold text-gray-800 mb-2">How do I request maintenance?</h4>
              <p className="text-sm text-gray-600">Log into your student profile and click the "Room Issue?" button to submit a ticket directly to our maintenance team.</p>
            </div>
            <div className="p-5 border border-gray-100 rounded-xl bg-gray-50">
              <h4 className="font-bold text-gray-800 mb-2">Is my key money refundable?</h4>
              <p className="text-sm text-gray-600">Yes, your key money is kept secure and will be refunded when you move out, provided there is no damage to the room.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HelpCenter;