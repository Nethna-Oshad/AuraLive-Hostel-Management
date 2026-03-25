import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Users } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match. Please try again.');
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save token to local storage and redirect
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/home'); 
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* Left Side: Brand & Value Prop (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#2872A1] p-12 flex-col justify-center relative overflow-hidden">
        
        {/* Decorative background circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#CBDDE9] blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#CBDDE9] blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-lg mx-auto w-full text-white">
          <h1 className="text-4xl font-extrabold mb-6 leading-tight">
            Start your journey with <br /> Aura<span className="text-[#CBDDE9]">Live</span>
          </h1>
          <p className="text-[#CBDDE9] mb-12 text-lg leading-relaxed">
            Join thousands of university students who have found their perfect, secure hostel accommodation through our platform.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-xl">🛡️</span>
              </div>
              <div>
                <h4 className="font-bold">Verified Hostels</h4>
                <p className="text-sm text-[#CBDDE9]">Every room is checked for safety and quality.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-xl">💳</span>
              </div>
              <div>
                <h4 className="font-bold">Secure Payments</h4>
                <p className="text-sm text-[#CBDDE9]">Pay your key money and rent safely online.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-lg p-8 bg-white border border-gray-100 shadow-2xl shadow-[#CBDDE9]/40 rounded-3xl"
        >
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 lg:hidden mb-2">
              Aura<span className="text-[#2872A1]">Live</span>
            </h2>
            <h2 className="text-2xl font-bold text-gray-800 hidden lg:block">Create Account</h2>
            <p className="mt-2 text-sm text-gray-500">Enter your details to get started as a student</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl font-medium flex items-center gap-2">
              <span className="text-lg">⚠️</span> {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Row 1: Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input type="text" name="name" required onChange={handleChange} className="w-full pl-10 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] focus:border-[#2872A1] focus:bg-white outline-none transition-all text-sm" placeholder="Nethna Oshad" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input type="text" name="phone" required onChange={handleChange} className="w-full pl-10 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] focus:border-[#2872A1] focus:bg-white outline-none transition-all text-sm" placeholder="07X XXX XXXX" />
                </div>
              </div>
            </div>

            {/* Row 2: Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input type="email" name="email" required onChange={handleChange} className="w-full pl-10 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] focus:border-[#2872A1] focus:bg-white outline-none transition-all text-sm" placeholder="student@example.com" />
              </div>
            </div>

            {/* Row 3: Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Users className="w-5 h-5" />
                </div>
                <select name="gender" required onChange={handleChange} className="w-full pl-10 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] focus:border-[#2872A1] focus:bg-white outline-none transition-all text-sm text-gray-700 cursor-pointer appearance-none">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Row 4: Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input type="password" name="password" required onChange={handleChange} className="w-full pl-10 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] focus:border-[#2872A1] focus:bg-white outline-none transition-all text-sm" placeholder="••••••••" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input type="password" name="confirmPassword" required onChange={handleChange} className="w-full pl-10 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] focus:border-[#2872A1] focus:bg-white outline-none transition-all text-sm" placeholder="••••••••" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 mt-6 font-bold text-white transition-all bg-[#2872A1] rounded-xl shadow-lg shadow-[#CBDDE9] hover:bg-[#1f5a80] hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin text-xl">⏳</span> Creating Account...</>
              ) : (
                'Register Account'
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Already have an account? 
              <Link to="/login" className="font-bold text-[#2872A1] hover:text-[#1f5a80] hover:underline ml-1.5">
                Sign In here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Register;