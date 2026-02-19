import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        // Calls your live Backend API
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
    <div style={styles.wrapper}>
      {/* Hero Header */}
      <header style={styles.hero}>
        <div style={styles.heroOverlay}>
          <h1 style={styles.heroTitle}>AuraLive Student Living</h1>
          <p style={styles.heroSubtitle}>Premium Hostel Rooms in Malabe</p>
          <div style={styles.searchBox}>
            <input type="text" placeholder="Search rooms..." style={styles.searchInput} />
            <button style={styles.searchBtn}>Find Room</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.container}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Available Accommodations</h2>
          <p style={styles.sectionText}>Browse available rooms and book your stay instantly.</p>
        </div>

        {loading ? (
          <div style={styles.loader}>Loading Rooms...</div>
        ) : (
          <div style={styles.roomGrid}>
            {rooms.length > 0 ? rooms.map((room) => (
              <div key={room._id} style={styles.card}>
                <div style={styles.imageContainer}>
                  {/* Dynamic Image Logic: Uses room.images[0] if exists, else falls back to online library */}
                  <img 
                    src={room.images && room.images[0] ? room.images[0] : (roomPhotos[room.type.toLowerCase()] || roomPhotos.default)} 
                    alt={`Room ${room.roomNumber}`} 
                    style={styles.roomImage} 
                  />
                  <div style={styles.priceBadge}>Rs. {room.price}</div>
                </div>
                
                <div style={styles.cardContent}>
                  <div style={styles.typeTag}>{room.type.toUpperCase()}</div>
                  <h3 style={styles.roomHeading}>Room {room.roomNumber}</h3>
                  <p style={styles.roomDesc}>{room.description}</p>
                  
                  <div style={styles.infoRow}>
                    <span>👥 Capacity: {room.capacity}</span>
                    <span style={{color: room.isAvailable ? '#27ae60' : '#e74c3c'}}>
                      ● {room.isAvailable ? 'Available' : 'Full'}
                    </span>
                  </div>

                  <button 
                    onClick={() => navigate(`/book/${room._id}`)} 
                    style={styles.bookBtn}
                    disabled={!room.isAvailable}
                  >
                    {room.isAvailable ? 'Book This Room' : 'Unavailable'}
                  </button>
                </div>
              </div>
            )) : (
              <div style={styles.noData}>No rooms found. Admin needs to add rooms!</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Modern Styles ---
const styles = {
  wrapper: { backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  hero: {
    height: '450px',
    backgroundImage: 'url("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative'
  },
  heroOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    color: 'white', textAlign: 'center', padding: '20px'
  },
  heroTitle: { fontSize: '3.5rem', fontWeight: '800', margin: '0 0 10px 0' },
  heroSubtitle: { fontSize: '1.5rem', fontWeight: '300', marginBottom: '30px' },
  searchBox: { display: 'flex', width: '100%', maxWidth: '600px', backgroundColor: 'white', borderRadius: '50px', padding: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  searchInput: { flex: 1, border: 'none', padding: '12px 25px', borderRadius: '50px', outline: 'none', fontSize: '1rem' },
  searchBtn: { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' },
  container: { maxWidth: '1200px', margin: '-50px auto 50px auto', padding: '0 20px', position: 'relative', zIndex: 2 },
  sectionHeader: { marginBottom: '40px', textAlign: 'center' },
  sectionTitle: { fontSize: '2.2rem', color: '#2c3e50', marginBottom: '10px' },
  sectionText: { color: '#7f8c8d', fontSize: '1.1rem' },
  roomGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' },
  card: { backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', transition: 'all 0.3s' },
  imageContainer: { height: '220px', position: 'relative' },
  roomImage: { width: '100%', height: '100%', objectFit: 'cover' },
  priceBadge: { position: 'absolute', bottom: '15px', right: '15px', backgroundColor: '#2ecc71', color: 'white', padding: '8px 15px', borderRadius: '10px', fontWeight: 'bold' },
  cardContent: { padding: '25px' },
  typeTag: { color: '#3498db', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px' },
  roomHeading: { fontSize: '1.5rem', color: '#2c3e50', margin: '0 0 10px 0' },
  roomDesc: { color: '#95a5a6', fontSize: '0.95rem', lineHeight: '1.5', height: '45px', overflow: 'hidden', marginBottom: '20px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#34495e', marginBottom: '20px', borderTop: '1px solid #eee', paddingTop: '15px' },
  bookBtn: { width: '100%', padding: '14px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'background 0.3s' },
  loader: { textAlign: 'center', padding: '100px', fontSize: '1.5rem', color: '#3498db' },
  noData: { textAlign: 'center', padding: '100px', width: '100%', gridColumn: '1 / -1', color: '#7f8c8d' }
};

export default Home;