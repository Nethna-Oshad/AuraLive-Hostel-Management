import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, Shirt } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const LaundryRegistration = () => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', password: '', confirmPassword: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match!');
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register-laundry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.name, 
          email: formData.email, 
          phone: formData.phone, 
          password: formData.password 
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      
      toast.success('Registration Successful! 🎉');
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      setTimeout(() => {
        navigate('/laundry/dashboard');
      }, 1500);
      
    } catch (err) { 
      toast.error(err.message); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 bg-[#F8FAFC] font-sans">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-xl">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <Shirt className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Become a Partner</h2>
          <p className="text-gray-500 font-medium mt-2">Join AuraWash and grow your laundry business.</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 relative overflow-hidden">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Business Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" name="name" required onChange={handleChange} 
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all font-semibold"
                  placeholder="e.g. QuickWash Malabe" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="email" name="email" required onChange={handleChange} 
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all font-semibold"
                    placeholder="hello@shop.com" 
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="text" name="phone" required onChange={handleChange} 
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all font-semibold"
                    placeholder="07x xxx xxxx" 
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Create Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} name="password" required onChange={handleChange} 
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all font-semibold"
                  placeholder="••••••••" 
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5 pb-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="password" name="confirmPassword" required onChange={handleChange} 
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all font-semibold"
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Finalizing...</>
              ) : "Create Partner Account"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <p className="text-gray-500 font-semibold">
              Already have an account? <Link to="/login" className="text-blue-600 hover:underline decoration-2 underline-offset-4">Sign in here</Link>
            </p>
          </div>
        </div>
        
        <p className="mt-6 text-center text-xs text-gray-400 font-medium">
          By registering, you agree to AuraWash Partner Terms & Conditions.
        </p>
      </div>
    </div>
  );
};

export default LaundryRegistration;