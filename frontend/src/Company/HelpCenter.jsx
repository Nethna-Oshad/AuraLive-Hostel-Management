import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LifeBuoy, Mail, Phone, MessageSquare, Send, Loader2, CheckCircle2 } from 'lucide-react';

const HelpCenter = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      await axios.post('http://localhost:5000/api/contact', formData);
      setStatus({ loading: false, success: true, error: '' });
      setFormData({ name: '', email: '', phone: '', message: '' }); // Clear form
      
      // Hide success message after 5 seconds
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
    } catch (err) {
      setStatus({ loading: false, success: false, error: 'Failed to send message. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
        className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-10"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Help Center</h1>
          <p className="text-gray-500 text-lg">How can we support you today?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* LEFT SIDE: Info & FAQ */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              <div className="p-6 bg-[#CBDDE9]/20 rounded-2xl border border-[#CBDDE9]/50">
                <Mail className="w-6 h-6 text-[#2872A1] mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Email Support</h3>
                <p className="text-sm text-gray-600 mb-3">We typically reply within 24 hours.</p>
                <a href="mailto:hello@auralive.lk" className="text-[#2872A1] font-bold text-sm hover:underline">hello@auralive.lk</a>
              </div>
              
              <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100">
                <Phone className="w-6 h-6 text-orange-500 mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Emergency</h3>
                <p className="text-sm text-gray-600 mb-3">Available 24/7 for urgent issues.</p>
                <a href="tel:+94771234567" className="text-orange-500 font-bold text-sm hover:underline">+94 77 123 4567</a>
              </div>
            </div>

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

          {/* RIGHT SIDE: Contact Form */}
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-6">Send us a Message</h3>
            
            {status.success && (
              <div className="mb-6 bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
                <p className="font-bold text-sm">Message sent successfully! We'll get back to you soon.</p>
              </div>
            )}

            {status.error && (
              <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                {status.error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2872A1] focus:ring-2 focus:ring-[#CBDDE9] outline-none transition-all" placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2872A1] focus:ring-2 focus:ring-[#CBDDE9] outline-none transition-all" placeholder="john@student.sliit.lk" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2872A1] focus:ring-2 focus:ring-[#CBDDE9] outline-none transition-all" placeholder="07X XXX XXXX" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Your Message</label>
                <textarea required name="message" value={formData.message} onChange={handleChange} rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2872A1] focus:ring-2 focus:ring-[#CBDDE9] outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <button disabled={status.loading} type="submit" className="w-full py-4 bg-[#2872A1] hover:bg-[#1f5a80] text-white rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 shadow-lg disabled:opacity-70">
                {status.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HelpCenter;