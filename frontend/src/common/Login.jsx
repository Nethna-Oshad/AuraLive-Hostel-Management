import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// FIXED: Added AlertCircle to the import
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  // Fetch stats when the page loads
  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/stats');
        if (response.ok) {
          const data = await response.json();
          if (isMounted) setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch system stats", err);
      }
    };
    
    fetchStats();
    return () => { isMounted = false; };
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

  // Helper component to render a beautiful frosted-glass stat card
  const StatCard = ({ title, icon, data }) => (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-xl hover:bg-white/20 transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shadow-inner">
          {icon}
        </div>
        <h3 className="text-white font-bold tracking-wide">{title}</h3>
      </div>
      {/* FIXED: Changed dataCount to data */}
      {data ? (
        <div className="flex justify-between items-end">
          <div>
            <p className="text-gray-300 text-[10px] uppercase tracking-widest font-extrabold mb-1">Total</p>
            <p className="text-3xl font-extrabold text-white leading-none">{data.total}</p>
          </div>
          <div className="flex flex-col gap-1.5 text-right">
            <span className="bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {data.active} Active
            </span>
            <span className="bg-orange-500/20 text-orange-100 border border-orange-400/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {data.inactive || data.pending} Pending
            </span>
          </div>
        </div>
      ) : (
        <div className="animate-pulse flex space-x-4 h-12 items-center text-gray-300 text-sm font-medium">
          Loading data...
        </div>
      )}
    </div>
  );

  return (
    // STRICT NO SCROLLING: h-screen and overflow-hidden lock the page to the exact monitor height
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      
      {/* Left Side: System Statistics & Beautiful Image */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-12 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80")' }}
      >
        {/* Dark/Blue gradient overlay to make text readable over the image */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f]/95 via-[#1f5a80]/85 to-[#2872A1]/70 z-0"></div>

        <div className="relative z-10 max-w-lg w-full mx-auto">
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
            Aura<span className="text-[#CBDDE9]">Live</span> Network
          </h1>
          <p className="text-gray-200 mb-12 text-lg font-medium drop-shadow-md leading-relaxed">
            Join our premium ecosystem of modern student accommodations and trusted service providers.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <StatCard title="Students" icon="🎓" data={stats?.students} />
            <StatCard title="Laundry" icon="👕" data={stats?.laundry} />
            <StatCard title="Meals" icon="🍲" data={stats?.meals} />
            <StatCard title="Maintenance" icon="🔧" data={stats?.maintainers} />
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        {/* Background decorative blob for the right side */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#CBDDE9]/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md p-10 bg-white border border-gray-100 shadow-2xl shadow-[#CBDDE9]/30 rounded-[2rem] relative z-10">
          <div className="mb-10 text-center">
            {/* Show Logo on mobile only */}
            <h2 className="text-4xl font-extrabold text-gray-900 lg:hidden mb-2">
              Aura<span className="text-[#2872A1]">Live</span>
            </h2>
            <h2 className="text-3xl font-extrabold text-gray-900 hidden lg:block tracking-tight">Welcome Back</h2>
            <p className="mt-3 text-sm text-gray-500 font-medium">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                name="email" 
                required 
                onChange={handleChange} 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] focus:bg-white outline-none transition-all text-gray-800 font-medium" 
                placeholder="Enter your email" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  required 
                  onChange={handleChange} 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] focus:bg-white outline-none transition-all text-gray-800 font-medium pr-12" 
                  placeholder="••••••••" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2872A1] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 mt-2 font-extrabold text-white transition-all bg-[#2872A1] rounded-xl shadow-lg shadow-[#CBDDE9] hover:bg-[#1f5a80] hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 font-medium">
              New to AuraLive? <br className="lg:hidden" />
              <Link to="/register" className="font-extrabold text-[#2872A1] hover:text-[#1f5a80] transition-colors ml-1">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;