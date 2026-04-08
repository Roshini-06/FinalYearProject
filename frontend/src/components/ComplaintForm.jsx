import React, { useState } from 'react';
import axios from 'axios';
import { Send, FileText, MapPin, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ComplaintForm({ onSuccess }) {
  const [formData, setFormData] = useState({ subject: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPrediction(null);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/v1/complaints/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrediction(response.data);
      setFormData({ subject: '', description: '' });
      if (onSuccess) {
        setTimeout(onSuccess, 2000); // Fetch new status after a brief delay
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to reach backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl space-y-8 animate-fade-in relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary-300/20 blur-3xl group-hover:bg-primary-400/30 transition-all duration-700 rounded-full"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-blue-300/20 blur-3xl group-hover:bg-blue-400/30 transition-all duration-700 rounded-full"></div>

      <div className="space-y-4">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary-600" /> Describe Your Issue
        </h2>
        <p className="text-gray-500 font-medium leading-relaxed">
          Our AI will automatically categorize and prioritize your report to ensure it's handled by the right department.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="group space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-widest px-1">Subject</label>
          <input
            type="text"
            placeholder="e.g. Broken streetlight in Block-B"
            className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none text-lg font-medium shadow-sm hover:shadow-md"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
        </div>

        <div className="group space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-widest px-1">Detailed Description</label>
          <textarea
            rows="5"
            placeholder="Please provide details..."
            className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none text-lg font-medium shadow-sm hover:shadow-md resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          ></textarea>
        </div>

        <button
          className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-xl font-bold transition-all transform active:scale-[0.98] ${
            isSubmitting
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700 shadow-xl shadow-primary-200 hover:-translate-y-1'
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          {isSubmitting ? 'Analyzing Details...' : 'Submit Report'}
        </button>
      </form>

      {/* Prediction Result UI */}
      {prediction && (
        <motion.div
           initial={{ opacity: 0, y: 20, scale: 0.95 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 shadow-lg text-emerald-900 border-dashed border-2"
        >
          <div className="flex items-start gap-4">
            <div className="bg-emerald-500 p-2 rounded-full text-white shadow-md shadow-emerald-200">
               <Sparkles className="w-5 h-5"/>
            </div>
            <div className="flex-1">
               <h3 className="text-lg font-bold flex items-center gap-2">
                  AI Classification Results
               </h3>
               <div className="mt-4 flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-white rounded-lg border border-emerald-200 font-bold flex items-center gap-2 shadow-sm">
                    <span className="text-emerald-500 font-extrabold uppercase text-xs tracking-tighter">Category:</span> {prediction.category}
                  </div>
                  <div className="px-4 py-2 bg-white rounded-lg border border-emerald-200 font-bold flex items-center gap-2 shadow-sm">
                    <span className="text-emerald-500 font-extrabold uppercase text-xs tracking-tighter">Status:</span> {prediction.status}
                  </div>
               </div>
               <p className="mt-4 text-sm text-emerald-700 font-medium">
                  Reference ID: <span className="font-mono text-xs">{prediction._id}</span>
               </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-8 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 font-medium flex items-center gap-3">
           <AlertCircle className="w-5 h-5"/> {error}
        </div>
      )}
    </div>
  );
}
