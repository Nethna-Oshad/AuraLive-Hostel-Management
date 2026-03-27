import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shirt, Search, CheckCircle, XCircle, Star, Edit, X, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const ManageLaundry = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [editData, setEditData] = useState({ pricePerKg: 200, isPremium: false });

  useEffect(() => { 
    fetchUsers(); 
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/laundry');
      setUsers(await res.json());
    } catch (error) {
      toast.error("Failed to fetch partners");
    } finally {
      setLoading(false);
    }
  };

  // Status eka Active/Inactive karana eka
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch('http://localhost:5000/api/auth/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: 'Laundry', status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Partner marked as ${newStatus}!`);
        fetchUsers();
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  // Modal eka open karana eka
  const openConfigureModal = (partner) => {
    setSelectedPartner(partner);
    setEditData({ 
      pricePerKg: partner.pricePerKg || 200, 
      isPremium: partner.isPremium || false 
    });
    setIsModalOpen(true);
  };

  // Price & Premium Update karana eka (Api aluthen hadapu route ekata yanawa)
  const handleUpdatePartner = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/laundry/admin/partner/${selectedPartner._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        toast.success("Partner configuration updated! 🎉");
        setIsModalOpen(false);
        fetchUsers(); // Table eka refresh karanawa
      } else {
        toast.error("Failed to update partner.");
      }
    } catch (error) {
      toast.error("Server error.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <Toaster position="top-center" />
        
        <main className="flex-1 overflow-y-auto p-8">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <Shirt className="w-8 h-8 text-[#2872A1]" /> Manage Laundry Partners
              </h2>
              <p className="text-gray-500 mt-1 font-medium text-sm">Approve partners, set pricing, and assign Premium tiers.</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-500 font-bold animate-pulse">Loading partners...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest font-bold">
                      <th className="p-5">Business Details</th>
                      <th className="p-5">Pricing & Tier</th>
                      <th className="p-5">Status</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={user._id} className="hover:bg-gray-50/50 transition-colors">
                        
                        <td className="p-5">
                          <p className="font-bold text-gray-800 text-lg">{user.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{user.phone} • {user.email}</p>
                        </td>

                        <td className="p-5">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className="font-bold text-[#2872A1] bg-[#CBDDE9]/20 px-3 py-1 rounded-lg text-sm">
                              Rs. {user.pricePerKg || 200} / Kg
                            </span>
                            {user.isPremium && (
                              <span className="bg-yellow-100 text-yellow-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-700" /> Premium Partner
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-5">
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 w-max border ${
                            user.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {user.status === 'Active' ? <ShieldCheck className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {user.status || 'Inactive'}
                          </span>
                        </td>

                        <td className="p-5">
                          <div className="flex items-center justify-end gap-2">
                            {/* Configure Button */}
                            <button 
                              onClick={() => openConfigureModal(user)}
                              className="px-4 py-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold text-sm transition-all flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" /> Configure
                            </button>

                            {/* Status Button */}
                            <button 
                              onClick={() => toggleStatus(user._id, user.status)} 
                              className={`px-4 py-2 rounded-xl text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2 ${
                                user.status === 'Active' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#2872A1] hover:bg-[#1f5a80]'
                              }`}
                            >
                              {user.status === 'Active' ? 'Suspend' : <><CheckCircle className="w-4 h-4" /> Approve</>}
                            </button>
                          </div>
                        </td>
                        
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CONFIGURE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-[#2872A1] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold">Configure Partner</h3>
                <p className="text-blue-100 text-sm mt-1">{selectedPartner?.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdatePartner} className="p-6">
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Base Price (Rs. per 1 Kg) *</label>
                <input
                  type="number"
                  min="50"
                  value={editData.pricePerKg}
                  onChange={(e) => setEditData({...editData, pricePerKg: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2872A1] outline-none transition-all bg-gray-50 text-lg font-bold"
                  required
                />
              </div>

              <div className="mb-8 p-4 border border-yellow-200 bg-yellow-50 rounded-2xl flex items-start gap-3">
                <input 
                  type="checkbox" 
                  id="premiumCheck"
                  checked={editData.isPremium}
                  onChange={(e) => setEditData({...editData, isPremium: e.target.checked})}
                  className="mt-1 w-5 h-5 rounded text-[#2872A1] focus:ring-[#2872A1] cursor-pointer"
                />
                <label htmlFor="premiumCheck" className="cursor-pointer">
                  <p className="font-bold text-yellow-800 flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-800" /> Premium Partner Tier</p>
                  <p className="text-xs text-yellow-700 mt-1">If enabled, this partner will receive urgent/express delivery requests from students.</p>
                </label>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-[#2872A1] text-white rounded-xl font-bold hover:bg-[#1f5a80] transition-colors shadow-md">
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default ManageLaundry;