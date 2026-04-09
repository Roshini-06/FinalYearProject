import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, Clock, MapPin, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('/api/v1/complaints/my');
        setComplaints(response.data);
      } catch (err) {
        console.error("Error fetching complaints:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
       <div className="animate-pulse text-xl font-bold text-primary-600">Loading your reports...</div>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20 px-8 bg-mesh">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="space-y-4">
           <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
              My <span className="text-primary-600">Reports</span>
           </h1>
           <p className="text-xl text-gray-500 font-medium">History of all your submitted complaints and their current status.</p>
        </header>

        {complaints.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-gray-300">
             <FileText className="w-16 h-16 text-gray-300 mx-auto mb-6" />
             <h2 className="text-2xl font-bold text-gray-400">No reports found</h2>
             <p className="text-gray-500 mt-2">Any complaints you submit will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {complaints.map((complaint, index) => (
              <motion.div 
                key={complaint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        complaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 
                        complaint.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {complaint.status}
                      </span>
                      <span className="text-gray-300 text-xs font-bold">#{complaint.id}</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {complaint.subject}
                    </h2>
                    <p className="text-gray-500 font-medium line-clamp-2">{complaint.description}</p>
                    
                    <div className="flex flex-wrap gap-6 pt-4">
                       <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                          <MapPin className="w-4 h-4" /> {complaint.location}
                       </div>
                       <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                          <Clock className="w-4 h-4" /> {new Date(complaint.created_at).toLocaleDateString()}
                       </div>
                    </div>
                  </div>

                  <div className="md:w-48 space-y-4 md:border-l md:pl-8 border-gray-100">
                     <div className="space-y-1">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</div>
                        <div className="text-sm font-bold text-gray-700 italic">{complaint.category}</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</div>
                        <div className={`text-sm font-extrabold flex items-center gap-2 ${
                            complaint.priority === 'High' ? 'text-red-600' :
                            complaint.priority === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                           {complaint.priority}
                        </div>
                     </div>
                  </div>
                </div>
                
                {/* Decorative arrow helper */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-100 group-hover:text-primary-100 transition-colors hidden lg:block">
                   <ChevronRight className="w-12 h-12" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
