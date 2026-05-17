// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { ProtectedRoute, AdminRoute } from './components/layout/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ServicesHome from './pages/services/ServicesHome';
import BirthdayPlanning from './pages/services/BirthdayPlanning';
import WeddingDecoration from './pages/services/WeddingDecoration';
import DJBooking from './pages/services/DJBooking';
import Photography from './pages/services/Photography';
import ServiceDetail from './pages/ServiceDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVendors from './pages/admin/AdminVendors';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';

function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            theme="dark"
            style={{ zIndex: 9999 }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/services" element={<AppLayout><ServicesHome /></AppLayout>} />
            <Route path="/services/birthday" element={<AppLayout><BirthdayPlanning /></AppLayout>} />
            <Route path="/services/wedding" element={<AppLayout><WeddingDecoration /></AppLayout>} />
            <Route path="/services/dj" element={<AppLayout><DJBooking /></AppLayout>} />
            <Route path="/services/photography" element={<AppLayout><Photography /></AppLayout>} />
            <Route path="/services/:category/:id" element={<AppLayout><ServiceDetail /></AppLayout>} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/cart" element={<AppLayout><Cart /></AppLayout>} />
              <Route path="/checkout" element={<AppLayout><Checkout /></AppLayout>} />
              <Route path="/booking-confirmation" element={<AppLayout><BookingConfirmation /></AppLayout>} />
              <Route path="/my-bookings" element={<AppLayout><MyBookings /></AppLayout>} />
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<><Navbar /><AdminLayout /></>}>
                <Route index element={<AdminDashboard />} />
                <Route path="vendors" element={<AdminVendors />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
