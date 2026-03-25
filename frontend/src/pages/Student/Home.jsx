import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, BedDouble, CheckCircle, XCircle, AlertCircle, 
  Search, Shirt, Utensils, Wrench, ArrowRight, Clock, Loader2 
} from 'lucide-react';

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const navigate = useNavigate();
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const roomPhotos = {
    single: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=60",
    double: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=60",
    shared: "https://images.unsplash.com/photo-1555854817-5b2738a91574?auto=format&fit=crop&w=500&q=60",
    default: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=500&q=60"
  };

  // 👇 --- Animation Variants (Fixed the missing variables) --- 👇
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Rooms
        const roomRes = await axios.get('http://localhost:5000/api/rooms');
        const visibleRooms = roomRes.data.filter(room => room.display === true);
        setRooms(visibleRooms);

        // Fetch Latest Laundry Order if student is logged in
        if (userInfo?._id && userInfo?.role === 'Student') {
          setOrderLoading(true);
          const orderRes = await axios.get(`http://localhost:5000/api/laundry/student/${userInfo._id}`);
          if (orderRes.data && orderRes.data.length > 0) {
            // Get the most recent order that isn't 'Completed' or 'Cancelled' yet
            const current = orderRes.data.find(o => o.status !== 'Completed' && o.status !== 'Cancelled');
            if (current) setActiveOrder(current);
          }
          setOrderLoading(false);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Status Color Helper
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'Accepted': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Washing': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* Hero Header */}
      <header className="relative h-[500px] bg-center bg-cover overflow-hidden" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80")' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a192f]/95 to-[#2872A1]/70 flex flex-col items-center justify-center text-center px-4">
          
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {userInfo?.role === 'Student' && (
              <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#CBDDE9] text-sm font-bold uppercase tracking-widest mb-6 inline-block backdrop-blur-sm">
                Welcome back, {userInfo.name}
              </span>
            )}
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
              Aura<span className="text-[#CBDDE9]">Live</span> Student Living
            </h1>
            <p className="text-xl md:text-2xl text-[#CBDDE9] font-light mb-10 drop-shadow-md">
              Premium Hostel Rooms in Malabe
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="flex w-full max-w-2xl bg-white/10 backdrop-blur-md p-2 rounded-full shadow-2xl border border-white/20"
          >
            <div className="flex items-center pl-6 pr-2 bg-white rounded-l-full flex-1">
              <Search className="w-6 h-6 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search rooms..." 
                className="w-full text-gray-800 px-4 py-4 outline-none text-lg bg-transparent" 
              />
            </div>
            <button className="bg-[#2872A1] hover:bg-[#1f5a80] transition-colors text-white px-8 py-4 rounded-r-full font-bold text-lg shadow-lg">
              Find Room
            </button>
          </motion.div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10 pb-20">
        
        {/* 👇 --- ACTIVE ORDER TRACKER --- 👇 */}
        <AnimatePresence>
          {userInfo?.role === 'Student' && activeOrder && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-1 mb-8 overflow-hidden border border-blue-100"
            >
              <div className="flex flex-col md:flex-row items-center gap-6 p-6">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-[#2872A1] shrink-0">
                  <Clock className={`w-10 h-10 ${activeOrder.status === 'Washing' ? 'animate-spin-slow' : 'animate-pulse'}`} />
                </div>
                
                <div className="flex-grow text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-gray-800 tracking-tight">Active Laundry Order</h3>
                    <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(activeOrder.status)}`}>
                      {activeOrder.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">
                    Your <span className="text-gray-900 font-bold">{activeOrder.weightInKg}Kg</span> bag is being processed by <span className="text-[#2872A1] font-bold">{activeOrder.assignedPartner?.name || 'Partner'}</span>
                  </p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
                  <button 
                    onClick={() => navigate('/student/my-orders')}
                    className="px-6 py-3 bg-[#2872A1] text-white rounded-2xl font-bold text-sm hover:bg-[#1b4d6d] transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                  >
                    Track Live <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="h-1.5 w-full bg-gray-100 flex">
                <div 
                  className="h-full bg-[#2872A1] transition-all duration-1000" 
                  style={{ 
                    width: activeOrder.status === 'Pending' ? '25%' : 
                           activeOrder.status === 'Accepted' ? '50%' : 
                           activeOrder.status === 'Washing' ? '75%' : '100%' 
                  }} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Links */}
        {userInfo?.role === 'Student' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          >
            <div 
              onClick={() => navigate('/student/laundry')}
              className="bg-white p-6 rounded-3xl shadow-xl border-l-8 border-[#2872A1] flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-[#CBDDE9]/40 rounded-2xl flex items-center justify-center text-[#2872A1] group-hover:bg-[#2872A1] group-hover:text-white transition-colors">
                  <Shirt className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">Request Laundry</h3>
                  <p className="text-gray-500 text-sm font-medium">Wash, Dry & Iron services at your door</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-[#2872A1] group-hover:translate-x-2 transition-all" />
            </div>

            <div 
              className="bg-white p-6 rounded-3xl shadow-xl border-l-8 border-orange-400 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Wrench className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">Repair Request</h3>
                  <p className="text-gray-500 text-sm font-medium">Report room issues to our technicians</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-2 transition-all" />
            </div>
          </motion.div>
        )}

        {/* Rooms Section */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#CBDDE9]/20 p-8 md:p-12 mb-16 border border-[#CBDDE9]/40">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#2872A1] mb-4">Available Accommodations</h2>
            <p className="text-gray-500 text-lg font-medium">Browse available rooms and book your stay instantly.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin h-16 w-16 text-[#2872A1]" />
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {rooms.length > 0 ? rooms.map((room) => (
                <motion.div key={room._id} variants={itemVariants} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-[#CBDDE9]/50 transition-all duration-300 border border-gray-100 flex flex-col group">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={room.image || (roomPhotos[room.roomType?.toLowerCase()] || roomPhotos.default)} 
                      alt={`Room ${room.roomNumber}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 right-4 bg-[#2872A1]/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full font-bold shadow-md">
                      Rs. {room.monthlyRent}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-xs font-bold text-[#2872A1] tracking-wider uppercase bg-[#CBDDE9]/30 px-3 py-1.5 rounded-lg">
                        {room.roomType || 'Standard'} Room
                      </div>
                      <div className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                        {room.designatedGender}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Room {room.roomNumber}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                      {room.description || "A comfortable and spacious room perfect for your stay."}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm font-medium text-gray-700 py-4 border-t border-gray-100 mb-6">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-5 h-5 text-[#2872A1] mr-2" />
                        Capacity: {room.maxCapacity}
                      </div>
                      <div className={`flex items-center font-bold ${
                        room.status === 'Available' ? 'text-emerald-600' : 
                        room.status === 'Full' ? 'text-red-500' : 'text-orange-500'
                      }`}>
                        {room.status}
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/book/${room._id}`)} 
                      disabled={room.status !== 'Available'}
                      className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                        room.status === 'Available' 
                          ? 'bg-[#2872A1] hover:bg-[#1f5a80] text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Book This Room
                    </button>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-16 text-center">
                  <h3 className="text-xl font-bold text-gray-400 text-center w-full">No Rooms Available</h3>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}} />
    </div>
  );
};

export default Home;