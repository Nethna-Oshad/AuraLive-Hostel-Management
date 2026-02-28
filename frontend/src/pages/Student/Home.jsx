import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Check if a user is logged in (to hide partner registration if they are already in the system)
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Online photo library for different room types (fallback if admin didn't upload a photo)
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
        // CRUCIAL LOGIC: Only keep rooms where 'display' is true!
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Hero Header - Upgraded with brand colors and gradient overlay */}
      <header className="relative h-[500px] bg-center bg-cover" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80")' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a192f]/95 to-[#2872A1]/70 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
            Aura<span className="text-[#CBDDE9]">Live</span> Student Living
          </h1>
          <p className="text-xl md:text-2xl text-[#CBDDE9] font-light mb-10 drop-shadow-md">
            Premium Hostel Rooms in Malabe
          </p>
          
          {/* Search Box - Glassmorphism effect */}
          <div className="flex w-full max-w-2xl bg-white/10 backdrop-blur-md p-2 rounded-full shadow-2xl border border-white/20">
            <input 
              type="text" 
              placeholder="Search rooms..." 
              className="flex-1 bg-white text-gray-800 px-6 py-4 rounded-l-full outline-none text-lg focus:ring-2 focus:ring-[#2872A1]" 
            />
            <button className="bg-[#2872A1] hover:bg-[#1f5a80] transition-colors text-white px-8 py-4 rounded-r-full font-bold text-lg shadow-lg">
              Find Room
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10 pb-20">
        
        {/* Rooms Section */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.length > 0 ? rooms.map((room) => (
                <div key={room._id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-[#CBDDE9]/50 transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col">
                  
                  {/* Card Image */}
                  <div className="relative h-56">
                    <img 
                      src={room.image ? room.image : (roomPhotos[room.roomType?.toLowerCase()] || roomPhotos.default)} 
                      alt={`Room ${room.roomNumber}`} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.src = roomPhotos.default; }} // Fallback if image fails to load
                    />
                    <div className="absolute top-4 right-4 bg-[#2872A1] text-white px-4 py-1.5 rounded-full font-bold shadow-md shadow-[#2872A1]/40 border border-[#CBDDE9]/20">
                      Rs. {room.monthlyRent}
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs font-bold text-[#2872A1] tracking-wider uppercase bg-[#CBDDE9]/30 px-2 py-1 rounded">
                        {room.roomType || 'Standard'} Room
                      </div>
                      <div className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {room.designatedGender}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Room {room.roomNumber}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-1">
                      {room.description || "A comfortable and spacious room perfect for your stay."}
                    </p>
                    
                    {/* Status Row */}
                    <div className="flex justify-between items-center text-sm font-medium text-gray-700 py-4 border-t border-gray-100 mb-6">
                      <div className="flex items-center">
                        <span className="mr-2 text-[#2872A1]">👥</span> Capacity: {room.maxCapacity}
                      </div>
                      <div className={`flex items-center ${room.status === 'Available' ? 'text-emerald-600' : 'text-red-500'}`}>
                        <span className="mr-1.5 text-xs">●</span> {room.status}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button 
                      onClick={() => navigate(`/book/${room._id}`)} 
                      disabled={room.status !== 'Available'}
                      className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                        room.status === 'Available' 
                          ? 'bg-[#2872A1] hover:bg-[#1f5a80] text-white shadow-md shadow-[#CBDDE9] hover:shadow-lg hover:-translate-y-0.5' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {room.status === 'Available' ? 'Book This Room' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-[#CBDDE9]">
                  <span className="text-4xl block mb-4">🛏️</span>
                  <h3 className="text-xl font-bold text-[#2872A1]">No Rooms Available</h3>
                  <p className="text-gray-500 mt-2">Check back later or contact administration.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Partner Services Section - Only shows if NO user is logged in */}
        {!userInfo && (
          <div className="mt-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#2872A1] mb-4">Partner Services</h2>
              <p className="text-gray-500 text-lg">Join our community as a service provider and grow your business.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Laundry Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border-t-4 border-[#2872A1]">
                <div className="h-48 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1545173168-9f1947eebb8f?auto=format&fit=crop&w=500&q=60" alt="Laundry" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Laundry Partner</h3>
                  <p className="text-gray-600 mb-8">Provide washing and ironing services to our student residents.</p>
                  <button onClick={() => navigate('/register/laundry')} className="w-full py-3 font-bold text-[#2872A1] bg-[#CBDDE9]/30 hover:bg-[#2872A1] hover:text-white rounded-xl transition-colors">Register as Laundry</button>
                </div>
              </div>

              {/* Meal Supplier Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border-t-4 border-[#1f5a80]">
                <div className="h-48 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=500&q=60" alt="Meal Supplier" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Meal Supplier</h3>
                  <p className="text-gray-600 mb-8">Supply nutritious daily meals and custom orders for students.</p>
                  <button onClick={() => navigate('/register/meal')} className="w-full py-3 font-bold text-[#1f5a80] bg-[#CBDDE9]/30 hover:bg-[#1f5a80] hover:text-white rounded-xl transition-colors">Register as Supplier</button>
                </div>
              </div>

              {/* Maintainer Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border-t-4 border-[#153e5c]">
                <div className="h-48 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1581092921461-eab62e97a78e?auto=format&fit=crop&w=500&q=60" alt="Maintainer" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Maintenance</h3>
                  <p className="text-gray-600 mb-8">Join our technical team to keep all facilities in top working shape.</p>
                  <button onClick={() => navigate('/register/maintainer')} className="w-full py-3 font-bold text-[#153e5c] bg-[#CBDDE9]/30 hover:bg-[#153e5c] hover:text-white rounded-xl transition-colors">Register as Maintainer</button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;