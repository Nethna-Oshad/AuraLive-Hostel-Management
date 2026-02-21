import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const MealSupplierRegistration = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register-meal-supplier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/meal/dashboard'); // Redirects to their dashboard after login
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-gray-50">
      <div className="w-full max-w-lg p-8 bg-white border border-gray-100 shadow-xl rounded-2xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">Meal Supplier Registration</h2>
        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" required onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Business or Full Name" />
          <input type="email" name="email" required onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Email Address" />
          <input type="text" name="phone" required onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Phone Number" />
          <input type="password" name="password" required onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Password" />
          <input type="password" name="confirmPassword" required onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Confirm Password" />
          <button type="submit" className="w-full py-3 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Register as Supplier</button>
        </form>
        <p className="mt-4 text-center">Already registered? <Link to="/login" className="text-indigo-600 font-medium hover:underline">Login here</Link></p>
      </div>
    </div>
  );
};

export default MealSupplierRegistration;