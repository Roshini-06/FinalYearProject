import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ComplaintForm from '../components/ComplaintForm';
import { FileText, Sparkles, Clock, MapPin, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserDashboard() {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchComplaint = async () => {
    console.log("UserDashboard: Attempting to fetch latest complaint...");
    const timeout = setTimeout(() => {
       console.warn("UserDashboard: Fetch timed out after 10s");
       setLoading(false);
    }, 10000);

    try {
      const response = await axios.get('/api/v1/complaints/my');
      console.log("UserDashboard: Fetch success, count:", response.data.length);
      if (response.data.length > 0) {
        setComplaint(response.data[0]);
      }
    } catch (err) {
      console.error("UserDashboard: Fetch failed", err.message);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading your reports...</div>;

  return (
    <div className="min-h-screen pt-32 pb-20 px-8 bg-mesh">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="space-y-4">
           <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
              Hello, <span className="text-primary-600">{user?.email.split('@')[0]}</span>
           </h1>
           <p className="text-xl text-gray-500 font-medium">Manage and track your citizen reports in real-time.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
           <div className="lg:col-span-2">
              <ComplaintForm onSuccess={fetchComplaint} />
           </div>
           
           <div className="space-y-8">
              {complaint ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-xl space-y-6 relative overflow-hidden"
                >
                   <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900">Latest Report</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        complaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 
                        complaint.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                         {complaint.status}
                      </span>
                   </div>
                   <div className="space-y-2">
                      <div className="font-bold text-gray-900 line-clamp-1">{complaint.subject}</div>
                      <p className="text-sm text-gray-500 line-clamp-2">{complaint.description}</p>
                   </div>
                   <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                         <Clock className="w-4 h-4" /> {new Date(complaint.created_at).toLocaleDateString()}
                      </div>
                   </div>
                   <Link to="/my-complaints" className="block w-full py-3 bg-gray-50 hover:bg-gray-100 text-center rounded-xl text-xs font-bold text-gray-600 transition-colors">
                      View All Reports
                   </Link>
                </motion.div>
              ) : (
                <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 text-center space-y-4">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-400 mx-auto shadow-sm">
                      <Info className="w-6 h-6" />
                   </div>
                   <h3 className="text-lg font-bold text-blue-900">No active reports</h3>
                   <p className="text-sm text-blue-600 font-medium">Your latest report status will appear here after you submit one.</p>
                </div>
              )}

              <div className="p-8 bg-gradient-to-br from-primary-600 to-blue-500 rounded-[2.5rem] text-white shadow-xl shadow-primary-200">
                 <h3 className="text-2xl font-bold mb-4">How it works</h3>
                 <p className="opacity-90 leading-relaxed font-medium text-sm">
                    Submit your issue. Our AI will automatically determine the department (Water vs Electricity) and assign a priority level based on the urgency.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
