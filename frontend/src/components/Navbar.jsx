import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LogIn, UserPlus, LogOut, User, UtensilsCrossed } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [profileImg, setProfileImg] = useState(null);

  // Fetch the profile picture dynamically when the Navbar loads
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (userInfo && userInfo.role === 'Student') {
        try {
          const response = await axios.get(`http://localhost:5000/api/bookings/${userInfo.email}`);
          if (response.data.profileImage) {
            setProfileImg(response.data.profileImage);
          }
        } catch (err) {
          // Fails silently if they haven't booked a room yet, which is fine!
        }
      }
    };
    fetchProfilePic();
  }, [userInfo]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 border-b border-gray-100 backdrop-blur-md shadow-sm">
      <div className="container flex items-center justify-between px-6 py-4 mx-auto max-w-7xl relative">
        
        {/* Left Side: Brand Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-gray-900 hover:opacity-90 transition-opacity z-10">
          <img src="/Logo.png" alt="AuraLive Logo" className="w-10 h-10 object-contain" />
          <span>Aura<span className="text-[#2872A1]">Live</span></span>
        </Link>
        
        {/* Center: Navigation Links (No Icons) */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-bold absolute left-1/2 transform -translate-x-1/2">
          <Link to="/home" className="text-gray-600 hover:text-[#2872A1] transition-colors duration-200">
            Home
          </Link>
          <Link to="/about-us" className="text-gray-600 hover:text-[#2872A1] transition-colors duration-200">
            About Us
          </Link>
          <Link to="/services" className="text-gray-600 hover:text-[#2872A1] transition-colors duration-200">
            Services
          </Link>
          <Link to="/help-center" className="text-gray-600 hover:text-[#2872A1] transition-colors duration-200">
            Contact Us
          </Link>
        </div>
        
        {/* Right Side: Auth Buttons & Profile */}
        <div className="flex items-center z-10">
          {userInfo ? (
            <div className="flex items-center space-x-5">
              
              {/* NEW: Profile Button (Only visible to Students) */}
              {userInfo.role === 'Student' && (
                <>
                  <Link to="/student/meals" className="flex items-center gap-1.5 text-gray-600 font-bold transition-colors duration-200 hover:text-[#2872A1]">
                    <UtensilsCrossed className="w-4 h-4" />
                    Meals
                  </Link>
                  <Link to="/profile" className="flex items-center gap-1.5 text-gray-600 font-bold transition-colors duration-200 hover:text-[#2872A1]">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </>
              )}

              {/* User Badge */}
              <div className="flex items-center gap-2 bg-[#CBDDE9]/20 px-4 py-1.5 rounded-full border border-[#CBDDE9]/50">
                <span className="text-gray-600">
                  Hi, <span className="font-bold text-[#2872A1]">{userInfo.name.split(' ')[0]}</span>
                </span>
              </div>
              
              {/* CREATIVE PROFILE BADGE */}
              {userInfo.role === 'Student' && (
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 p-1 pr-4 bg-gray-50 border border-transparent hover:border-gray-200 rounded-full transition-all duration-300 hover:shadow-sm group"
                  title="Go to Profile"
                >
                  <div className="w-9 h-9 rounded-full bg-[#2872A1] text-white flex items-center justify-center font-bold text-sm shadow-inner overflow-hidden border-2 border-white ring-2 ring-[#CBDDE9] group-hover:ring-[#2872A1] transition-all">
                    {profileImg ? (
                      <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      userInfo.name.charAt(0).toUpperCase()
                    )}
                  </div>
                </Link>
              )}
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-red-500 transition-all duration-200 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white hover:shadow-md hover:-translate-y-0.5"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-5">
              <Link to="/login" className="flex items-center gap-1.5 text-gray-600 font-bold transition-colors duration-200 hover:text-[#2872A1]">
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              
              <Link 
                to="/register" 
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 bg-[#2872A1] rounded-xl shadow-md shadow-[#CBDDE9] hover:bg-[#1f5a80] hover:-translate-y-0.5"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;