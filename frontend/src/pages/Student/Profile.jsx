import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, ShieldCheck, Home as HomeIcon, 
  FileText, Wrench, Edit3, Save, X, AlertCircle, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  // Get base registration details from local storage
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // State for the editable form
  const [formData, setFormData] = useState({
    nicNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    specialRequests: ''
  });

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'Student') {
      navigate('/login');
      return;
    }

    // Fetch the extra student information using their email
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/bookings/${userInfo.email}`);
        setBookingData(response.data);
        // Pre-fill the edit form with their existing data
        setFormData({
          nicNumber: response.data.nicNumber || '',
          emergencyContactName: response.data.emergencyContactName || '',
          emergencyContactPhone: response.data.emergencyContactPhone || '',
          specialRequests: response.data.specialRequests || ''
        });
      } catch (err) {
        // If 404, it just means they haven't booked a room yet. That's fine!
        console.log("No booking found for this student.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userInfo, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/api/bookings/${bookingData._id}`, formData);
      setBookingData(response.data); // Update UI with new data
      setIsEditing(false);
      toast.success('Profile information updated successfully!');
    } catch (err) {
      toast.error('Failed to update information.');
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-gray-50"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2872A1]"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Student Profile</h1>
          <p className="text-gray-500">Manage your personal information and hostel details.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Registration Details & Maintenance */}
          <div className="space-y-8">
            
            {/* Account Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-[#CBDDE9]/40 z-0"></div>
              
              <div className="relative z-10 flex flex-col items-center mt-4">
                <div className="w-24 h-24 rounded-full bg-[#2872A1] text-white flex items-center justify-center text-4xl font-extrabold shadow-xl border-4 border-white mb-4">
                  {userInfo.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{userInfo.name}</h2>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider rounded-full mt-2 border border-emerald-100 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Student
                </span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                  <Mail className="w-5 h-5 text-[#2872A1]" />
                  <span className="text-sm font-medium">{userInfo.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                  <Phone className="w-5 h-5 text-[#2872A1]" />
                  <span className="text-sm font-medium">{userInfo.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                  <User className="w-5 h-5 text-[#2872A1]" />
                  <span className="text-sm font-medium">{userInfo.gender || 'Not provided'}</span>
                </div>
              </div>
            </motion.div>

            {/* CREATIVE MAINTENANCE BUTTON CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="relative rounded-3xl overflow-hidden shadow-lg group cursor-pointer"
              onClick={() => {
                // Future route for maintenance requests
                toast('Maintenance Request portal coming soon!', { icon: '🔧' });
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1f5a80] to-[#153e5c] z-0 transition-transform duration-500 group-hover:scale-105"></div>
              
              {/* Decorative background elements */}
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
              
              <div className="relative z-10 p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                  <Wrench className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Room Issue?</h3>
                <p className="text-[#CBDDE9] text-sm mb-6">Request our maintenance team to fix AC, plumbing, or furniture issues.</p>
                <div className="bg-white text-[#1f5a80] px-6 py-2.5 rounded-full text-sm font-bold shadow-md group-hover:shadow-xl transition-shadow flex items-center gap-2">
                  Request Maintenance
                </div>
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Booking & Extra Information */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full">
              
              {bookingData ? (
                <>
                  <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <HomeIcon className="w-6 h-6 text-[#2872A1]" /> Room Details
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">Your current hostel accommodation</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-3xl font-extrabold text-[#2872A1]">{bookingData.roomNumber}</span>
                      <span className={`text-xs font-bold uppercase tracking-wider ${bookingData.status === 'Pending Approval' ? 'text-orange-500' : 'text-emerald-500'}`}>
                        {bookingData.status}
                      </span>
                    </div>
                  </div>

                  {/* Header for Extra Info */}
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#2872A1]" /> Student Information
                    </h3>
                    {!isEditing ? (
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-sm font-bold text-[#2872A1] bg-[#CBDDE9]/30 px-4 py-2 rounded-lg hover:bg-[#CBDDE9]/60 transition-colors">
                        <Edit3 className="w-4 h-4" /> Edit Info
                      </button>
                    ) : (
                      <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    )}
                  </div>

                  {/* The Information Display / Form */}
                  {!isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">NIC / Passport</p>
                        <p className="font-semibold text-gray-800">{bookingData.nicNumber}</p>
                      </div>
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Move-in Date</p>
                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {new Date(bookingData.expectedMoveInDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-red-50 p-5 rounded-2xl border border-red-100 md:col-span-2">
                        <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Emergency Contact</p>
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-gray-800">{bookingData.emergencyContactName}</p>
                          <p className="font-bold text-red-600">{bookingData.emergencyContactPhone}</p>
                        </div>
                      </div>
                      {bookingData.specialRequests && (
                        <div className="bg-blue-50/50 p-5 rounded-2xl border border-[#CBDDE9]/50 md:col-span-2">
                          <p className="text-xs font-bold text-[#2872A1] uppercase tracking-wider mb-1">Special Requests</p>
                          <p className="text-gray-700 text-sm">{bookingData.specialRequests}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateInfo} className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">NIC / Passport</label>
                        <input type="text" name="nicNumber" value={formData.nicNumber} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] outline-none" required />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Emergency Contact Name</label>
                          <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] outline-none" required />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Emergency Phone</label>
                          <input type="text" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] outline-none" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Special Requests</label>
                        <textarea name="specialRequests" value={formData.specialRequests} onChange={handleInputChange} rows="3" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] outline-none resize-none"></textarea>
                      </div>
                      <button type="submit" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white bg-[#2872A1] hover:bg-[#1f5a80] transition-colors shadow-md">
                        <Save className="w-5 h-5" /> Save Changes
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">No Room Booked Yet</h3>
                  <p className="text-gray-500 max-w-sm">You haven't reserved a room in the hostel yet. Browse our available accommodations to get started.</p>
                  <button onClick={() => navigate('/home')} className="mt-4 px-6 py-3 bg-[#2872A1] text-white font-bold rounded-xl shadow-md hover:bg-[#1f5a80] transition-all hover:-translate-y-0.5">
                    Browse Rooms
                  </button>
                </div>
              )}

            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;