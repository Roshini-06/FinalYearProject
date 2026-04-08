import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Filter, RefreshCw, Users, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', priority: '' });

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/v1/complaints/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(response.data);
    } catch (err) {
      console.error("Failed to fetch all complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter(c => 
    (filter.category === '' || c.category === filter.category) &&
    (filter.priority === '' || c.priority === filter.priority)
  );

  return (
    <div className="min-h-screen pt-32 pb-20 px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex justify-between items-center">
           <div className="space-y-1">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                 <LayoutDashboard className="w-10 h-10 text-primary-600" /> Administrative Console
              </h1>
              <p className="text-gray-500 font-medium">Control center for AI-prioritized citizen reports.</p>
           </div>
           <button onClick={fetchComplaints} className="p-4 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
              <RefreshCw className="w-5 h-5 text-gray-400" />
           </button>
        </header>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex items-center gap-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Users className="w-6 h-6"/></div>
              <div>
                 <div className="text-3xl font-black text-gray-900">{complaints.length}</div>
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Reports</div>
              </div>
           </div>
           <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex items-center gap-6">
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><AlertCircle className="w-6 h-6"/></div>
              <div>
                 <div className="text-3xl font-black text-gray-900">{complaints.filter(c => c.priority === 'High').length}</div>
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">High Priority</div>
              </div>
           </div>
           <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex items-center gap-6">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp className="w-6 h-6"/></div>
              <div>
                 <div className="text-3xl font-black text-gray-900">{complaints.filter(c => c.status === 'Resolved').length}</div>
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resolved Cases</div>
              </div>
           </div>
        </div>

        {/* Filtering & Table */}
        <div className="bg-white border border-gray-100 rounded-[3rem] shadow-xl overflow-hidden">
           <div className="p-8 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-white">
              <div className="flex items-center gap-3 text-gray-400">
                 <Filter className="w-5 h-5" />
                 <span className="font-bold uppercase text-xs tracking-widest">Filters</span>
              </div>
              <div className="flex gap-4">
                 <select 
                   className="p-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 outline-none ring-1 ring-gray-100"
                   onChange={(e) => setFilter({...filter, category: e.target.value})}
                 >
                    <option value="">All Categories</option>
                    <option value="Water">Water</option>
                    <option value="Electricity">Electricity</option>
                 </select>
                 <select 
                   className="p-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 outline-none ring-1 ring-gray-100"
                   onChange={(e) => setFilter({...filter, priority: e.target.value})}
                 >
                    <option value="">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                 </select>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</th>
                       <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                       <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Priority</th>
                       <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                       <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {filteredComplaints.map((complaint) => (
                       <tr key={complaint.id} className="hover:bg-gray-50/50 transition-all group">
                          <td className="px-8 py-6">
                             <div className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors uppercase text-sm">{complaint.subject}</div>
                             <div className="text-xs text-gray-400 font-medium truncate max-w-[200px]">{complaint.description}</div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-sm font-bold text-gray-600">{complaint.category}</span>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                complaint.priority === 'High' ? 'bg-red-100 text-red-700' :
                                complaint.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                             }`}>
                                {complaint.priority}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-gray-700">
                             {complaint.status}
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button className="text-primary-600 font-extrabold text-xs hover:underline uppercase tracking-widest">Manage</button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
