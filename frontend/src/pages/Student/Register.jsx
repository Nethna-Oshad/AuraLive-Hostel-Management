import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      const response = await fetch('http://localhost:5000/api/students/register', {
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

      // Save token to local storage
      localStorage.setItem('studentInfo', JSON.stringify(data));
      navigate('/home'); // Redirect to dashboard/home after success
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Student Registration</h2>
        {error && <p className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="name" required onChange={handleChange} className="w-full p-2 mt-1 border rounded focus:ring focus:ring-blue-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" name="email" required onChange={handleChange} className="w-full p-2 mt-1 border rounded focus:ring focus:ring-blue-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input type="text" name="phone" required onChange={handleChange} className="w-full p-2 mt-1 border rounded focus:ring focus:ring-blue-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select name="gender" required onChange={handleChange} className="w-full p-2 mt-1 border rounded focus:ring focus:ring-blue-200">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" required onChange={handleChange} className="w-full p-2 mt-1 border rounded focus:ring focus:ring-blue-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input type="password" name="confirmPassword" required onChange={handleChange} className="w-full p-2 mt-1 border rounded focus:ring focus:ring-blue-200" />
          </div>

          <button type="submit" className="w-full py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700">
            Register
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;