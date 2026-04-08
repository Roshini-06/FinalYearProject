import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex justify-center items-center px-8 bg-mesh">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-10 bg-white/70 backdrop-blur-xl border border-white/50 rounded-[3rem] shadow-2xl space-y-8"
      >
        <div className="text-center space-y-2">
           <div className="inline-flex p-4 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-200 mb-4">
              <LogIn className="w-8 h-8" />
           </div>
           <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back</h1>
           <p className="text-gray-500 font-medium">Log in to track your complaints</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-widest px-1">Email</label>
              <div className="relative">
                 <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                 <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-12 p-4 rounded-xl border border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-primary-100 outline-none transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                 />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-widest px-1">Password</label>
              <div className="relative">
                 <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                 <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 p-4 rounded-xl border border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-primary-100 outline-none transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                 />
              </div>
           </div>

           {error && (
             <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                {error}
             </div>
           )}

           <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary-600 text-white rounded-2xl text-xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
           >
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Log In'}
           </button>
        </form>

        <p className="text-center text-gray-500 font-medium">
           Don't have an account? <Link to="/signup" className="text-primary-600 font-bold hover:underline">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
}
