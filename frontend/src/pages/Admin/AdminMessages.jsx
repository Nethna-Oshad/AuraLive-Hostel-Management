import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Phone, CheckCircle, Clock, MessageSquare, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/contact');
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Server error while loading messages");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    const loadingToast = toast.loading("Updating status...");
    try {
      await axios.patch(`http://localhost:5000/api/contact/${id}`, { status: 'Read' });
      // Update UI locally
      setMessages(messages.map(msg => msg._id === id ? { ...msg, status: 'Read' } : msg));
      toast.success("Message marked as read!", { id: loadingToast });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status", { id: loadingToast });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <Toaster position="top-center" />
        
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-[#2872A1]" /> Support Messages
              </h2>
              <p className="text-gray-500 mt-1 font-medium text-sm">Review and respond to inquiries from the Help Center.</p>
            </div>
          </div>
          
          {/* Main Table Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-500 font-bold animate-pulse">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No Messages Found</h3>
                <p className="text-gray-500 mt-2">There are currently no support inquiries.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest font-bold">
                      <th className="p-5">Status</th>
                      <th className="p-5">Date</th>
                      <th className="p-5">Sender Info</th>
                      <th className="p-5">Message</th>
                      <th className="p-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {messages.map((msg) => (
                      <tr 
                        key={msg._id} 
                        className={`transition-colors hover:bg-gray-50/50 ${msg.status === 'Unread' ? 'bg-[#f7fbff]' : ''}`}
                      >
                        {/* Status Label */}
                        <td className="p-5">
                          {msg.status === 'Unread' ? (
                            <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-xl">
                              <Clock className="w-3.5 h-3.5"/> Unread
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-xl">
                              <CheckCircle className="w-3.5 h-3.5"/> Read
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="p-5 text-sm text-gray-500 font-medium">
                          {new Date(msg.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>

                        {/* Sender Info */}
                        <td className="p-5">
                          <div className="font-bold text-gray-900">{msg.name}</div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <Mail className="w-3.5 h-3.5 text-[#2872A1]" /> {msg.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <Phone className="w-3.5 h-3.5 text-[#2872A1]" /> {msg.phone}
                          </div>
                        </td>

                        {/* Message Content */}
                        <td className="p-5 text-sm text-gray-700 max-w-sm">
                          <p className="line-clamp-3 leading-relaxed">{msg.message}</p>
                        </td>

                        {/* Action Button */}
                        <td className="p-5 text-right">
                          {msg.status === 'Unread' && (
                            <button 
                              onClick={() => markAsRead(msg._id)}
                              className="px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2 ml-auto bg-[#2872A1] hover:bg-[#1f5a80]"
                            >
                              <CheckCircle className="w-4 h-4" /> Mark Read
                            </button>
                          )}
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

export default AdminMessages;