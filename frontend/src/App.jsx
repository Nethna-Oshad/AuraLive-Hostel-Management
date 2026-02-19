import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Student Component Imports
import Home from './pages/Student/Home';
import Login from './pages/Student/Login';
import Register from './pages/Student/Register';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Admin Component Imports
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';

// Layout wrapper for Student pages to keep the shared Navbar & Footer
const StudentLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow bg-gray-50">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* === Admin Routes (Standalone Layout) === */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* AdminDashboard already contains its own Sidebar and AdminNavbar inside it */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        

        {/* === Student Routes (Using StudentLayout) === */}
        <Route path="/" element={<StudentLayout><Home /></StudentLayout>} />
        <Route path="/home" element={<StudentLayout><Home /></StudentLayout>} />
        <Route path="/login" element={<StudentLayout><Login /></StudentLayout>} />
        <Route path="/register" element={<StudentLayout><Register /></StudentLayout>} />
      </Routes>
    </Router>
  );
}

export default App;