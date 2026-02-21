import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // FIXED: Changed to userInfo to match our new unified login system!
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Online photo library for different room types
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
        setRooms(response.data);
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
      
      {/* Hero Header - Upgraded with a beautiful gradient overlay */}
      <header className="relative h-[500px] bg-center bg-cover" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80")' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/40 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
            Aura<span className="text-indigo-400">Live</span> Student Living
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 font-light mb-10 drop-shadow-md">
            Premium Hostel Rooms in Malabe
          </p>
          
          {/* Search Box - Glassmorphism effect */}
          <div className="flex w-full max-w-2xl bg-white/20 backdrop-blur-md p-2 rounded-full shadow-2xl border border-white/30">
            <input 
              type="text" 
              placeholder="Search rooms..." 
              className="flex-1 bg-white text-gray-800 px-6 py-4 rounded-l-full outline-none text-lg focus:ring-2 focus:ring-indigo-400" 
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white px-8 py-4 rounded-r-full font-bold text-lg shadow-lg">
              Find Room
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10 pb-20">
        
        {/* Rooms Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-16 border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Available Accommodations</h2>
            <p className="text-gray-500 text-lg">Browse available rooms and book your stay instantly.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.length > 0 ? rooms.map((room) => (
                <div key={room._id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col">
                  
                  {/* Card Image */}
                  <div className="relative h-56">
                    <img 
                      src={room.images?.length > 0 ? room.images[0] : (roomPhotos[room.type?.toLowerCase()] || roomPhotos.default)} 
                      alt={`Room ${room.roomNumber}`} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white px-4 py-1.5 rounded-full font-bold shadow-md">
                      Rs. {room.price}
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="text-xs font-bold text-indigo-500 tracking-wider uppercase mb-2">
                      {room.type || 'Standard'} Room
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Room {room.roomNumber}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-1">
                      {room.description}
                    </p>
                    
                    {/* Status Row */}
                    <div className="flex justify-between items-center text-sm font-medium text-gray-700 py-4 border-t border-gray-100 mb-6">
                      <div className="flex items-center">
                        <span className="mr-2">👥</span> Capacity: {room.capacity}
                      </div>
                      <div className={`flex items-center ${room.isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
                        <span className="mr-1.5 text-xs">●</span> {room.isAvailable ? 'Available' : 'Full'}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button 
                      onClick={() => navigate(`/book/${room._id}`)} 
                      disabled={!room.isAvailable}
                      className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                        room.isAvailable 
                          ? 'bg-gray-900 hover:bg-indigo-600 text-white shadow-md hover:shadow-lg' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {room.isAvailable ? 'Book This Room' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <span className="text-4xl block mb-4">🛏️</span>
                  <h3 className="text-xl font-bold text-gray-700">No Rooms Available</h3>
                  <p className="text-gray-500 mt-2">The administrator hasn't added any rooms yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Partner Services Section - Only shows if NOT logged in */}
        {!userInfo && (
          <div className="mt-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Partner Services</h2>
              <p className="text-gray-500 text-lg">Join our community as a service provider and grow your business.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Laundry Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border-t-4 border-blue-500">
                <div className="h-48 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1545173168-9f1947eebb8f?auto=format&fit=crop&w=500&q=60" alt="Laundry" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Laundry Partner</h3>
                  <p className="text-gray-600 mb-8">Provide washing and ironing services to our student residents.</p>
                  <button onClick={() => navigate('/register/laundry')} className="w-full py-3 font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-colors">Register as Laundry</button>
                </div>
              </div>

              {/* Meal Supplier Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border-t-4 border-orange-500">
                <div className="h-48 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=500&q=60" alt="Meal Supplier" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Meal Supplier</h3>
                  <p className="text-gray-600 mb-8">Supply nutritious daily meals and custom orders for students.</p>
                  <button onClick={() => navigate('/register/meal')} className="w-full py-3 font-bold text-orange-500 bg-orange-50 hover:bg-orange-500 hover:text-white rounded-xl transition-colors">Register as Supplier</button>
                </div>
              </div>

              {/* Maintainer Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border-t-4 border-emerald-500">
                <div className="h-48 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1581092921461-eab62e97a78e?auto=format&fit=crop&w=500&q=60" alt="Maintainer" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Maintenance</h3>
                  <p className="text-gray-600 mb-8">Join our technical team to keep all facilities in top working shape.</p>
                  <button onClick={() => navigate('/register/maintainer')} className="w-full py-3 font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-colors">Register as Maintainer</button>
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