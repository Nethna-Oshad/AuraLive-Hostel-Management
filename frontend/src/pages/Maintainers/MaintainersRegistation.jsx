import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Wrench, ArrowRight, AlertTriangle } from 'lucide-react';

const MaintainersRegistration = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register-maintainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/maintainer/dashboard'); 
    } catch (err) { 
      setError(err.message); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-[#F8FAFC] font-sans px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white border border-slate-100 shadow-2xl shadow-blue-900/5 rounded-[2.5rem] overflow-hidden"
      >
        {/* HEADER SECTION */}
        <div className="bg-[#2872A1] p-8 text-center relative overflow-hidden">
          {/* Decorative background icon */}
          <Wrench className="absolute -top-4 -right-4 w-32 h-32 text-white/10 -rotate-12 pointer-events-none" />
          
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Maintainer Portal</h2>
          <p className="text-blue-100 text-sm font-medium mt-1">Join the AuraFix technical support team</p>
        </div>

        <div className="p-8">
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 p-4 mb-6 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAME INPUT */}
            <div className="relative flex items-center">
              <User className="absolute left-4 w-5 h-5 text-slate-400" />
              <input type="text" name="name" required onChange={handleChange} 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#2872A1] focus:ring-4 focus:ring-[#CBDDE9]/40 transition-all font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium" 
                placeholder="Full Name" 
              />
            </div>

            {/* EMAIL INPUT */}
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-5 h-5 text-slate-400" />
              <input type="email" name="email" required onChange={handleChange} 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#2872A1] focus:ring-4 focus:ring-[#CBDDE9]/40 transition-all font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium" 
                placeholder="Email Address" 
              />
            </div>

            {/* PHONE INPUT */}
            <div className="relative flex items-center">
              <Phone className="absolute left-4 w-5 h-5 text-slate-400" />
              <input type="text" name="phone" required onChange={handleChange} 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#2872A1] focus:ring-4 focus:ring-[#CBDDE9]/40 transition-all font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium" 
                placeholder="Phone Number" 
              />
            </div>

            {/* PASSWORD INPUT */}
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-5 h-5 text-slate-400" />
              <input type="password" name="password" required onChange={handleChange} 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#2872A1] focus:ring-4 focus:ring-[#CBDDE9]/40 transition-all font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium" 
                placeholder="Create Password" 
              />
            </div>

            {/* CONFIRM PASSWORD INPUT */}
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-5 h-5 text-slate-400" />
              <input type="password" name="confirmPassword" required onChange={handleChange} 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#2872A1] focus:ring-4 focus:ring-[#CBDDE9]/40 transition-all font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium" 
                placeholder="Confirm Password" 
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 mt-2 font-black text-[11px] uppercase tracking-[0.2em] text-white bg-[#2872A1] rounded-2xl hover:bg-[#1f5a80] hover:-translate-y-0.5 transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? 'Creating Account...' : (
                <>Register as Maintainer <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* LOGIN LINK */}
          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-sm font-medium text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-[#2872A1] font-bold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MaintainersRegistration;