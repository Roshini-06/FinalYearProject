import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserDashboard from './pages/UserDashboard';
import MyComplaints from './pages/MyComplaints';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// User Protection (Clerk based)
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Loading session...</div>;
  if (!isSignedIn) return <Navigate to="/login" />;
  if (adminOnly && user?.publicMetadata?.role !== 'admin') return <Navigate to="/" />;
  return children;
};

// Admin Protection (LocalStorage based)
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/admin/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <div className="min-h-screen bg-slate-50 selection:bg-primary-500 selection:text-white">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Manual Admin Login */}
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route 
                path="/my-complaints" 
                element={
                  <ProtectedRoute>
                    <MyComplaints />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Independent Admin Dashboard */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } 
              />

              {/* Keep old /admin for Clerk users if they were using it, 
                  but user said 'Admin dashboard after login' and 'Go to /admin/dashboard' */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
            </Routes>
          </main>
          
          <footer className="py-20 border-t border-gray-100 bg-white">
             <div className="max-w-7xl mx-auto px-8 text-center text-gray-400 font-medium text-sm">
               &copy; 2026 SmartComplain.ai. Shaping the future of public services.
             </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
