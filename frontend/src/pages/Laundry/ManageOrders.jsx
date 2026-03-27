import React, { useState, useEffect } from 'react';
import LaundrySidebar from './LaundrySidebar';
import LaundryNavbar from './LaundryNavbar';
import { Clock, CheckCircle, Package, User, Phone, Calendar, RefreshCcw, Image as ImageIcon, X, Zap, Crown } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null); 
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/laundry/partner/${userInfo._id}`);
      const data = await response.json();
      
      if (response.ok) {
        const activeOrders = Array.isArray(data) 
          ? data.filter(order => order.status !== 'Completed') 
          : [];
        setOrders(activeOrders);
      }
    } catch (error) {
      toast.error("Orders load karanna bari una!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/laundry/order-status/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        toast.success(`Order marked as ${newStatus}!`);
        fetchOrders();
      }
    } catch (error) {
      toast.error("Server error logic update failed!");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Toaster position="top-center" />
      <LaundrySidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <LaundryNavbar />
        <main className="flex-1 overflow-y-auto p-8">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Active Orders</h2>
              <p className="text-gray-500 mt-1 font-medium">Handle your incoming and ongoing laundry tasks.</p>
            </div>
            <button onClick={fetchOrders} className="p-3 bg-white border border-gray-200 rounded-2xl text-[#2872A1] hover:bg-blue-50 transition-all shadow-sm">
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-500 font-black animate-pulse text-lg tracking-widest uppercase">Loading Orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <Package className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold text-lg">No active orders at the moment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                      <th className="p-6">Student & Bag</th>
                      <th className="p-6">Service Details</th>
                      <th className="p-6">Timeline</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-right">Operation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order._id} className={`transition-all ${order.isPremiumOrder ? 'bg-amber-50/30' : 'hover:bg-gray-50/30'}`}>
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="relative cursor-pointer" onClick={() => order.photo && setSelectedImg(`http://localhost:5000${order.photo}`)}>
                              {order.photo ? (
                                <img 
                                  src={`http://localhost:5000${order.photo}`} 
                                  alt="Bag" 
                                  className={`w-14 h-14 rounded-2xl object-cover border-2 shadow-sm transition-transform hover:scale-110 ${order.isPremiumOrder ? 'border-amber-400' : 'border-white'}`}
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
                                  <ImageIcon className="w-6 h-6" />
                                </div>
                              )}
                              {order.isPremiumOrder && (
                                <div className="absolute -top-2 -left-2 bg-amber-500 text-white p-1 rounded-full shadow-lg border-2 border-white">
                                  <Crown className="w-3 h-3 fill-current" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-black text-gray-800">{order.studentId?.name || 'User'}</p>
                                {order.isPremiumOrder && (
                                  <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-tighter animate-pulse">Premium</span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 font-bold mt-0.5 uppercase tracking-wider">{order.studentId?.phone || 'No Phone'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col">
                            <span className="font-black text-gray-700 text-sm flex items-center gap-1.5 uppercase">
                              <Package className={`w-4 h-4 ${order.isPremiumOrder ? 'text-amber-500' : 'text-[#2872A1]'}`} /> {order.weightInKg} Kg
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{order.serviceType}</span>
                            <span className={`text-[11px] font-black mt-2 ${order.isPremiumOrder ? 'text-amber-600' : 'text-[#2872A1]'}`}>RS. {order.finalPrice}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${order.isPremiumOrder ? 'bg-red-50 border-red-100 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                            <Clock className={`w-4 h-4 ${order.isPremiumOrder ? 'animate-pulse' : ''}`} />
                            <span className="text-xs font-black uppercase tracking-tight">
                              {new Date(order.expectedDate).toLocaleDateString()}
                            </span>
                          </div>
                          {order.isPremiumOrder && <p className="text-[9px] text-red-500 font-black mt-1 uppercase tracking-tighter">Urgent Delivery</p>}
                        </td>
                        <td className="p-6">
                          <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center w-max shadow-sm border ${
                            order.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                            'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {order.status}
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            {order.status === 'Pending' && (
                              <button onClick={() => handleUpdateStatus(order._id, 'Accepted')} className="bg-[#2872A1] text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-100 hover:bg-[#1e567a] transition-all">Accept</button>
                            )}
                            {order.status === 'Accepted' && (
                              <button onClick={() => handleUpdateStatus(order._id, 'Washing')} className="bg-purple-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all">Wash</button>
                            )}
                            {order.status === 'Washing' && (
                              <button onClick={() => handleUpdateStatus(order._id, 'Completed')} className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">Deliver</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* PHOTO PREVIEW MODAL */}
      {selectedImg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={() => setSelectedImg(null)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button className="absolute -top-12 right-0 text-white p-2 hover:bg-white/10 rounded-full transition-all" onClick={() => setSelectedImg(null)}>
              <X className="w-8 h-8" />
            </button>
            <img src={selectedImg} alt="Bag Full View" className="w-full h-auto max-h-[85vh] object-contain rounded-3xl shadow-2xl border-4 border-white/10" />
            <div className="mt-4 text-center text-white/50 font-black uppercase tracking-[0.3em] text-[10px]">Verification Image</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;