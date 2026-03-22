import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 

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
import MealDashboard from './pages/Meal/MealDashboard';
import MealOrders from './pages/Meal/MealOrders';
import MealMenuManagement from './pages/Meal/MealMenuManagement';
import MealInsights from './pages/Meal/MealInsights';

// Student Profile Component Import
import Profile from './pages/Student/Profile';
import StudentMealDashboard from './pages/Student/MealDashboard';

// Chatbot Component Import
import Chatbot from './components/Chatbot';

// Payment Success Component Import
import PaymentSuccess from './pages/Payment/PaymentSuccess';
import MealPaymentSuccess from './pages/Payment/MealPaymentSuccess';
import ManagePayments from './pages/Admin/ManagePayments';

// Company Info Pages
// Company Info Pages (Removed '/pages' from the path)
import AboutUs from './Company/AboutUs';
import PrivacyPolicy from './Company/PrivacyPolicy';
import TermsOfService from './Company/TermsOfService';
import HelpCenter from './Company/HelpCenter';


// Layout wrapper for Student/Public pages
const StudentLayout = ({ children }) => {
  // Check who is logged in
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  // Only show the chatbot if the user is a Student OR if no one is logged in yet (guest browsing)
  const showChatbot = !userInfo || userInfo.role === 'Student';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50">{children}</main>
      <Footer />
      {/* Chatbot is now cleanly scoped only to the student layout! */}
      {showChatbot && <Chatbot />} 
    </div>
  );
};

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

        {/* === Room Management Route === */}
        <Route path="/admin/rooms" element={<ManageRooms />} />
        <Route path="/book/:id" element={<StudentLayout><RoomDetails /></StudentLayout>} />
        <Route path="/booking/:id" element={<StudentLayout><BookingProcess /></StudentLayout>} />

        {/* === Partner Dashboard Routes === */}
        <Route path="/laundry/dashboard" element={<LaundryDashboard />} />
        <Route path="/maintainer/dashboard" element={<MaintainersDashboard />} />
        <Route path="/meal/dashboard" element={<MealDashboard />} />
        <Route path="/meal/orders" element={<MealOrders />} />
        <Route path="/meal/menu" element={<MealMenuManagement />} />
        <Route path="/meal/insights" element={<MealInsights />} />

        {/* === Student Routes (Using StudentLayout) === */}
        <Route path="/" element={<StudentLayout><Home /></StudentLayout>} />
        <Route path="/home" element={<StudentLayout><Home /></StudentLayout>} />
        <Route path="/register" element={<StudentLayout><Register /></StudentLayout>} />
        
        {/* === Partner Registration Routes (Using StudentLayout) === */}
        <Route path="/register/laundry" element={<StudentLayout><LaundryRegistration /></StudentLayout>} />
        <Route path="/register/meal" element={<StudentLayout><MealSupplierRegistration /></StudentLayout>} />
        <Route path="/register/maintainer" element={<StudentLayout><MaintainersRegistration /></StudentLayout>} />

        {/* === Student Profile Route === */}
        <Route path="/profile" element={<StudentLayout><Profile /></StudentLayout>} />
        <Route path="/student/meals" element={<StudentLayout><StudentMealDashboard /></StudentLayout>} />

        {/* === Payment Success Route === */}
        <Route path="/payment-success/:bookingId" element={<StudentLayout><PaymentSuccess /></StudentLayout>} />
        <Route path="/meal-payment-success/:mealBookingId" element={<StudentLayout><MealPaymentSuccess /></StudentLayout>} />
        <Route path="/admin/payments" element={<ManagePayments />} />

        {/* === Company Info Routes === */}
        <Route path="/about-us" element={<StudentLayout><AboutUs /></StudentLayout>} />
        <Route path="/privacy-policy" element={<StudentLayout><PrivacyPolicy /></StudentLayout>} />
        <Route path="/terms-of-service" element={<StudentLayout><TermsOfService /></StudentLayout>} />
        <Route path="/help-center" element={<StudentLayout><HelpCenter /></StudentLayout>} />
      
      </Routes>
    </Router>
  );
}

export default App;