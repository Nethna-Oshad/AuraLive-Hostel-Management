import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 

import Home from './pages/Student/Home';
import Register from './pages/Student/Register';
import Login from './common/Login'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageStudents from './pages/Admin/ManageStudents';
import ManageLaundry from './pages/Admin/ManageLaundry';
import ManageMeals from './pages/Admin/ManageMeals';
import ManageKitchenMeals from './pages/Admin/ManageKitchenMeals';
import ManageThirdPartyMeals from './pages/Admin/ManageThirdPartyMeals';
import ManageMaintainers from './pages/Admin/ManageMaintainers';
import ManageMaintenance from './pages/Admin/ManageMaintenance';
import ManagePayments from './pages/Admin/ManagePayments'; 
import AdminMessages from './pages/Admin/AdminMessages';

import ManageRooms from './pages/Room/ManageRooms';
import RoomDetails from './pages/Room/RoomDetails'; 
import BookingProcess from './pages/Room/BookingProcess'; 

import LaundryRegistration from './pages/Laundry/LaundryRegistation';
import MealSupplierRegistration from './pages/Meal/MealSupplierRegistation';
import MaintainersRegistration from './pages/Maintainers/MaintainersRegistation';

import LaundryDashboard from './pages/Laundry/LaundryDashboard';
import ManageOrders from './pages/Laundry/ManageOrders'; 
import OrderHistory from './pages/Laundry/OrderHistory';
import LaundrySettings from './pages/Laundry/LaundrySettings'; 
import MaintainersDashboard from './pages/Maintainers/MaintainersDashboard';
import MaintainerTasks from './pages/Maintainers/MaintainerTasks'; 
import MaintainerHistory from './pages/Maintainers/MaintainerHistory'; 
import MealDashboard from './pages/Meal/MealDashboard';
import MealOrders from './pages/Meal/MealOrders';
import MealMenuManagement from './pages/Meal/MealMenuManagement';
import MealInsights from './pages/Meal/MealInsights';

import Profile from './pages/Student/Profile';
import StudentMealDashboard from './pages/Student/MealDashboard';
import ThirdPartyMealDashboard from './pages/Student/ThirdPartyMealDashboard';
import MealOrderQrDetails from './pages/Student/MealOrderQrDetails';
import StudentMaintenance from './pages/Student/StudentMaintenance';
import MyMaintenanceRequests from './pages/Student/MyMaintenanceRequests';

import StudentLaundry from './pages/Student/StudentLaundry';
import MyLaundryOrders from './pages/Student/MyLaundryOrders'; 

import Chatbot from './components/Chatbot';

import PaymentSuccess from './pages/Payment/PaymentSuccess';
import MealPaymentSuccess from './pages/Payment/MealPaymentSuccess';
import MonthlySuccess from './pages/Payment/MonthlySuccess';

import AboutUs from './Company/AboutUs'; 
import PrivacyPolicy from './Company/PrivacyPolicy'; 
import TermsOfService from './Company/TermsOfService'; 
import HelpCenter from './Company/HelpCenter'; 
import Services from './Company/Services';


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
        <Route path="/login" element={<StudentLayout><Login /></StudentLayout>} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<ManageStudents />} />
        <Route path="/admin/laundry" element={<ManageLaundry />} />
        <Route path="/admin/meals" element={<ManageMeals />} />
        <Route path="/admin/meals/kitchen" element={<ManageKitchenMeals />} />
        <Route path="/admin/meals/third-party" element={<ManageThirdPartyMeals />} />
        <Route path="/admin/maintainers" element={<ManageMaintainers />} />
        <Route path="/admin/maintenance" element={<ManageMaintenance />} />
        <Route path="/admin/payments" element={<ManagePayments />} />
        <Route path="/admin/messages" element={<AdminMessages />} />

        <Route path="/admin/rooms" element={<ManageRooms />} />
        <Route path="/book/:id" element={<StudentLayout><RoomDetails /></StudentLayout>} />
        <Route path="/booking/:id" element={<StudentLayout><BookingProcess /></StudentLayout>} />

        <Route path="/laundry/dashboard" element={<LaundryDashboard />} />
        <Route path="/laundry/orders" element={<ManageOrders />} />
        <Route path="/laundry/history" element={<OrderHistory />} /> 
        <Route path="/laundry/settings" element={<LaundrySettings />} /> 
        <Route path="/maintainer/dashboard" element={<MaintainersDashboard />} />
        <Route path="/maintainer/tasks" element={<MaintainerTasks />} /> 
        <Route path="/maintainer/completed" element={<MaintainerHistory />} /> 
        <Route path="/meal/dashboard" element={<MealDashboard />} />
        <Route path="/meal/orders" element={<MealOrders />} />
        <Route path="/meal/menu" element={<MealMenuManagement />} />
        <Route path="/meal/insights" element={<MealInsights />} />

        <Route path="/" element={<StudentLayout><Home /></StudentLayout>} />
        <Route path="/home" element={<StudentLayout><Home /></StudentLayout>} />
        <Route path="/register" element={<StudentLayout><Register /></StudentLayout>} />
        <Route path="/student/maintenance" element={<StudentLayout><StudentMaintenance /></StudentLayout>} />
        <Route path="/student/my-maintenance" element={<StudentLayout><MyMaintenanceRequests /></StudentLayout>} />
        
        <Route path="/student/laundry" element={<StudentLayout><StudentLaundry /></StudentLayout>} />
        <Route path="/student/my-orders" element={<StudentLayout><MyLaundryOrders /></StudentLayout>} />
        
        <Route path="/register/laundry" element={<StudentLayout><LaundryRegistration /></StudentLayout>} />
        <Route path="/register/meal" element={<StudentLayout><MealSupplierRegistration /></StudentLayout>} />
        <Route path="/register/maintainer" element={<StudentLayout><MaintainersRegistration /></StudentLayout>} />

        <Route path="/profile" element={<StudentLayout><Profile /></StudentLayout>} />
        <Route path="/student/meals" element={<StudentLayout><StudentMealDashboard /></StudentLayout>} />
        <Route path="/student/meals/third-party" element={<StudentLayout><ThirdPartyMealDashboard /></StudentLayout>} />
        <Route path="/meal-order/:reference" element={<StudentLayout><MealOrderQrDetails /></StudentLayout>} />

        <Route path="/payment-success/:bookingId" element={<StudentLayout><PaymentSuccess /></StudentLayout>} />
        <Route path="/meal-payment-success/:mealBookingId" element={<StudentLayout><MealPaymentSuccess /></StudentLayout>} />
        <Route path="/monthly-success/:bookingId" element={<StudentLayout><MonthlySuccess /></StudentLayout>} />

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