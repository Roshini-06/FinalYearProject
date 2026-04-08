import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Zap, Clock, ShieldCheck, Sparkle, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <div className="pt-32 pb-20 px-8 relative overflow-hidden bg-mesh">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
        <div className="flex-1 space-y-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
             className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 font-bold border border-primary-200 text-sm shadow-sm"
          >
            <Sparkle className="w-4 h-4" /> Next-Gen AI Complaint Resolution 
          </motion.div>
          <motion.h1 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600"
          >
            Your Voice <br/><span className="text-primary-600">Simplified by AI.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 font-medium leading-relaxed max-w-xl"
          >
            A high-speed reporting system categorization for citizen complaints. Integrated with smart routing to fix water and power issues instantly.
          </motion.p>
          
          <div className="flex gap-4">
             <Link to="/signup" className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-200">
                Get Started
             </Link>
             <Link to="/login" className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                Sign In
             </Link>
          </div>
          
          <div className="flex flex-wrap gap-8 pt-6 border-t border-gray-100">
             <div className="flex items-center gap-3">
               <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 border border-blue-500/10"><Droplets className="w-6 h-6"/></div>
               <span className="font-bold text-gray-700 uppercase tracking-widest text-xs">Water Dept</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-600 border border-orange-500/10"><Zap className="w-6 h-6"/></div>
               <span className="font-bold text-gray-700 uppercase tracking-widest text-xs">Electricity</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 border border-emerald-500/10"><ShieldCheck className="w-6 h-6"/></div>
               <span className="font-bold text-gray-700 uppercase tracking-widest text-xs">Smart Safety</span>
             </div>
          </div>
        </div>

        <div className="flex-1">
           {/* Decorative AI visual or illustration could go here */}
           <div className="w-full h-96 bg-gradient-to-br from-primary-500/20 to-blue-500/20 rounded-[3rem] border border-white/50 backdrop-blur-3xl flex items-center justify-center">
              <Sparkle className="w-20 h-20 text-primary-500 animate-pulse" />
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="p-8 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all"
    >
      <Icon className="w-10 h-10 text-primary-600 mb-6" />
      <div className="text-4xl font-extrabold text-gray-900 mb-2">{value}</div>
      <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{label}</div>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <div className="max-w-7xl mx-auto px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <StatCard icon={Clock} value="15Mins" label="Avg AI Response" />
           <StatCard icon={Zap} value="98%" label="Classification Accuracy" />
           <StatCard icon={LayoutDashboard} value="12K+" label="Issues Resolved" delay={0.2} />
        </div>
      </div>
    </>
  );
}
