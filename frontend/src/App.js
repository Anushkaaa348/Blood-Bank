import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
// Page Components
import Home from './pages/Home';
import Donate from './pages/Donate';
import Hospitals from './pages/Hospitals';
import Request from './pages/Request';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import RequestBlood from './pages/RequestBlood';
import ScheduleDonation from './pages/ScheduleDonation';
import VerifyEmail from './components/VerifyEmail';
import Admin from './pages/admin';
import AdminDashboard from './admin/AdminDashboard';
function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/centers" element={<Hospitals />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          {/* Authentication Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/admin/dashboard" element={<AdminDashboard/>} />
          {/* Protected Routes */}
          <Route path="/request" element={
            <PrivateRoute>
              <Request />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/request-blood" element={
            <PrivateRoute>
              <RequestBlood />
            </PrivateRoute>
          } />
          <Route path="/schedule-donation" element={
            <PrivateRoute>
              <ScheduleDonation />
            </PrivateRoute>
          } />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;