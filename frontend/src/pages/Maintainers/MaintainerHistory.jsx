import React, { useState, useEffect } from 'react';
import MaintainersSidebar from './MaintainersSidebar';
import MaintainersNavbar from './MaintainersNavbar';
import { CheckCircle2, History, User, Calendar } from 'lucide-react';

const MaintainerHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/maintenance/partner/${userInfo._id}`);
        const data = await res.json();
        if (res.ok) {
          // ඉවර කරපු වැඩ (Resolved) විතරක් ගන්නවා
          setHistory(data.filter(t => t.status === 'Resolved'));
        }
      } catch (err) { console.log(err); }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <MaintainersSidebar />
      <div className="flex flex-col flex-1">
        <MaintainersNavbar />
        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
              <History className="text-emerald-600" /> Task History
            </h2>
            <p className="text-gray-500 font-medium mt-1">Review your successfully completed maintenance works.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                    <th className="p-6">Date</th>
                    <th className="p-6">Issue Type</th>
                    <th className="p-6">Student Info</th>
                    <th className="p-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.length === 0 ? (
                    <tr><td colSpan="4" className="p-20 text-center text-gray-400 font-bold">No history records found.</td></tr>
                  ) : (
                    history.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="p-6 font-bold text-gray-400 text-xs">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="p-6">
                          <p className="font-black text-gray-800">{item.issueType}</p>
                          <p className="text-[10px] text-gray-400 uppercase mt-1 font-bold tracking-widest">{item.roomNumber ? `Room ${item.roomNumber}` : 'General'}</p>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                             <User className="w-3 h-3 text-emerald-500" />
                             <span className="text-sm font-bold text-gray-600">{item.studentId?.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-emerald-100">
                             Success Resolved
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MaintainerHistory;