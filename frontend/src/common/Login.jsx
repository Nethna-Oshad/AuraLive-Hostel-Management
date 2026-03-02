import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  // Fetch stats when the page loads
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch system stats", err);
      }
    };
    fetchStats();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('userInfo', JSON.stringify(data));

      switch(data.role) {
        case 'Admin': navigate('/admin/dashboard'); break;
        case 'Laundry': navigate('/laundry/dashboard'); break;
        case 'Maintainer': navigate('/maintainer/dashboard'); break;
        case 'MealSupplier': navigate('/meal/dashboard'); break;
        default: navigate('/home'); // Student
      }
      
    } catch (err) {
      setError(err.message);
    }
  };

  // Helper component to render a beautiful stat card
  const StatCard = ({ title, icon, data }) => (
    <div className="bg-white/10 backdrop-blur-md border border-[#CBDDE9]/20 p-5 rounded-2xl shadow-xl hover:bg-white/20 transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-white font-semibold text-lg">{title}</h3>
      </div>
      {data ? (
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[#CBDDE9] text-xs uppercase tracking-wider font-bold mb-1">Total</p>
            <p className="text-3xl font-bold text-white">{data.total}</p>
          </div>
          <div className="flex flex-col gap-2 text-right">
            <span className="bg-[#CBDDE9]/20 text-white border border-[#CBDDE9]/40 px-3 py-1 rounded-full text-xs font-bold">
              {data.active} Active
            </span>
            <span className="bg-red-500/30 text-red-100 border border-red-500/40 px-3 py-1 rounded-full text-xs font-bold">
              {data.inactive} Pending
            </span>
          </div>
        </div>
      ) : (
        <div className="animate-pulse flex space-x-4 h-12 items-center text-[#CBDDE9] text-sm">
          Loading data...
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* Left Side: System Statistics (Hidden on small screens) */}
      {/* Using your primary color #2872A1 as the main background */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#2872A1] p-12 flex-col justify-center relative overflow-hidden">
        
        {/* Decorative background circles using your light color #CBDDE9 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#CBDDE9] blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#CBDDE9] blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-lg mx-auto w-full">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Aura<span className="text-[#CBDDE9]">Live</span> Network
          </h1>
          <p className="text-[#CBDDE9] mb-10 text-lg">
            Join our growing ecosystem of students and trusted service providers.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard title="Students" icon="🎓" data={stats?.students} />
            <StatCard title="Laundry" icon="👕" data={stats?.laundry} />
            <StatCard title="Meals" icon="🍲" data={stats?.meals} />
            <StatCard title="Maintenance" icon="🔧" data={stats?.maintainers} />
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white border border-gray-100 shadow-2xl shadow-[#CBDDE9]/40 rounded-3xl">
          <div className="mb-8 text-center">
            {/* Show Logo on mobile only since desktop has it on the left */}
            <h2 className="text-3xl font-extrabold text-gray-900 lg:hidden mb-2">
              Aura<span className="text-[#2872A1]">Live</span>
            </h2>
            <h2 className="text-2xl font-bold text-gray-800 hidden lg:block">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-500">Sign in to your account to continue</p>
          </div>

          {error && <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl font-medium">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input 
                type="email" 
                name="email" 
                required 
                onChange={handleChange} 
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] focus:border-[#2872A1] focus:bg-white outline-none transition-all" 
                placeholder="Enter your email" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                onChange={handleChange} 
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] focus:border-[#2872A1] focus:bg-white outline-none transition-all" 
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-4 mt-4 font-bold text-white transition-all bg-[#2872A1] rounded-xl shadow-lg shadow-[#CBDDE9] hover:bg-[#1f5a80] hover:shadow-xl hover:-translate-y-0.5"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              New to AuraLive? <br className="lg:hidden" />
              <Link to="/register" className="font-bold text-[#2872A1] hover:text-[#1f5a80] hover:underline ml-1">
                Register as a Student
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;