import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Filter, RefreshCw, Users, AlertCircle, 
  TrendingUp, LogOut, CheckCircle2, Clock, MapPin, Search 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { useWebSocket } from '../hooks/useWebSocket';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', priority: '', status: '' });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/admin/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        handleLogout();
      } else {
        toast.error("Failed to fetch complaints");
      }
    } finally {
      setLoading(false);
    }
  };

  const { lastMessage } = useWebSocket('admin@gmail.com');

  useEffect(() => {
    if (lastMessage?.type === 'NEW_COMPLAINT_PRIORITY') {
      toast.error(`Urgent: New High Priority Complaint #${lastMessage.complaint_id}!`, {
        duration: 8000,
        icon: '🚨'
      });
      fetchComplaints();
    }
  }, [lastMessage]);

  useEffect(() => {
    if (!token) {
        navigate('/admin/login');
        return;
    }
    fetchComplaints();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    toast.success("Admin logged out");
    navigate('/admin/login');
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const statuses = ['Pending', 'In Progress', 'Resolved'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

    // --- Optimistic UI update: change status instantly in local state ---
    setComplaints(prev =>
      prev.map(c => c.id === id ? { ...c, status: nextStatus } : c)
    );
    toast.success(`Status updated to ${nextStatus}`);

    try {
      await axios.patch(
        `/api/v1/complaints/${id}/status`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // No need to re-fetch — state is already correct
    } catch (err) {
      // Rollback: revert to the original status on failure
      setComplaints(prev =>
        prev.map(c => c.id === id ? { ...c, status: currentStatus } : c)
      );
      toast.error("Failed to update status. Reverted.");
    }
  };

  const filteredComplaints = complaints.filter(c => 
    (filter.category === '' || c.category === filter.category) &&
    (filter.priority === '' || c.priority === filter.priority) &&
    (filter.status === '' || c.status === filter.status) &&
    (search === '' || c.subject.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 bg-slate-50">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Navbar Component */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div className="space-y-1">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                 <LayoutDashboard className="w-10 h-10 text-primary-600" /> Admin Dashboard
              </h1>
              <p className="text-gray-500 font-bold text-sm">Welcome back, <span className="text-primary-600">{localStorage.getItem('adminEmail')}</span></p>
           </div>
           
           <div className="flex items-center gap-3">
              <button 
                onClick={fetchComplaints} 
                className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 font-bold text-sm text-gray-500"
              >
                 <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                 {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button 
                onClick={handleLogout}
                className="p-3 bg-red-50 border border-red-100 rounded-2xl hover:bg-red-100 transition-all shadow-sm flex items-center gap-2 font-black text-sm text-red-600"
              >
                 <LogOut className="w-4 h-4" />
                 Logout
              </button>
           </div>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard icon={<Users/>} label="Total Reports" value={complaints.length} color="blue" />
           <StatCard icon={<AlertCircle/>} label="High Priority" value={complaints.filter(c => c.priority === 'High').length} color="red" />
           <StatCard icon={<Clock/>} label="Pending" value={complaints.filter(c => c.status === 'Pending').length} color="amber" />
           <StatCard icon={<CheckCircle2/>} label="Resolved" value={complaints.filter(c => c.status === 'Resolved').length} color="emerald" />
        </div>

        {/* Main Content Area */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl overflow-hidden min-h-[500px]">
           {/* Toolbar */}
           <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between text-sm font-bold">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search reports by title or content..."
                  className="w-full pl-12 p-3 bg-gray-50 border-none rounded-2xl outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-gray-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                 <select 
                   className="p-3 bg-gray-50 border-none rounded-xl outline-none ring-1 ring-gray-100 text-gray-600 focus:ring-2 focus:ring-primary-500"
                   onChange={(e) => setFilter({...filter, category: e.target.value})}
                 >
                    <option value="">All Categories</option>
                    <option value="Water">Water</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Roads">Roads</option>
                     <option value="Sanitation">Sanitation</option>
                     <option value="Animals">Animals</option>
                     <option value="General">General</option>
                 </select>
                 <select 
                   className="p-3 bg-gray-50 border-none rounded-xl outline-none ring-1 ring-gray-100 text-gray-600 focus:ring-2 focus:ring-primary-500"
                   onChange={(e) => setFilter({...filter, priority: e.target.value})}
                 >
                    <option value="">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                 </select>
                 <select 
                   className="p-3 bg-gray-50 border-none rounded-xl outline-none ring-1 ring-gray-100 text-gray-600 focus:ring-2 focus:ring-primary-500"
                   onChange={(e) => setFilter({...filter, status: e.target.value})}
                 >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                 </select>
              </div>
           </div>

           {/* Table */}
           <div className="overflow-x-auto">
              {loading ? (
                <div className="py-40 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                  <p className="text-gray-400 font-bold animate-pulse">Fetching city database...</p>
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="py-40 text-center space-y-3">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                      <Search className="w-10 h-10" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900">No matching reports found</h3>
                   <p className="text-gray-400 font-medium italic">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr className="border-b border-gray-100">
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Complaint Details</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Meta Info</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status Control</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <AnimatePresence>
                      {filteredComplaints.map((complaint, idx) => (
                        <motion.tr 
                          key={complaint.id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-primary-50/20 transition-all group"
                        >
                          <td className="px-8 py-6">
                             <div className="flex flex-col space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">#{complaint.id}</span>
                                    <h4 className="font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors uppercase text-sm tracking-tight">{complaint.subject}</h4>
                                </div>
                                <p className="text-xs text-gray-500 font-medium line-clamp-1 max-w-sm">{complaint.description}</p>
                                <div className="flex items-center gap-4 pt-1">
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                       <MapPin className="w-3 h-3"/> {complaint.location}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                       <Clock className="w-3 h-3"/> {new Date(complaint.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-gray-600 flex items-center gap-2">
                                   <div className={`w-1.5 h-1.5 rounded-full ${complaint.category === 'Water' ? 'bg-blue-400' : 'bg-amber-400'}`}></div>
                                   {complaint.category}
                                </span>
                                <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                   complaint.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                                   complaint.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                                   'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                }`}>
                                   {complaint.priority} Priority
                                </span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className={`w-fit px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-tighter shadow-sm border ${
                                complaint.status === 'Resolved' ? 'bg-emerald-500 text-white border-emerald-600' :
                                complaint.status === 'In Progress' ? 'bg-blue-500 text-white border-blue-600' :
                                'bg-white text-gray-500 border-gray-200'
                             }`}>
                                {complaint.status}
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button 
                               onClick={() => handleUpdateStatus(complaint.id, complaint.status)}
                               className="p-3 bg-white border border-gray-200 rounded-xl hover:border-primary-500 hover:text-primary-600 transition-all font-black text-[10px] uppercase tracking-widest text-gray-400 shadow-sm hover:shadow-md"
                             >
                                Cycle Status
                             </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
    const colors = {
        red: 'bg-red-50 text-red-600',
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
        emerald: 'bg-emerald-50 text-emerald-600'
    };
    return (
        <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm flex items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className={`p-5 rounded-3xl ${colors[color]} group-hover:scale-110 transition-transform`}>
                {React.cloneElement(icon, { className: 'w-7 h-7' })}
            </div>
            <div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</div>
                <div className="text-4xl font-black text-gray-900 leading-none">{value}</div>
            </div>
        </div>
    );
}
