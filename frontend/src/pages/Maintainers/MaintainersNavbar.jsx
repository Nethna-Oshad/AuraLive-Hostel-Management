import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ShieldCheck } from 'lucide-react'; 
import axios from 'axios'; 

const MaintainersNavbar = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userId = userInfo?._id;
  const [profileImg, setProfileImg] = useState(null); 

  
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (userId) {
        try {
          const res = await axios.get(`http://localhost:5000/api/maintainers/${userId}`);
          if (res.data && res.data.profileImage) {
            setProfileImg(res.data.profileImage);
          }
        } catch (error) {
          console.error("Failed to fetch profile picture", error);
        }
      }
    };
    fetchProfilePic();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 border-b border-slate-100 backdrop-blur-md">
      <div className="flex items-center justify-between px-8 py-4">
        
        {/* Left Side: Title */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex w-10 h-10 bg-slate-900 rounded-xl items-center justify-center text-white shadow-lg">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">Maintenance Portal</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Control</p>
          </div>
        </div>

        {/* Right Side: Profile & Logout */}
        <div className="flex items-center gap-6">
          
          {/* Profile Badge */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-800 leading-none">
                {userInfo?.name || 'Partner'}
              </p>
              <p className="text-[10px] font-bold text-[#2872A1] uppercase mt-1">Authorized Provider</p>
            </div>
            
            {/*  */}
            <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center text-[#2872A1] overflow-hidden">
              {profileImg ? (
                <img 
                  src={profileImg.startsWith('http') ? profileImg : `http://localhost:5000${profileImg}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User size={20} strokeWidth={2.5} />
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className="group flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest text-red-500 bg-red-50 border border-red-100 rounded-xl hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-100 transition-all duration-300 active:scale-95"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden md:block">Sign Out</span>
          </button>
          
        </div>
      </div>
    </nav>
  );
};

export default MaintainersNavbar;