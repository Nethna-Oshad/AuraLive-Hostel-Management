import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, LogOut, ShoppingBag, UtensilsCrossed, Wrench, UserCircle2, ChevronDown } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [profileImg, setProfileImg] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Fetch the profile picture dynamically when the Navbar loads
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (userInfo && userInfo.role === 'Student') {
        try {
          const response = await axios.get(`http://localhost:5000/api/bookings/${userInfo.email}`);
          if (response.data.profileImage) {
            setProfileImg(response.data.profileImage);
          }
        } catch (error) { // 👈 මෙතන 'err' එක 'error' කරලා පල්ලෙහා පාවිච්චි කළා
          console.log("Could not fetch profile pic or user has no booking yet.", error);
        }
      }
    };
    fetchProfilePic();
  }, [userInfo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 border-b border-gray-100 backdrop-blur-md shadow-sm">
      <div className="container relative flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        
        {/* Left Side: Brand Logo */}
        <div className="flex-shrink-0 z-10">
          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-gray-900 hover:opacity-90 transition-opacity">
            <img src="/Logo.png" alt="AuraLive Logo" className="w-10 h-10 object-contain" />
            <span>Aura<span className="text-[#2872A1]">Live</span></span>
          </Link>
        </div>
        
        {/* Center: Navigation Links */}
        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center space-x-8 text-sm font-bold">
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
        <div className="flex-shrink-0 flex items-center z-10">
          {userInfo ? (
            <div className="flex items-center space-x-3 md:space-x-5">
              
              

              {/* CREATIVE PROFILE BADGE (Clickable) */}
              {userInfo.role === 'Student' ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className={`flex items-center gap-3 p-1 pr-3 rounded-full transition-all duration-300 group ${
                      isProfileMenuOpen
                        ? 'bg-white border border-[#CBDDE9] shadow-md'
                        : 'bg-gray-50 border border-transparent hover:border-gray-200 hover:shadow-sm'
                    }`}
                    title="Open profile menu"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#2872A1] text-white flex items-center justify-center font-bold text-sm shadow-inner overflow-hidden border-2 border-white ring-2 ring-[#CBDDE9] group-hover:ring-[#2872A1] transition-all">
                      {profileImg ? (
                        <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        userInfo.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="hidden sm:block text-sm text-gray-500 font-medium">
                      Hi, <span className="font-bold text-[#2872A1]">{userInfo.name.split(' ')[0]}</span>
                    </span>
                    <ChevronDown
                      className={`hidden sm:block w-4 h-4 text-[#2872A1] transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md border border-[#CBDDE9] rounded-2xl shadow-xl p-2 transition-all duration-200">
                      <div className="px-3 py-2 mb-2 rounded-xl bg-gradient-to-r from-[#eaf3f9] to-white border border-[#dbeaf4]">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-bold text-[#1f5a80] truncate">{userInfo.name}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-[#eef5fa] hover:text-[#1f5a80] transition-colors duration-200"
                      >
                        <UserCircle2 className="w-4 h-4" />
                        Profile
                      </Link>

                      <Link
                        to="/student/meals"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-[#eef5fa] hover:text-[#1f5a80] transition-colors duration-200"
                      >
                        <UtensilsCrossed className="w-4 h-4" />
                        Meals
                      </Link>

                      <Link
                        to="/student/my-orders"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-[#eef5fa] hover:text-[#1f5a80] transition-colors duration-200"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Laundry Orders
                      </Link>

                      <Link
                        to="/student/my-maintenance"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-[#eef5fa] hover:text-[#1f5a80] transition-colors duration-200"
                      >
                        <Wrench className="w-4 h-4" />
                        Maintenance
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 bg-[#CBDDE9]/20 px-4 py-1.5 rounded-full border border-[#CBDDE9]/50">
                  <span className="text-gray-600">
                    Hi, <span className="font-bold text-[#2872A1]">{userInfo.name.split(' ')[0]}</span>
                  </span>
                </div>
              )}
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-1.5 px-3 py-2 md:px-4 text-sm font-bold text-red-500 transition-all duration-200 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white hover:shadow-md hover:-translate-y-0.5"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
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