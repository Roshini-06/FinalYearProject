import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { Send, FileText, MapPin, Loader2, Sparkles, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function ComplaintForm({ onSuccess }) {
  const [formData, setFormData] = useState({ subject: '', description: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  
  // Duplicate state
  const [duplicateStatus, setDuplicateStatus] = useState(null); // null | 'checking' | 'blocked' | 'allowed'
  const [duplicateInfo, setDuplicateInfo] = useState(null);

  const checkDuplicate = useCallback(async (data) => {
    if (!data.subject || !data.description || !data.location) {
      setDuplicateStatus(null);
      setDuplicateInfo(null);
      return;
    }
    
    setDuplicateStatus('checking');
    try {
      const response = await axios.post('/api/v1/complaints/check-duplicate', {
        subject: data.subject,
        description: data.description,
        location: data.location,
      });
      
      if (response.data.status === 'blocked') {
        setDuplicateStatus('blocked');
        setDuplicateInfo(response.data);
      } else {
        setDuplicateStatus('allowed');
        setDuplicateInfo(null);
      }
    } catch (err) {
      console.warn("Duplicate check failed silently", err);
      setDuplicateStatus(null);
    }
  }, []);

  // Debounced check — fires 1s after last keystroke
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.subject || formData.description || formData.location) {
        checkDuplicate(formData);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.subject, formData.description, formData.location]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setPrediction(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (duplicateStatus === 'blocked') {
      toast.error('⚠️ Please wait for the existing complaint to be resolved.');
      return;
    }
    setIsSubmitting(true);
    setPrediction(null);
    setError(null);
    try {
      const response = await axios.post('/api/v1/complaints/', formData);
      setPrediction(response.data);
      setFormData({ subject: '', description: '', location: '' });
      setDuplicateStatus(null);
      setDuplicateInfo(null);
      toast.success('✅ Complaint submitted! Our team has been notified.');
      if (onSuccess) onSuccess();
    } catch (err) {
      const errMsg = err.response?.data?.detail || "Unable to submit. Please try again.";
      // 409 = blocked duplicate (caught server-side as backup)
      if (err.response?.status === 409) {
        setDuplicateStatus('blocked');
        setDuplicateInfo({ message: errMsg });
        toast.error('⚠️ Duplicate complaint blocked.');
      } else {
        setError(errMsg);
        toast.error(errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBlocked = duplicateStatus === 'blocked';
  const isChecking = duplicateStatus === 'checking';

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary-300/20 blur-3xl group-hover:bg-primary-400/30 transition-all duration-700 rounded-full"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-blue-300/20 blur-3xl group-hover:bg-blue-400/30 transition-all duration-700 rounded-full"></div>

      <div className="space-y-4">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary-600" /> Describe Your Issue
        </h2>
        <p className="text-gray-500 font-medium leading-relaxed">
          Our AI will automatically categorize and prioritize your report. Duplicate reports in the same area are automatically detected.
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
            onChange={(e) => handleChange('subject', e.target.value)}
            required
          />
        </div>

        <div className="group space-y-2">
           <label className="text-sm font-bold text-gray-700 uppercase tracking-widest px-1">Location / Area</label>
           <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. Block A, Street 5"
                className="w-full pl-12 p-4 rounded-xl border border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none text-lg font-medium shadow-sm hover:shadow-md"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              />
           </div>
        </div>

        <div className="group space-y-2">
           <label className="text-sm font-bold text-gray-700 uppercase tracking-widest px-1">Detailed Description</label>
           <textarea
             rows="5"
             placeholder="Please provide details about the issue..."
             className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none text-lg font-medium shadow-sm hover:shadow-md resize-none"
             value={formData.description}
             onChange={(e) => handleChange('description', e.target.value)}
             required
           ></textarea>
        </div>

        {/* Duplicate Status Indicators */}
        <AnimatePresence mode="wait">
          {isChecking && (
            <motion.div
              key="checking"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 text-sm text-gray-400 font-bold px-1"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking for existing reports in this area...
            </motion.div>
          )}

          {isBlocked && duplicateInfo && (
            <motion.div
              key="blocked"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 shadow-inner"
            >
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-amber-500 mt-0.5 shrink-0 animate-pulse" />
                <div>
                  <p className="text-amber-800 font-bold text-sm">Complaint Already Exists in This Area</p>
                  <p className="text-amber-700 text-xs mt-1 leading-relaxed">{duplicateInfo.message}</p>
                </div>
              </div>
              {duplicateInfo.existing_complaint && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-100">
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    Category: {duplicateInfo.existing_complaint.category || 'Unknown'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    duplicateInfo.existing_complaint.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    Status: {duplicateInfo.existing_complaint.status}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                    Match: {(duplicateInfo.existing_complaint.similarity_score * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {duplicateStatus === 'allowed' && formData.subject && (
            <motion.div
              key="allowed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-emerald-600 text-sm font-bold px-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              No existing complaint found in this area. Good to submit!
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-xl font-bold transition-all transform active:scale-[0.98] ${
            isSubmitting || isBlocked
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isChecking
              ? 'bg-primary-400 text-white cursor-wait'
              : 'bg-primary-600 text-white hover:bg-primary-700 shadow-xl shadow-primary-200 hover:-translate-y-1'
          }`}
          disabled={isSubmitting || isBlocked}
        >
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> :
           isBlocked ? <ShieldAlert className="w-6 h-6" /> : 
           <Send className="w-6 h-6" />}
          {isSubmitting ? 'Analyzing & Submitting...' : 
           isBlocked ? 'Submission Blocked — Duplicate Detected' : 
           'Submit Report'}
        </button>
      </form>

      {/* Prediction Result */}
      <AnimatePresence>
        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 shadow-lg text-emerald-900 border-dashed border-2"
          >
            <div className="flex items-start gap-4">
              <div className="bg-emerald-500 p-2 rounded-full text-white shadow-md shadow-emerald-200">
                 <Sparkles className="w-5 h-5"/>
              </div>
              <div className="flex-1">
                 <h3 className="text-lg font-bold">AI Classification Results</h3>
                 <div className="mt-4 flex flex-wrap gap-3">
                    <div className="px-4 py-2 bg-white rounded-lg border border-emerald-200 font-bold flex items-center gap-2 shadow-sm">
                      <span className="text-emerald-500 font-extrabold uppercase text-xs tracking-tighter">Category:</span> {prediction.category}
                    </div>
                    <div className="px-4 py-2 bg-white rounded-lg border border-emerald-200 font-bold flex items-center gap-2 shadow-sm">
                      <span className="text-emerald-500 font-extrabold uppercase text-xs tracking-tighter">Priority:</span> {prediction.priority}
                    </div>
                    <div className="px-4 py-2 bg-white rounded-lg border border-emerald-200 font-bold flex items-center gap-2 shadow-sm">
                      <span className="text-emerald-500 font-extrabold uppercase text-xs tracking-tighter">Status:</span> {prediction.status}
                    </div>
                 </div>
                 <p className="mt-4 text-sm text-emerald-700 font-medium">
                    Reference ID: <span className="font-mono text-xs">#{prediction.id}</span>
                 </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 font-medium flex items-center gap-3">
           <AlertCircle className="w-5 h-5 shrink-0"/> {error}
        </div>
      )}
    </div>
  );
}
