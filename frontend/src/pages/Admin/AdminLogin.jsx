import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admins/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('adminInfo', JSON.stringify(data));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <h2 className="mb-6 text-3xl font-bold text-center text-white">AuraLive <span className="text-indigo-500">Admin</span></h2>
        {error && <p className="p-3 mb-4 text-sm text-red-200 bg-red-900/50 rounded-lg">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300">Admin Email</label>
            <input type="email" name="email" required onChange={handleChange} className="w-full p-3 mt-1 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input type="password" name="password" required onChange={handleChange} className="w-full p-3 mt-1 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <button type="submit" className="w-full py-3 font-bold text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700">
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;