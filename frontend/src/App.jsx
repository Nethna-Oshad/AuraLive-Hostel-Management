import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // <-- Imported the Toast Notifications

// Component Imports
import Home from './pages/Student/Home';
import Register from './pages/Student/Register';
import Login from './common/Login'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Admin Component Imports
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageStudents from './pages/Admin/ManageStudents';
import ManageLaundry from './pages/Admin/ManageLaundry';
import ManageMeals from './pages/Admin/ManageMeals';
import ManageMaintainers from './pages/Admin/ManageMaintainers';
// 👇 ALUTH: Manage Maintenance Import Eka 👇
import ManageMaintenance from './pages/Admin/ManageMaintenance';

// Room Management Component Import
import ManageRooms from './pages/Room/ManageRooms';
import RoomDetails from './pages/Room/RoomDetails'; 
import BookingProcess from './pages/Room/BookingProcess'; 

// Partner Registration Component Imports
import LaundryRegistration from './pages/Laundry/LaundryRegistation';
import MealSupplierRegistration from './pages/Meal/MealSupplierRegistation';
import MaintainersRegistration from './pages/Maintainers/MaintainersRegistation';

// Partner Dashboard Component Imports
import LaundryDashboard from './pages/Laundry/LaundryDashboard';
import MaintainersDashboard from './pages/Maintainers/MaintainersDashboard';
import MaintainerTasks from './pages/Maintainers/MaintainerTasks'; // 👈 NEW IMPORT
import MaintainerHistory from './pages/Maintainers/MaintainerHistory'; // 👈 NEW IMPORT
import MealDashboard from './pages/Meal/MealDashboard';

// Student Profile Component Import
import Profile from './pages/Student/Profile';

// 👇 --- Added for Maintenance Feature (My Part) --- 👇
import StudentMaintenance from './pages/Student/StudentMaintenance';
// 👆 ---------------------------------------------- 👆

// Layout wrapper for Student/Public pages
const StudentLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow bg-gray-50">{children}</main>
    <Footer />
  </div>
);

// Layout wrapper for pages without Navbar/Footer (like Login)
const AuthLayout = ({ children }) => (
  <main className="min-h-screen bg-gray-50">{children}</main>
);

function App() {
  return (
    <Router>
      {/* Global Toast Notifications initialized here */}
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{ 
          duration: 3000,
          style: { fontFamily: 'Inter, sans-serif', fontWeight: '500' }
        }} 
      />

      <Routes>
        {/* === Auth Route === */}
        <Route path="/login" element={<StudentLayout><Login /></StudentLayout>} />

        {/* === Admin Dashboard Routes === */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<ManageStudents />} />
        <Route path="/admin/laundry" element={<ManageLaundry />} />
        <Route path="/admin/meals" element={<ManageMeals />} />
        <Route path="/admin/maintainers" element={<ManageMaintainers />} />
        
        {/* 👇 ALUTH: Admin Maintenance Route Eka 👇 */}
        <Route path="/admin/maintenance" element={<ManageMaintenance />} />

        {/* === Room Management Route === */}
        <Route path="/admin/rooms" element={<ManageRooms />} />
        <Route path="/book/:id" element={<StudentLayout><RoomDetails /></StudentLayout>} />
        <Route path="/booking/:id" element={<StudentLayout><BookingProcess /></StudentLayout>} />

        {/* === Partner Dashboard Routes === */}
        <Route path="/laundry/dashboard" element={<LaundryDashboard />} />
        <Route path="/maintainer/dashboard" element={<MaintainersDashboard />} />
        <Route path="/maintainer/tasks" element={<MaintainerTasks />} /> {/* 👈 NEW ROUTE */}
        <Route path="/maintainer/completed" element={<MaintainerHistory />} /> {/* 👈 NEW ROUTE */}
        <Route path="/meal/dashboard" element={<MealDashboard />} />

        {/* === Student Routes (Using StudentLayout) === */}
        <Route path="/" element={<StudentLayout><Home /></StudentLayout>} />
        <Route path="/home" element={<StudentLayout><Home /></StudentLayout>} />
        <Route path="/register" element={<StudentLayout><Register /></StudentLayout>} />
        
        {/* 👇 --- Added for Maintenance Feature (My Part) --- 👇 */}
        <Route path="/student/maintenance" element={<StudentLayout><StudentMaintenance /></StudentLayout>} />
        {/* 👆 ---------------------------------------------- 👆 */}
        
        {/* === Partner Registration Routes (Using StudentLayout) === */}
        <Route path="/register/laundry" element={<StudentLayout><LaundryRegistration /></StudentLayout>} />
        <Route path="/register/meal" element={<StudentLayout><MealSupplierRegistration /></StudentLayout>} />
        <Route path="/register/maintainer" element={<StudentLayout><MaintainersRegistration /></StudentLayout>} />

        {/* === Student Profile Route === */}
        <Route path="/profile" element={<StudentLayout><Profile /></StudentLayout>} />
      </Routes>
    </Router>
  );
}

export default App;