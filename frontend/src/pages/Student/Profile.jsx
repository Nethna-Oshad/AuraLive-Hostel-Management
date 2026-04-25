import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// FIXED: Added 'motion' to the import list
import { motion, AnimatePresence } from 'framer-motion'; 
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, ShieldCheck, Home as HomeIcon, 
  FileText, Wrench, Edit3, X, AlertCircle, Calendar, CheckSquare, Camera, Users, CreditCard, History, ReceiptText
} from 'lucide-react';
import toast from 'react-hot-toast';
import StudentPass from '../../components/StudentPass';

const Profile = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userEmail = userInfo?.email;
  const userRole = userInfo?.role;
  void motion;
  const fileInputRef = useRef(null);

  const [bookingData, setBookingData] = useState(null);
  const [roommates, setRoommates] = useState([]); 
  const [roomDetails, setRoomDetails] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  
  const [showWarning, setShowWarning] = useState(false); 
  const [showHistoryModal, setShowHistoryModal] = useState(false); 
  const [invoices, setInvoices] = useState([]); 
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  
  const [formData, setFormData] = useState({
    nicNumber: '', emergencyContactName: '', emergencyContactPhone: '', specialRequests: ''
  });

  useEffect(() => {
    if (!userEmail || userRole !== 'Student') {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        // Fetch Booking Data
        const response = await axios.get(`http://localhost:5000/api/bookings/${userEmail}`);
        
        // If successful
        if (response.data && response.data.booking) {
          const booking = response.data.booking;
          const fetchedRoommates = response.data.roommates || [];

          setBookingData(booking);
          setRoommates(fetchedRoommates);
          
          if (booking.profileImage) {
            setProfilePicPreview(booking.profileImage);
          }

          setFormData({
            nicNumber: booking.nicNumber || '',
            emergencyContactName: booking.emergencyContactName || '',
            emergencyContactPhone: booking.emergencyContactPhone || '',
            specialRequests: booking.specialRequests || ''
          });

          // Fetch specific Room Details
          try {
            const roomRes = await axios.get('http://localhost:5000/api/rooms');
            const myRoom = roomRes.data.find(r => r._id === booking.roomId);
            if (myRoom) setRoomDetails(myRoom);
          } catch (roomErr) {
            console.error("Room fetch error:", roomErr);
          }

          // Rent Warning Logic
          const currentDay = new Date().getDate();
          const todayString = new Date().toDateString();
          const lastDismissed = localStorage.getItem('rentWarningDismissedDate');

          if (currentDay >= 25 && booking.monthlyRentStatus === 'Unpaid' && lastDismissed !== todayString) {
            setShowWarning(true);
          }
        }
      } catch (err) {
        // FIXED: Handle 404 gracefully (Student simply hasn't booked yet)
        if (err.response && err.response.status === 404) {
          console.log("No booking found for this student.");
        } else {
          console.error("Profile fetch error:", err);
          toast.error("Failed to load profile data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userEmail, userRole, navigate]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDismissWarning = () => {
    localStorage.setItem('rentWarningDismissedDate', new Date().toDateString());
    setShowWarning(false);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file && bookingData) {
      setProfilePicPreview(URL.createObjectURL(file)); 
      const submitData = new FormData();

      try {
        toast.loading('Saving picture...', { id: 'photo' });
        const response = await axios.put(`http://localhost:5000/api/bookings/${bookingData._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setBookingData(response.data); 
        toast.dismiss('photo');
        toast.success('Picture updated!');
      } catch (err) {
        console.error(err);
        toast.dismiss('photo');
        toast.error('Failed to save picture.');
      }
    } else if (!bookingData) {
      toast.error("Please book a room first to set a profile picture.");
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/api/bookings/${bookingData._id}`, formData);
      setBookingData(response.data); 
      setIsEditing(false);
      toast.success('Profile information updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update information.');
    }
  };

  const handlePayment = async () => {
    try {
      toast.loading('Connecting to Stripe...', { id: 'stripe' });
      const response = await axios.post('http://localhost:5000/api/payment/create-checkout-session', { bookingId: bookingData._id });
      toast.dismiss('stripe');
      window.location.href = response.data.url;
    } catch (error) {
      console.error(error);
      toast.dismiss('stripe');
      toast.error('Payment error.');
    }
  };

  const handleMonthlyPayment = async () => {
    try {
      toast.loading('Connecting to Stripe...', { id: 'stripe-monthly' });
      const response = await axios.post('http://localhost:5000/api/payment/monthly/create', { bookingId: bookingData._id });
      toast.dismiss('stripe-monthly');
      window.location.href = response.data.url;
    } catch (error) {
      console.error(error);
      toast.dismiss('stripe-monthly');
      toast.error('Payment error.');
    }
  };

  const handleViewHistory = async () => {
    setShowHistoryModal(true);
    setLoadingInvoices(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/invoices/student/${userInfo.email}`);
      setInvoices(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load payment history.');
    } finally {
      setLoadingInvoices(false);
    }
  };

  const getNextMonthName = () => {
    if (!bookingData) return '';
    const baseDate = bookingData.paidUntil ? new Date(bookingData.paidUntil) : new Date(bookingData.createdAt);
    baseDate.setMonth(baseDate.getMonth() + 1); 
    return baseDate.toLocaleString('default', { month: 'long', year: 'numeric' }); 
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-gray-50"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2872A1]"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-12 px-6 relative">

      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border-t-8 border-red-500"
            >
              <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{getNextMonthName()} Rent Due!</h2>
              <p className="text-gray-600 mb-6">
                It is past the 25th of the month. Please pay your monthly hostel rent of <strong>Rs. {roomDetails?.monthlyRent || '...'}</strong> to avoid late fees.
              </p>
              <div className="space-y-3">
                <button onClick={handleMonthlyPayment} className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Pay Rent Now
                </button>
                <button onClick={handleDismissWarning} className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors">
                  Remind Me Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-6 bg-[#2872A1] text-white">
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <ReceiptText className="w-6 h-6" /> Financial Ledger
                </h2>
                <button onClick={() => setShowHistoryModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto bg-gray-50 custom-scrollbar">
                {loadingInvoices ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#2872A1]"></div>
                  </div>
                ) : invoices.length > 0 ? (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={invoice._id}
                        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center hover:border-[#CBDDE9] transition-colors"
                      >
                        <div>
                          <p className="font-bold text-gray-900">{invoice.description}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(invoice.paidAt || invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                            {invoice.status}
                          </span>
                          <p className="text-lg font-extrabold text-[#2872A1]">Rs. {invoice.amount?.toLocaleString()}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <ReceiptText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-700">No Payment History</h3>
                    <p className="text-gray-500 text-sm mt-1">You have not made any payments yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Student Profile</h1>
          <p className="text-gray-500">Manage your personal information and hostel details.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-[#CBDDE9]/40 z-0"></div>

              <div className="relative z-10 flex flex-col items-center mt-4">
                <div className="relative w-28 h-28 mb-4">
                  <div className="w-full h-full rounded-full bg-[#2872A1] text-white flex items-center justify-center text-5xl font-extrabold shadow-xl border-4 border-white overflow-hidden">
                    {profilePicPreview ? <img src={profilePicPreview} alt="Profile" className="w-full h-full object-cover" /> : userInfo?.name?.charAt(0).toUpperCase()}
                  </div>
                  <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-[#2872A1] hover:bg-[#2872A1] hover:text-white hover:scale-110 transition-all z-20 cursor-pointer">
                    <Camera className="w-4 h-4" />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>

                <h2 className="text-2xl font-bold text-gray-900">{userInfo?.name}</h2>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider rounded-full mt-2 border border-emerald-100 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Student
                </span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                  <Mail className="w-5 h-5 text-[#2872A1]" />
                  <span className="text-sm font-medium">{userInfo?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                  <Phone className="w-5 h-5 text-[#2872A1]" />
                  <span className="text-sm font-medium">{userInfo?.phone || 'Not provided'}</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full">

              {bookingData ? (
                <>
                  <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <HomeIcon className="w-6 h-6 text-[#2872A1]" /> Room Details
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">Your current hostel accommodation</p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="block text-3xl font-extrabold text-[#2872A1]">{bookingData.roomNumber}</span>
                      <span className={`text-xs font-bold uppercase tracking-wider mb-3 ${bookingData.status === 'Pending Approval' ? 'text-orange-500' : 'text-emerald-500'}`}>
                        {bookingData.status}
                      </span>
                    </div>
                  </div>

                  {bookingData.paymentStatus === 'Unpaid' ? (
                    <div className="mb-8 p-6 bg-orange-50 rounded-2xl border border-orange-100 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-orange-800">Initial Deposit Required</h4>
                        <p className="text-sm text-orange-600 mt-1">Please pay your key money and first month rent to secure the room.</p>
                      </div>
                      <button onClick={handlePayment} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Pay Deposit
                      </button>
                    </div>
                  ) : (
                    <div className="mb-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                          <h4 className="font-bold text-[#2872A1] flex items-center gap-2">
                            <CreditCard className="w-5 h-5" /> Monthly Rent Portal
                          </h4>
                          <button onClick={handleViewHistory} className="text-xs font-bold text-gray-500 hover:text-[#2872A1] flex items-center gap-1.5 transition-colors bg-white px-3 py-1.5 rounded-lg border border-[#CBDDE9]">
                            <History className="w-3.5 h-3.5" /> History
                          </button>
                        </div>

                        {bookingData.monthlyRentStatus === 'Paid' && (
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 uppercase tracking-wider">
                            <CheckSquare className="w-3 h-3" /> Up to Date
                          </span>
                        )}
                        {bookingData.monthlyRentStatus === 'Unpaid' && (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 uppercase tracking-wider">
                            <AlertCircle className="w-3 h-3" /> Rent Overdue
                          </span>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 shadow-sm">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Next Payment For</p>
                          <p className="text-xl font-extrabold text-gray-900">{getNextMonthName()}</p>
                          <p className="text-sm font-bold text-[#2872A1]">Rs. {roomDetails ? roomDetails.monthlyRent : '...'}</p>
                        </div>
                        <button
                          onClick={handleMonthlyPayment}
                          className="bg-[#2872A1] hover:bg-[#1f5a80] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                          Pay Monthly rent
                        </button>
                      </div>
                    </div>
                  )}

                  {roommates.length > 0 && (
                    <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-[#2872A1]" /> Your Roommates
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {roommates.map((mate, index) => (
                          <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 rounded-full bg-[#CBDDE9] text-[#2872A1] flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-white shadow-sm">
                              {mate.profileImage ? <img src={mate.profileImage} alt={mate.studentName} className="w-full h-full object-cover" /> : mate.studentName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm">{mate.studentName}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-6 border-t border-gray-100 pt-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FileText className="w-5 h-5 text-[#2872A1]" /> Student Information</h3>
                    {!isEditing ? (
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-sm font-bold text-[#2872A1] bg-[#CBDDE9]/30 px-4 py-2 rounded-lg hover:bg-[#CBDDE9]/60"><Edit3 className="w-4 h-4" /> Edit Info</button>
                    ) : (
                      <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"><X className="w-4 h-4" /> Cancel</button>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase mb-1">NIC / Passport</p><p className="font-semibold text-gray-800">{bookingData.nicNumber}</p></div>
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase mb-1">Move-in Date</p><p className="font-semibold text-gray-800 flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" />{new Date(bookingData.expectedMoveInDate).toLocaleDateString()}</p></div>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateInfo} className="space-y-5">
                      <div><label className="block text-sm font-bold text-gray-700 mb-1">NIC / Passport</label><input type="text" name="nicNumber" value={formData.nicNumber} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" required /></div>
                      <button type="submit" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white bg-[#2872A1] hover:bg-[#1f5a80]">Save Changes</button>
                    </form>
                  )}

                  {bookingData.paymentStatus === 'Paid' && (
                    <div className="mt-10 border-t pt-8">
                      <h2 className="text-xl font-bold mb-4 text-center">Your Hostel Boarding Pass</h2>
                      <StudentPass
                        studentInfo={{
                          name: bookingData.studentName || userInfo?.name || 'Student',
                          roomNumber: bookingData.roomNumber || 'N/A',
                        }}
                        paymentId={bookingData.stripeSessionId || 'PAYMENT-VERIFIED'}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800">No Room Booked</h3>
                  <button onClick={() => navigate('/home')} className="mt-4 px-6 py-3 bg-[#2872A1] text-white font-bold rounded-xl shadow-md">Browse Rooms</button>
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #CBDDE9; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Profile;