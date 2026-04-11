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
import ManageKitchenMeals from './pages/Admin/ManageKitchenMeals';
import ManageThirdPartyMeals from './pages/Admin/ManageThirdPartyMeals';
import ManageMaintainers from './pages/Admin/ManageMaintainers';
import ManageMaintenance from './pages/Admin/ManageMaintenance';
import ManagePayments from './pages/Admin/ManagePayments'; // <--- Kept only one

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
import ManageOrders from './pages/Laundry/ManageOrders'; 
import OrderHistory from './pages/Laundry/OrderHistory';
import LaundrySettings from './pages/Laundry/LaundrySettings'; // 👈 NEW IMPORT ADDED HERE
import MaintainersDashboard from './pages/Maintainers/MaintainersDashboard';
import MaintainerTasks from './pages/Maintainers/MaintainerTasks'; 
import MaintainerHistory from './pages/Maintainers/MaintainerHistory'; 
import MealDashboard from './pages/Meal/MealDashboard';
import MealOrders from './pages/Meal/MealOrders';
import MealMenuManagement from './pages/Meal/MealMenuManagement';
import MealInsights from './pages/Meal/MealInsights';

// Student Profile Component Import
import Profile from './pages/Student/Profile';
import StudentMealDashboard from './pages/Student/MealDashboard';
import ThirdPartyMealDashboard from './pages/Student/ThirdPartyMealDashboard';
import StudentMaintenance from './pages/Student/StudentMaintenance';

// 👇 --- Student Laundry & Orders --- 👇
import StudentLaundry from './pages/Student/StudentLaundry';
import MyLaundryOrders from './pages/Student/MyLaundryOrders'; 
// 👆 --------------------------------- 👆

// Chatbot Component Import
import Chatbot from './components/Chatbot';

// Payment Success Component Import
import PaymentSuccess from './pages/Payment/PaymentSuccess';
import MealPaymentSuccess from './pages/Payment/MealPaymentSuccess';
import MonthlySuccess from './pages/Payment/MonthlySuccess';

// Company Info Pages
import AboutUs from './Company/AboutUs'; // <--- Kept only one
import PrivacyPolicy from './Company/PrivacyPolicy'; // <--- Kept only one
import TermsOfService from './Company/TermsOfService'; // <--- Kept only one
import HelpCenter from './Company/HelpCenter'; // <--- Kept only one
import Services from './Company/Services';

// Layout wrapper for Student/Public pages
const StudentLayout = ({ children }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const showChatbot = !userInfo || userInfo.role === 'Student';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50">{children}</main>
      <Footer />
      {showChatbot && <Chatbot />} 
    </div>
  );
};

function App() {
  return (
    <Router>
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
        <Route path="/admin/meals/kitchen" element={<ManageKitchenMeals />} />
        <Route path="/admin/meals/third-party" element={<ManageThirdPartyMeals />} />
        <Route path="/admin/maintainers" element={<ManageMaintainers />} />
        <Route path="/admin/maintenance" element={<ManageMaintenance />} />
        <Route path="/admin/payments" element={<ManagePayments />} />

        {/* === Room Management Route === */}
        <Route path="/admin/rooms" element={<ManageRooms />} />
        <Route path="/book/:id" element={<StudentLayout><RoomDetails /></StudentLayout>} />
        <Route path="/booking/:id" element={<StudentLayout><BookingProcess /></StudentLayout>} />

        {/* === Partner Dashboard Routes === */}
        <Route path="/laundry/dashboard" element={<LaundryDashboard />} />
        <Route path="/laundry/orders" element={<ManageOrders />} />
        <Route path="/laundry/history" element={<OrderHistory />} /> 
        <Route path="/laundry/settings" element={<LaundrySettings />} /> {/* 👈 NEW ROUTE ADDED HERE */}
        <Route path="/maintainer/dashboard" element={<MaintainersDashboard />} />
        <Route path="/maintainer/tasks" element={<MaintainerTasks />} /> 
        <Route path="/maintainer/completed" element={<MaintainerHistory />} /> 
        <Route path="/meal/dashboard" element={<MealDashboard />} />
        <Route path="/meal/orders" element={<MealOrders />} />
        <Route path="/meal/menu" element={<MealMenuManagement />} />
        <Route path="/meal/insights" element={<MealInsights />} />

        {/* === Student Routes (Using StudentLayout) === */}
        <Route path="/" element={<StudentLayout><Home /></StudentLayout>} />
        <Route path="/home" element={<StudentLayout><Home /></StudentLayout>} />
        <Route path="/register" element={<StudentLayout><Register /></StudentLayout>} />
        <Route path="/student/maintenance" element={<StudentLayout><StudentMaintenance /></StudentLayout>} />
        
        {/* 👇 --- Student Laundry & My Orders --- 👇 */}
        <Route path="/student/laundry" element={<StudentLayout><StudentLaundry /></StudentLayout>} />
        <Route path="/student/my-orders" element={<StudentLayout><MyLaundryOrders /></StudentLayout>} />
        {/* 👆 ------------------------------------ 👆 */}
        
        {/* === Partner Registration Routes === */}
        <Route path="/register/laundry" element={<StudentLayout><LaundryRegistration /></StudentLayout>} />
        <Route path="/register/meal" element={<StudentLayout><MealSupplierRegistration /></StudentLayout>} />
        <Route path="/register/maintainer" element={<StudentLayout><MaintainersRegistration /></StudentLayout>} />

        {/* === Student Profile Route === */}
        <Route path="/profile" element={<StudentLayout><Profile /></StudentLayout>} />
        <Route path="/student/meals" element={<StudentLayout><StudentMealDashboard /></StudentLayout>} />
        <Route path="/student/meals/third-party" element={<StudentLayout><ThirdPartyMealDashboard /></StudentLayout>} />

        {/* === Payment Success Route === */}
        <Route path="/payment-success/:bookingId" element={<StudentLayout><PaymentSuccess /></StudentLayout>} />
        <Route path="/meal-payment-success/:mealBookingId" element={<StudentLayout><MealPaymentSuccess /></StudentLayout>} />
        <Route path="/monthly-success/:bookingId" element={<StudentLayout><MonthlySuccess /></StudentLayout>} />

        {/* === Company Info Routes === */}
        <Route path="/about-us" element={<StudentLayout><AboutUs /></StudentLayout>} />
        <Route path="/privacy-policy" element={<StudentLayout><PrivacyPolicy /></StudentLayout>} />
        <Route path="/terms-of-service" element={<StudentLayout><TermsOfService /></StudentLayout>} />
        <Route path="/help-center" element={<StudentLayout><HelpCenter /></StudentLayout>} />
        <Route path="/services" element={<StudentLayout><Services /></StudentLayout>} />
      
      </Routes>
    </Router>
  );
}

export default App;