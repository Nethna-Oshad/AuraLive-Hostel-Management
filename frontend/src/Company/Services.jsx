import React from 'react';
import { motion } from 'framer-motion';
import { BedDouble, Shirt, Utensils, Wrench, ShieldCheck } from 'lucide-react';

const Services = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
          >
            Our <span className="text-[#2872A1]">Services</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto"
          >
            AuraLive goes beyond just providing a bed. We offer a complete ecosystem designed to make university life effortless and comfortable.
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Service 1 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#CBDDE9] transition-all group">
            <div className="w-16 h-16 bg-blue-50 text-[#2872A1] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BedDouble className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Premium Accommodation</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Secure, fully-furnished rooms located close to your university. Filter by AC, room type, and capacity to find your perfect study environment.
            </p>
            <ul className="space-y-2 text-sm text-gray-500 font-medium">
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified properties</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure digital payments</li>
            </ul>
          </motion.div>

          {/* Service 2 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#CBDDE9] transition-all group">
            <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shirt className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Laundry Management</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Never worry about washing clothes during exam season. Connect directly with our trusted laundry partners right from your dashboard.
            </p>
            <ul className="space-y-2 text-sm text-gray-500 font-medium">
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Scheduled pickups</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Express washing available</li>
            </ul>
          </motion.div>

          {/* Service 3 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#CBDDE9] transition-all group">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Daily Meal Plans</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Get nutritious, home-cooked meals delivered straight to your hostel. Choose from daily subscriptions or order-on-demand from our certified food suppliers.
            </p>
            <ul className="space-y-2 text-sm text-gray-500 font-medium">
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Hygiene guaranteed</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Vegetarian & Non-Veg options</li>
            </ul>
          </motion.div>

          {/* Service 4 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#CBDDE9] transition-all group">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Wrench className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">On-Demand Maintenance</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              A broken fan or leaking pipe? Report it through your student portal and our dedicated maintenance staff will fix it promptly.
            </p>
            <ul className="space-y-2 text-sm text-gray-500 font-medium">
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> 24-hour response time</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Professional technicians</li>
            </ul>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Services;