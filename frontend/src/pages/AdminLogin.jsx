import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/v1/admin/login', {
        email,
        password
      });

      const { access_token, role } = response.data;
      
      if (role === 'admin') {
        localStorage.setItem('adminToken', access_token);
        localStorage.setItem('adminEmail', email);
        toast.success('Welcome back, Admin!');
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. Admin only.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid admin credentials');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-20 px-4 bg-slate-50 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 space-y-8 border border-gray-100"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-primary-200">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Console</h1>
          <p className="text-gray-500 font-medium text-sm px-4">Secure access for municipal administrators only.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="email"
                placeholder="admin@gmail.com"
                className="w-full pl-12 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            {loading ? 'Verifying...' : 'Authorize Access'}
          </button>
        </form>

        <div className="pt-6 text-center space-y-4">
            <p className="text-xs text-gray-400 font-medium italic">
                Authorized Personnel Only. All activities are logged.
            </p>
            <div className="pt-4 border-t border-gray-50">
               <button 
                 onClick={() => navigate('/login')}
                 className="text-gray-400 hover:text-primary-600 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
               >
                  ← Back to Citizen Login
               </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
