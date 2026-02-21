import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

// Partner Registration Component Imports
import LaundryRegistration from './pages/Laundry/LaundryRegistation';
import MealSupplierRegistration from './pages/Meal/MealSupplierRegistation';
import MaintainersRegistration from './pages/Maintainers/MaintainersRegistation';

// Partner Dashboard Component Imports
import LaundryDashboard from './pages/Laundry/LaundryDashboard';
import MaintainersDashboard from './pages/Maintainers/MaintainersDashboard';
import MealDashboard from './pages/Meal/MealDashboard';

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
      <Routes>
        {/* === Auth Route (With Navbar/Footer) === */}
        <Route path="/login" element={<StudentLayout><Login /></StudentLayout>} />

        {/* === Dashboard Routes (Standalone Layout inside component) === */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/laundry/dashboard" element={<LaundryDashboard />} />
        <Route path="/maintainer/dashboard" element={<MaintainersDashboard />} />
        <Route path="/meal/dashboard" element={<MealDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<ManageStudents />} />
        <Route path="/admin/laundry" element={<ManageLaundry />} />
        <Route path="/admin/meals" element={<ManageMeals />} />
        <Route path="/admin/maintainers" element={<ManageMaintainers />} />

        {/* === Student Routes (Using StudentLayout) === */}
        <Route path="/" element={<StudentLayout><Home /></StudentLayout>} />
        <Route path="/home" element={<StudentLayout><Home /></StudentLayout>} />
        <Route path="/register" element={<StudentLayout><Register /></StudentLayout>} />
        
        {/* === Partner Registration Routes (Using StudentLayout) === */}
        <Route path="/register/laundry" element={<StudentLayout><LaundryRegistration /></StudentLayout>} />
        <Route path="/register/meal" element={<StudentLayout><MealSupplierRegistration /></StudentLayout>} />
        <Route path="/register/maintainer" element={<StudentLayout><MaintainersRegistration /></StudentLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
