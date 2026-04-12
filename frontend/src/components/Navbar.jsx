import React from 'react';
import { Power, LayoutDashboard, PlusCircle, LogOut, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';

export default function Navbar() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const email = user?.primaryEmailAddress?.emailAddress;
  // Read role from Clerk publicMetadata (set via Clerk Dashboard or backend)
  const role = user?.publicMetadata?.role;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2 rounded-lg text-white">
              <Power className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-500">
              SmartComplain.ai
            </span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link to={isSignedIn ? "/dashboard" : "/login"} className="text-gray-600 hover:text-primary-600 font-medium transition-colors flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Submit Report
            </Link>
            {isSignedIn && (
              <Link to="/my-complaints" className="text-gray-600 hover:text-primary-600 font-medium transition-colors flex items-center gap-2">
                <FileText className="w-4 h-4" /> My Reports
              </Link>
            )}
            {isSignedIn && role === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-primary-600 font-medium transition-colors flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Admin Panel
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
               <div className="flex items-center gap-6">
                  <span className="text-sm font-bold text-gray-400 hidden lg:block">
                    Logged in as <span className="text-primary-600">{email}</span>
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
               </div>
            ) : (
              <Link to="/login" className="bg-primary-600 text-white px-5 py-2 rounded-full font-medium hover:bg-primary-700 transition-all shadow-lg shadow-primary-200">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
