import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BedDouble, CheckCircle, XCircle, AlertCircle, Search, Shirt, Utensils, Wrench } from 'lucide-react';

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const roomPhotos = {
    single: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=60",
    double: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=60",
    shared: "https://images.unsplash.com/photo-1555854817-5b2738a91574?auto=format&fit=crop&w=500&q=60",
    default: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=500&q=60"
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/rooms');
        const visibleRooms = response.data.filter(room => room.display === true);
        setRooms(visibleRooms);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
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

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10 pb-20">
        
        <div className="bg-white rounded-3xl shadow-xl shadow-[#CBDDE9]/20 p-8 md:p-12 mb-16 border border-[#CBDDE9]/40">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#2872A1] mb-4">Available Accommodations</h2>
            <p className="text-gray-500 text-lg">Browse available rooms and book your stay instantly.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2872A1]"></div>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {rooms.length > 0 ? rooms.map((room) => {
                
                // NEW: Calculate exactly how many beds are left
                const currentOcc = room.currentOccupancy || 0;
                const availableBeds = room.maxCapacity - currentOcc;
                const isFull = availableBeds <= 0 || room.status === 'Full';
                const isMaintenance = room.status === 'Under Maintenance';
                const canBook = !isFull && !isMaintenance;
                const fillPercentage = (currentOcc / room.maxCapacity) * 100;

                return (
                  <motion.div key={room._id} variants={itemVariants} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-[#CBDDE9]/50 transition-all duration-300 border border-gray-100 flex flex-col group">
                    
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={room.image ? room.image : (roomPhotos[room.roomType?.toLowerCase()] || roomPhotos.default)} 
                        alt={`Room ${room.roomNumber}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        onError={(e) => { e.target.src = roomPhotos.default; }}
                      />
                      <div className="absolute top-4 right-4 bg-[#2872A1]/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full font-bold shadow-md shadow-[#2872A1]/40 border border-white/20">
                        Rs. {room.monthlyRent}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-xs font-bold text-[#2872A1] tracking-wider uppercase bg-[#CBDDE9]/30 px-3 py-1.5 rounded-lg">
                          {room.roomType || 'Standard'} Room
                        </div>
                        <div className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                          {room.designatedGender}
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Room {room.roomNumber}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                        {room.description || "A comfortable and spacious room perfect for your stay."}
                      </p>
                      
                      {/* NEW: CREATIVE OCCUPANCY PROGRESS BAR */}
                      <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> Occupancy
                          </span>
                          <span className={`text-sm font-extrabold ${isFull ? 'text-red-500' : 'text-[#2872A1]'}`}>
                            {isFull ? 'Room Full' : `${availableBeds} ${availableBeds === 1 ? 'Bed' : 'Beds'} Left`}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mb-1">
                          <div 
                            className={`h-2.5 rounded-full transition-all duration-1000 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${fillPercentage}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-1 uppercase">
                          <span>{currentOcc} Booked</span>
                          <span>Max {room.maxCapacity}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button 
                        onClick={() => navigate(`/book/${room._id}`)} 
                        disabled={!canBook}
                        className={`w-full py-3.5 rounded-xl font-bold transition-all flex justify-center items-center gap-2 ${
                          canBook 
                            ? 'bg-[#2872A1] hover:bg-[#1f5a80] text-white shadow-md shadow-[#CBDDE9] hover:shadow-lg active:scale-95' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        }`}
                      >
                        {isMaintenance ? 'Under Maintenance' : isFull ? 'Currently Full' : 'Book This Room'}
                      </button>
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-[#CBDDE9]">
                  <BedDouble className="w-16 h-16 text-[#CBDDE9] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#2872A1]">No Rooms Available</h3>
                  <p className="text-gray-500 mt-2">Check back later or contact administration.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Partner Services Section */}
        {!userInfo && (
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#2872A1] mb-4">Partner Services</h2>
              <p className="text-gray-500 text-lg">Join our community as a service provider and grow your business.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-[#2872A1]/30 flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-2xl bg-[#CBDDE9]/30 text-[#2872A1] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#2872A1] group-hover:text-white transition-all duration-300"><Shirt className="w-10 h-10" /></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Laundry Partner</h3>
                <p className="text-gray-500 mb-8 flex-1 leading-relaxed">Provide washing, ironing, and delivery services to our student residents.</p>
                <button onClick={() => navigate('/register/laundry')} className="w-full py-3 font-bold text-[#2872A1] bg-[#CBDDE9]/30 hover:bg-[#2872A1] hover:text-white rounded-xl transition-colors">Register as Laundry</button>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-[#1f5a80]/30 flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-2xl bg-[#CBDDE9]/30 text-[#1f5a80] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#1f5a80] group-hover:text-white transition-all duration-300"><Utensils className="w-10 h-10" /></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Meal Supplier</h3>
                <p className="text-gray-500 mb-8 flex-1 leading-relaxed">Supply nutritious daily meals, breakfast packages, and custom orders.</p>
                <button onClick={() => navigate('/register/meal')} className="w-full py-3 font-bold text-[#1f5a80] bg-[#CBDDE9]/30 hover:bg-[#1f5a80] hover:text-white rounded-xl transition-colors">Register as Supplier</button>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-[#153e5c]/30 flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-2xl bg-[#CBDDE9]/30 text-[#153e5c] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#153e5c] group-hover:text-white transition-all duration-300"><Wrench className="w-10 h-10" /></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Maintenance</h3>
                <p className="text-gray-500 mb-8 flex-1 leading-relaxed">Join our technical team to resolve room issues and keep facilities perfect.</p>
                <button onClick={() => navigate('/register/maintainer')} className="w-full py-3 font-bold text-[#153e5c] bg-[#CBDDE9]/30 hover:bg-[#153e5c] hover:text-white rounded-xl transition-colors">Register as Maintainer</button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Home;