import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

// Import sleek vector icons from lucide-react
import {
  User,
  ShieldAlert,
  Smartphone,
  IndianRupee,
  Fingerprint,
  CalendarDays,
  FileText,
  KeyRound,
  Mail,
  HardHat,
  LockKeyhole,
  LockOpen
} from 'lucide-react';

export default function LabourProfile() {
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  // Core dynamic database model states matching the User Schema parameters
  const [profile, setProfile] = useState({
    _id: '',
    name: '',
    mobile: '',
    identityId: '',
    role: 'labour',
    status: 'Active',
    dailyWage: 0,
    adharNumber: '',
    aadhaarPhoto: '',
    profilePhoto: '',
    createdAt: ''
  });

  // Method 1 States: Change password using old active password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Method 2 States: Change password using Email OTP Verification Challenge
  const [otpSent, setOtpSent] = useState(false);
  const [otpData, setOtpData] = useState({
    emailInput: '', // Worker enters their verified workspace email address
    otpCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [activeTab, setActiveTab] = useState('password'); // Switches between 'password' and 'otp'
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Simple date formatter to convert string layout to dd:mm:yy standard
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}:${month}:${year}`;
  };

  const fetchLabourProfileDetails = async () => {
    setPageLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${baseURL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your structural profile data matrix.");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchLabourProfileDetails();
  }, []);

  // METHOD 1: Traditional Password Change Routing
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Validation error: New passwords choices do not match.");
      return;
    }

    setActionLoading(true);
    const token = localStorage.getItem('token');

    const passwordPromise = axios.put(`${baseURL}/api/auth/profile/password`, {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.promise(passwordPromise, {
      loading: 'Modifying secure account password layers...',
      success: () => {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setActionLoading(false);
        return 'Password rotated successfully! 🔐';
      },
      error: (err) => {
        setActionLoading(false);
        return err.response?.data?.message || 'Failed to verify current active password.';
      }
    });
  };

  // METHOD 2: Request 6-Digit Verification OTP Code
  const handleRequestOtp = async () => {
    if (!otpData.emailInput.trim()) {
      toast.error("Please provide a valid workspace email address first.");
      return;
    }
    setActionLoading(true);
    const token = localStorage.getItem('token');
    
    const otpPromise = axios.post(`${baseURL}/api/auth/profile/request-otp`, {
      email: otpData.emailInput.trim()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.promise(otpPromise, {
      loading: `Dispatching verification token to ${otpData.emailInput}...`,
      success: () => {
        setOtpSent(true);
        setActionLoading(false);
        return 'OTP secure key dispatched safely! 📧';
      },
      error: (err) => {
        setActionLoading(false);
        return err.response?.data?.message || 'Failed to trigger verification outbox pipeline.';
      }
    });
  };

  // METHOD 2: Confirm OTP and Save Forced Password Override
  const handleOtpVerifyAndSubmit = async (e) => {
    e.preventDefault();
    if (otpData.newPassword !== otpData.confirmPassword) {
      toast.error("Validation error: Passwords do not match.");
      return;
    }

    setActionLoading(true);
    const token = localStorage.getItem('token');

    const verifyPromise = axios.put(`${baseURL}/api/auth/profile/verify-otp-reset`, {
      otp: otpData.otpCode,
      newPassword: otpData.newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.promise(verifyPromise, {
      loading: 'Evaluating OTP authenticity parameters...',
      success: () => {
        setOtpData({ emailInput: '', otpCode: '', newPassword: '', confirmPassword: '' });
        setOtpSent(false);
        setActionLoading(false);
        return 'Password updated securely via OTP bypass! 🔓';
      },
      error: (err) => {
        setActionLoading(false);
        return err.response?.data?.message || 'Invalid or expired OTP token string.';
      }
    });
  };

  // Framer Motion Animation configuration states
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  if (pageLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500 font-bold text-xs tracking-wider gap-3">
        <svg className="animate-spin h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>PARSING PERSONAL ACCOUNT DATA METRICS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2 md:p-4 select-none font-sans text-slate-100 overflow-x-hidden">
      
      {/* Page Header Section */}
      <div>
        <h3 className="text-xl md:text-2xl font-black tracking-tight text-white">My Worker Profile</h3>
        <p className="text-xs text-slate-400 font-medium">Verify your registration files, daily wage constants, and update system passwords securely.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: HIGH-FIDELITY IDENTITY CARD BOARD */}
        <div className="bg-slate-900 border border-slate-800 shadow-xl rounded-3xl p-6 flex flex-col items-center justify-between text-center gap-6 relative overflow-hidden h-fit">
          <div className="absolute -right-10 -top-10 w-28 h-28 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-4 flex flex-col items-center w-full">
            {profile.profilePhoto ? (
              <img 
                src={`${baseURL}/${profile.profilePhoto}`} 
                alt="Labour Avatar" 
                className="w-24 h-24 rounded-2xl object-cover border border-slate-700 shadow-md bg-slate-950 animate-fadeIn"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 flex items-center justify-center border-slate-800 shadow-inner shrink-0">
                <User className="w-8 h-8 text-slate-600" />
              </div>
            )}

            <div className="space-y-1.5">
              <h4 className="text-lg font-black text-white tracking-wide">{profile.name}</h4>
              <div className="flex gap-1.5 justify-center items-center">
                <span className="inline-flex items-center gap-1 text-[9px] bg-orange-500/10 text-orange-400 font-black border border-orange-500/20 px-2.5 py-0.5 rounded-md uppercase tracking-widest">
                  <HardHat className="w-2.5 h-2.5" /> {profile.role === 'labour' ? 'Workforce' : 'Admin'}
                </span>
                <span className={`inline-block text-[9px] font-black border px-2.5 py-0.5 rounded-md uppercase tracking-widest ${
                  profile.status === 'Active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  {profile.status}
                </span>
              </div>
            </div>
          </div>
          
          {/* Complete Model Metadata Mappings */}
          <div className="w-full pt-4 border-t border-slate-800/80 text-left space-y-3.5 text-xs text-slate-400">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold flex items-center gap-1.5"><Fingerprint className="w-3.5 h-3.5" /> System Access ID:</span>
              <span className="font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">{profile.identityId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> Mobile Contact:</span>
              <span className="font-bold text-slate-200">{profile.mobile}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Daily Wage Rate:</span>
              <span className="font-black text-orange-400 font-mono">₹{profile.dailyWage || 0}<span className="text-[10px] text-slate-500 font-sans font-bold">/Day</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Identity File:</span>
              <span className="font-mono font-bold text-slate-200">
                {profile.adharNumber ? '[Aadhaar Document Loaded]' : 'Not Uploaded'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Registration Date:</span>
              <span className="font-mono font-bold text-slate-300">{formatDisplayDate(profile.createdAt)}</span>
            </div>

            {/* View document link button */}
            {profile.aadhaarPhoto && (
              <div className="pt-1">
                <a 
                  href={`${baseURL}/${profile.aadhaarPhoto}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Open Card Document
                </a>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMNS: SECURE SECURITY WORKFLOW PIPELINE BOARDS */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="lg:col-span-2 space-y-6"
        >
          <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 shadow-xl rounded-3xl p-5 md:p-6 space-y-4">
            <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2.5 flex items-center gap-2">
              <LockKeyhole className="w-4 h-4 text-slate-500" /> Passkey Configuration Hub
            </h5>
            
            {/* Interactive Navigation Tab Array */}
            <div className="flex border-b border-slate-800 text-[11px] md:text-xs font-bold tracking-wide">
              <button 
                type="button"
                onClick={() => setActiveTab('password')}
                className={`py-2 px-3 sm:px-4 border-b-2 transition-all uppercase tracking-wider flex items-center gap-1.5 ${
                  activeTab === 'password' 
                    ? 'border-orange-500 text-orange-500 font-black' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" /> Passphrase Rotation
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('otp')}
                className={`py-2 px-3 sm:px-4 border-b-2 transition-all uppercase tracking-wider flex items-center gap-1.5 ${
                  activeTab === 'otp' 
                    ? 'border-orange-500 text-orange-500 font-black' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Secure Email OTP
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* TAB CONTENT VIEW A: ROTATION VIA OLD PASSWORD INPUT CHANNELS */}
              {activeTab === 'password' && (
                <motion.form 
                  key="password-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handlePasswordSubmit} 
                  className="space-y-4 pt-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 text-white focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all placeholder:text-slate-700"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Min 6 characters"
                        className="w-full bg-slate-950 border border-slate-800 text-white focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all placeholder:text-slate-700"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 text-white focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all placeholder:text-slate-700"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={actionLoading}
                      className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-[11px] uppercase tracking-wider shadow-lg hover:shadow-orange-500/5 transition-all disabled:opacity-50"
                    >
                      Change Account Password
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* TAB CONTENT VIEW B: EMERGENCY CREDENTIAL OVERRIDE VIA EMAIL DISPATCH SYSTEM */}
              {activeTab === 'otp' && (
                <motion.div 
                  key="otp-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 pt-2"
                >
                  {!otpSent ? (
                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" /> Dispatch Verification Challenge OTP
                        </p>
                        <input 
                          type="email"
                          value={otpData.emailInput}
                          onChange={(e) => setOtpData({ ...otpData, emailInput: e.target.value })}
                          placeholder="Enter your email box address..."
                          className="w-full bg-slate-950 border border-slate-800 text-white focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs outline-none mt-1 transition-all placeholder:text-slate-700"
                        />
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={actionLoading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] uppercase tracking-wider font-black px-4 py-2.5 rounded-xl shadow-md transition-colors self-stretch sm:self-end h-10 flex items-center justify-center disabled:opacity-50"
                      >
                        Send OTP Code
                      </motion.button>
                    </div>
                  ) : (
                    <form onSubmit={handleOtpVerifyAndSubmit} className="space-y-4 border border-dashed border-orange-500/20 p-4 rounded-2xl bg-orange-500/[0.02]">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-orange-400 uppercase tracking-wider pl-0.5 flex items-center gap-1">
                            <LockOpen className="w-3 h-3" /> Enter 6-Digit OTP
                          </label>
                          <input
                            type="text"
                            maxLength="6"
                            value={otpData.otpCode}
                            onChange={(e) => setOtpData({ ...otpData, otpCode: e.target.value })}
                            placeholder="e.g. 840291"
                            className="w-full bg-slate-950 border border-orange-500/30 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-orange-400 outline-none text-center tracking-widest focus:border-orange-500 transition-all placeholder:text-slate-800"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">New Password</label>
                          <input
                            type="password"
                            value={otpData.newPassword}
                            onChange={(e) => setOtpData({ ...otpData, newPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full bg-slate-950 border border-slate-800 text-white focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs outline-none transition-all placeholder:text-slate-700"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Confirm Password</label>
                          <input
                            type="password"
                            value={otpData.confirmPassword}
                            onChange={(e) => setOtpData({ ...otpData, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full bg-slate-950 border border-slate-800 text-white focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs outline-none transition-all placeholder:text-slate-700"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-center pt-1 gap-3 text-xs font-semibold">
                        <button 
                          type="button" 
                          onClick={() => setOtpSent(false)} 
                          className="text-[11px] text-orange-400 hover:text-orange-300 font-bold underline transition-colors self-start sm:self-center"
                        >
                          Change Email / Resend Code
                        </button>
                        
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={actionLoading}
                          className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-[11px] uppercase tracking-wider shadow-lg transition-colors disabled:opacity-50"
                        >
                          Confirm OTP & Save Password
                        </motion.button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}