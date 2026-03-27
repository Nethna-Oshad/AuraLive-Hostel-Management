import React, { useState, useEffect } from 'react';
import LaundrySidebar from './LaundrySidebar';
import LaundryNavbar from './LaundryNavbar';
import { Package, User, Calendar, CheckCircle, Search, DollarSign } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const OrderHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/laundry/partner/${userInfo._id}`);
      const data = await response.json();
      if (response.ok) {
        // 👇 METHANA PENNANNE 'Completed' ORDERS WITHARAI
        const completedOrders = data.filter(order => order.status === 'Completed');
        setHistory(completedOrders);
      }
    } catch (error) {
      toast.error("History load error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Toaster position="top-center" />
      <LaundrySidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <LaundryNavbar />
        <main className="flex-1 overflow-y-auto p-8">
          
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black text-gray-900">Order History</h2>
              <p className="text-gray-500 mt-1 font-medium">List of all successfully delivered laundry orders.</p>
            </div>
            <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
              <p className="text-xs text-emerald-600 font-black uppercase tracking-widest">Total Completed</p>
              <p className="text-2xl font-black text-emerald-700">{history.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400 font-bold animate-pulse">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="p-16 text-center">
                <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">No completed orders found yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-widest font-black">
                      <th className="p-6">Student</th>
                      <th className="p-6">Details</th>
                      <th className="p-6">Completed Date</th>
                      <th className="p-6">Earnings</th>
                      <th className="p-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{order.studentId?.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold">{order.studentId?.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-50 text-[#2872A1] px-3 py-1 rounded-lg text-xs font-black uppercase">
                              {order.weightInKg} Kg
                            </span>
                            <span className="text-xs text-gray-500 font-medium">({order.serviceType})</span>
                          </div>
                        </td>
                        <td className="p-6 text-sm font-bold text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-300" />
                            {new Date(order.updatedAt).toLocaleDateString()} 
                          </div>
                        </td>
                        <td className="p-6 font-black text-gray-800">
                          Rs. {order.finalPrice}
                        </td>
                        <td className="p-6 text-right">
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">
                            <CheckCircle className="w-3 h-3" /> Delivered
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
    </div>
  );
};

export default OrderHistory;