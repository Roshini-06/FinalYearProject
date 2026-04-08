import React, { useState, useEffect } from 'react';
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
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/v1/complaints/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaint(response.data);
    } catch (err) {
      console.log("No complaint found or error fetching");
    } finally {
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

        {!complaint ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
             <div className="space-y-8">
                <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm space-y-4">
                   <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <Info className="w-6 h-6" />
                   </div>
                   <h3 className="text-2xl font-bold">How it works</h3>
                   <p className="text-gray-500 leading-relaxed font-medium">
                      Submit your issue once. Our AI will automatically determine the department (Water vs Electricity) and assign a priority level based on the urgency described.
                   </p>
                </div>
                <div className="p-8 bg-gradient-to-br from-primary-600 to-blue-500 rounded-[2.5rem] text-white shadow-xl shadow-primary-200">
                   <h3 className="text-2xl font-bold mb-4">One Case Policy</h3>
                   <p className="opacity-90 leading-relaxed font-medium">To keep our response times low, we enforce a single-active-complaint policy per registerted user.</p>
                </div>
             </div>
             <ComplaintForm onSuccess={fetchComplaint} />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
             {/* Main Complaint Card */}
             <div className="lg:col-span-2 space-y-8">
                <div className="p-10 bg-white border border-gray-100 rounded-[3rem] shadow-xl space-y-8 relative overflow-hidden">
                   <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <span className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold uppercase tracking-widest">Active Report</span>
                        <h2 className="text-4xl font-extrabold text-gray-900">{complaint.subject}</h2>
                      </div>
                      <div className={`px-6 py-3 rounded-2xl font-bold text-sm tracking-wide ${
                        complaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 
                        complaint.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                         {complaint.status}
                      </div>
                   </div>
                   
                   <p className="text-xl text-gray-600 leading-relaxed font-medium">{complaint.description}</p>
                   
                   <div className="flex flex-wrap gap-6 pt-8 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                         <div className="p-3 bg-gray-50 rounded-xl"><Clock className="w-5 h-5 text-gray-400"/></div>
                         <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted On</div>
                            <div className="text-sm font-bold text-gray-700">{new Date(complaint.created_at).toLocaleDateString()}</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="p-3 bg-gray-50 rounded-xl"><MapPin className="w-5 h-5 text-gray-400"/></div>
                         <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</div>
                            <div className="text-sm font-bold text-gray-700">Auto-detected</div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* AI Insight Card */}
             <div className="space-y-8">
                <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-lg space-y-8">
                   <div className="flex items-center gap-3 text-primary-600">
                      <Sparkles className="w-6 h-6" />
                      <h3 className="text-xl font-bold">AI Analysis</h3>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="space-y-3">
                         <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categorized As</div>
                         <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic font-bold text-gray-700">
                            {complaint.category}
                         </div>
                      </div>
                      <div className="space-y-3">
                         <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Priority Level</div>
                         <div className={`flex items-center gap-3 p-4 rounded-2xl border font-extrabold shadow-sm ${
                           complaint.priority === 'High' ? 'bg-red-50 border-red-100 text-red-600' :
                           complaint.priority === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                         }`}>
                            {complaint.priority === 'High' && <AlertTriangle className="w-5 h-5" />}
                            {complaint.priority === 'Medium' && <Clock className="w-5 h-5" />}
                            {complaint.priority === 'Low' && <CheckCircle2 className="w-5 h-5" />}
                            {complaint.priority}
                         </div>
                      </div>
                   </div>
                   
                   <p className="text-sm text-gray-400 font-medium leading-relaxed italic">
                      This analysis was generated automatically to speed up resolution.
                   </p>
                </div>
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
