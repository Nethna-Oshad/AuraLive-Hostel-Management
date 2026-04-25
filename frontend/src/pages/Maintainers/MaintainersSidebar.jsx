import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  History, 
  Settings,
  CircleDot,
  User
} from 'lucide-react'; 

const MaintainersSidebar = () => {
  const location = useLocation();

  
  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return `group flex items-center gap-3 px-6 py-3.5 mx-3 rounded-2xl transition-all duration-300 ${
      isActive 
        ? "bg-[#2872A1] text-white shadow-lg shadow-blue-900/20" 
        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
    }`;
  };

  return (
    <aside className="flex flex-col w-72 min-h-screen bg-[#0F172A] border-r border-slate-800">
    
      {/* BRAND LOGO SECTION */}
      <div className="p-8 mb-4">
        <Link to="/maintainer/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#2872A1] rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
            <span className="text-white font-black text-xl">A</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">
            Aura<span className="text-[#2872A1]">Fix</span>
          </span>
        </Link>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 space-y-2">
        <p className="px-7 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4"> Main Menu </p>
        
        <Link to="/maintainer/dashboard" className={getLinkStyle('/maintainer/dashboard')}>
          <LayoutDashboard size={20} />
          <span className="font-bold text-sm">Dashboard</span>
          {location.pathname === '/maintainer/dashboard' && (
            <CircleDot size={10} className="ml-auto text-blue-200 animate-pulse" />
          )}
        </Link>

        <Link to="/maintainer/tasks" className={getLinkStyle('/maintainer/tasks')}>
          <ClipboardList size={20} />
          <span className="font-bold text-sm">Field Tasks</span>
        </Link>

        <Link to="/maintainer/completed" className={getLinkStyle('/maintainer/completed')}>
          <History size={20} />
          <span className="font-bold text-sm">Job History</span>
        </Link>

        <Link to="/maintainer/profile" className={getLinkStyle('/maintainer/profile')}>
          <User size={20} />
          <span className="font-bold text-sm">My Profile</span>
        </Link>
      </nav>

      {/* FOOTER SECTION */}
      <div className="p-6 mt-auto border-t border-slate-800/50">
        <div className="bg-slate-800/40 p-4 rounded-[1.5rem] border border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Active</span>
          </div>
          <Link to="/maintainer/profile" className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
            <Settings size={14} /> Account Settings
          </Link>
        </div>
      </div>

    </aside>
  );
};

export default MaintainersSidebar;