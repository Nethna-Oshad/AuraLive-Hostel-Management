import React, { useState, useEffect } from 'react';
import { Wrench, Search, Star, Briefcase, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const ManageMaintainers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { 
    fetchUsers(); 
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/maintainers');
      if (res.ok) {
        setUsers(await res.json());
      } else {
        toast.error("Failed to fetch maintainers");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Server error while loading data");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    const loadingToast = toast.loading("Updating status...");
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: 'Maintainer', status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Maintainer marked as ${newStatus}!`, { id: loadingToast });
        fetchUsers(); // Refresh table
      } else {
        toast.error("Failed to update status", { id: loadingToast });
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Network error", { id: loadingToast });
    }
  };

  // Search Filter logic
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (user.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <Toaster position="top-center" />
        
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <Wrench className="w-8 h-8 text-[#2872A1]" /> Manage Maintainers
              </h2>
              <p className="text-gray-500 mt-1 font-medium text-sm">Approve technicians and monitor their performance.</p>
            </div>
            
            <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2 w-full md:w-auto">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or skill..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="outline-none text-sm w-full md:w-64 bg-transparent" 
              />
            </div>
          </div>
          
          {/* Main Table Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-500 font-bold animate-pulse">Loading technicians...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest font-bold">
                      <th className="p-5">Technician Details</th>
                      <th className="p-5">Specialization</th>
                      <th className="p-5">Performance</th>
                      <th className="p-5">Status</th>
                      <th className="p-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                        
                        {/* Name & Contact */}
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#CBDDE9]/40 text-[#2872A1] flex items-center justify-center font-bold text-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{user.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{user.phone} • {user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Specialization & Availability */}
                        <td className="p-5">
                          <span className="font-bold text-[#2872A1] bg-[#CBDDE9]/20 px-3 py-1 rounded-lg text-xs inline-block mb-1">
                            {user.specialization || 'General'}
                          </span>
                          <p className={`text-xs font-bold flex items-center gap-1 ${
                            user.availability === 'Available' ? 'text-emerald-500' : 
                            user.availability === 'On Job' ? 'text-blue-500' : 'text-gray-400'
                          }`}>
                            <Briefcase className="w-3 h-3" /> {user.availability || 'Available'}
                          </p>
                        </td>

                        {/* Performance (Jobs & Rating) */}
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Jobs</p>
                              <p className="font-bold text-gray-800">{user.jobsCompleted || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rating</p>
                              <p className="font-bold text-gray-800 flex items-center gap-1">
                                {user.averageRating ? user.averageRating.toFixed(1) : '0.0'} 
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Account Status */}
                        <td className="p-5">
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 w-max border ${
                            user.status === 'Active' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                              : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {user.status === 'Active' ? <ShieldCheck className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {user.status || 'Inactive'}
                          </span>
                        </td>

                        {/* Action Button */}
                        <td className="p-5 text-right">
                          <button 
                            onClick={() => toggleStatus(user._id, user.status)} 
                            className={`px-5 py-2 rounded-xl text-white font-bold text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2 ml-auto ${
                              user.status === 'Active' 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-[#2872A1] hover:bg-[#1f5a80]'
                            }`}
                          >
                            {user.status === 'Active' ? 'Suspend' : (
                              <><CheckCircle className="w-4 h-4" /> Approve</>
                            )}
                          </button>
                        </td>
                        
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="p-12 text-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-800">No Maintainers Found</h3>
                          <p className="text-gray-500 mt-2">Try adjusting your search criteria.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
        </main>
      </div>
    </div>
  );
};

export default ManageMaintainers;