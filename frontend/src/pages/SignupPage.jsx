import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSignUp, useUser } from '@clerk/clerk-react';
import { UserPlus, Mail, KeyRound, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function SignupPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useUser();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard');
    }
  }, [isSignedIn, navigate]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      // Start the completely passwordless sign-up process with Email Code
      await signUp.create({
        emailAddress: email,
        // Optional role logic can be stored in clerk metadata via backend later or handled separately
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      
      setPendingVerification(true);
      toast.success('Registration initiated. OTP sent to your email!');
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Failed to start registration via OTP');
      toast.error('Registration OTP failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        navigate('/dashboard');
        toast.success("Account created & logged in!");
      } else if (completeSignUp.status === 'missing_requirements') {
        // Clerk dashboard still requires username/password — guide user
        const missing = completeSignUp.missingFields || [];
        if (missing.includes('password') || missing.includes('username')) {
          setError('⚠️ Your Clerk app requires username/password to be disabled. Go to Clerk Dashboard → User & Authentication → Email, Phone, Username → disable "Username" and "Password".');
        } else {
          setError(`Missing fields: ${missing.join(', ')}`);
        }
        console.log(JSON.stringify(completeSignUp, null, 2));
      } else {
        console.log(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Invalid or expired OTP');
      toast.error('Invalid OTP');
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
        <div className="text-center space-y-4">
           {/* Role Selection Toggle */}
           <div className="flex p-1 bg-gray-100/50 backdrop-blur-sm rounded-2xl w-full max-w-[280px] mx-auto mb-6 border border-gray-200/50">
              <button 
                type="button"
                onClick={() => setSelectedRole('user')}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-300 ${selectedRole === 'user' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                USER
              </button>
              <button 
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-300 ${selectedRole === 'admin' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                ADMIN
              </button>
           </div>

           <div className="inline-flex p-4 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-200">
              <UserPlus className="w-8 h-8" />
           </div>
           <h1 className="text-3xl font-extrabold text-gray-900">
              {selectedRole === 'admin' ? 'Admin Registration' : 'Create Account'}
           </h1>
           <p className="text-gray-500 font-medium">Join SmartComplain.ai securely via OTP</p>
        </div>

        {!pendingVerification ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-widest px-1">Email Address</label>
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
                <div className="flex items-center gap-2 mt-2 px-1 text-xs text-primary-600 font-bold">
                   <Info className="w-4 h-4"/> Passwordless authentication enabled
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
                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Send OTP'}
             </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-widest px-1">Verification Code</label>
                <div className="relative">
                   <KeyRound className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                   <input
                    type="text"
                    placeholder="123456"
                    className="w-full pl-12 p-4 rounded-xl border border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-primary-100 outline-none transition-all font-medium text-center tracking-widest text-lg"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                   />
                </div>
                <p className="text-xs text-gray-400 text-center pt-2">Check your email for the OTP we sent.</p>
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
                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Complete Sign Up'}
             </button>
             <button
                type="button"
                onClick={() => {setPendingVerification(false); setError(''); setCode('');}}
                className="w-full text-center text-sm font-bold text-gray-400 hover:text-gray-600"
             >
                Back to Email
             </button>
          </form>
        )}

        <p className="text-center text-gray-500 font-medium">
           Already have an account? <Link to="/login" className="text-primary-600 font-bold hover:underline">Log In</Link>
        </p>
      </motion.div>
    </div>
  );
}
