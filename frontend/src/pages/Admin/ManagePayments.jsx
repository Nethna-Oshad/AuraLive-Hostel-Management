import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import { TrendingUp, AlertCircle, FileText, CheckCircle, Clock } from 'lucide-react';

const ManagePayments = () => {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, pendingDues: 0, paidCount: 0, unpaidCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch both the Stats and the Full Invoice List at the same time
      const [statsRes, invoicesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/invoices/stats'),
        axios.get('http://localhost:5000/api/invoices')
      ]);

      setStats(statsRes.data);
      setInvoices(invoicesRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Financial Dashboard</h2>
            <p className="text-gray-500">Track hostel revenue and student payments.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#2872A1]"></div>
            </div>
          ) : (
            <>
              {/* TOP STATS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#CBDDE9]/50 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Revenue</p>
                    <h3 className="text-2xl font-extrabold text-gray-900">Rs. {stats.totalRevenue.toLocaleString()}</h3>
                  </div>
                </div>

                {/* Pending Dues */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#CBDDE9]/50 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pending Dues</p>
                    <h3 className="text-2xl font-extrabold text-gray-900">Rs. {stats.pendingDues.toLocaleString()}</h3>
                  </div>
                </div>

                {/* Paid Invoices */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#CBDDE9]/50 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-[#2872A1] flex items-center justify-center shrink-0">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Paid Receipts</p>
                    <h3 className="text-2xl font-extrabold text-gray-900">{stats.paidCount} Transactions</h3>
                  </div>
                </div>

                {/* Unpaid Invoices */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#CBDDE9]/50 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Unpaid Bills</p>
                    <h3 className="text-2xl font-extrabold text-gray-900">{stats.unpaidCount} Pending</h3>
                  </div>
                </div>
              </div>

              {/* TRANSACTIONS TABLE */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#2872A1]" />
                  <h3 className="text-lg font-bold text-gray-800">All Transaction History</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                        <th className="p-4 font-bold">Student Details</th>
                        <th className="p-4 font-bold">Room & Description</th>
                        <th className="p-4 font-bold">Amount</th>
                        <th className="p-4 font-bold">Date</th>
                        <th className="p-4 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {invoices.length > 0 ? invoices.map((invoice) => (
                        <tr key={invoice._id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-gray-900">{invoice.studentName}</p>
                            <p className="text-xs text-gray-500">{invoice.studentEmail}</p>
                          </td>
                          <td className="p-4">
                            <span className="inline-block px-2.5 py-1 bg-[#CBDDE9]/30 text-[#2872A1] font-bold rounded-md text-xs mb-1">
                              Room {invoice.roomNumber}
                            </span>
                            <p className="text-gray-600 text-xs">{invoice.description}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-extrabold text-gray-900 text-base">Rs. {invoice.amount.toLocaleString()}</p>
                          </td>
                          <td className="p-4 text-gray-600 font-medium">
                            {new Date(invoice.createdAt).toLocaleDateString('en-GB')}
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center w-fit gap-1.5 shadow-sm border ${
                              invoice.status === 'Paid' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-red-50 text-red-600 border-red-100'
                            }`}>
                              {invoice.status === 'Paid' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                              {invoice.status}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="p-12 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-400">
                              <FileText className="w-12 h-12 mb-3 opacity-20" />
                              <p className="font-bold text-gray-500">No payment records found.</p>
                              <p className="text-xs mt-1">When students pay via Stripe, their receipts will appear here.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManagePayments;