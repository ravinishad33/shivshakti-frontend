import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

// Import sleek vector icons from lucide-react
import {
  User,
  ShieldCheck,
  Phone,
  Fingerprint,
  CalendarDays,
  FileText,
  KeyRound,
  Mail,
  UserPen ,
  LockKeyhole,
  LockOpen
} from 'lucide-react';

export default function AdminProfile() {
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  // Core Profile Data matching your exact User Schema parameters
  const [profile, setProfile] = useState({
    _id: '',
    name: '',
    mobile: '',
    identityId: '',
    role: 'admin',
    status: 'Active',
    adharNumber: '',
    aadhaarPhoto: '',
    profilePhoto: '',
    createdAt: ''
  });

  // Method 1 States: Change password using old password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Method 2 States: Change password using Email OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otpData, setOtpData] = useState({
    emailInput: 'sfeel414@gmail.com', // Admin types their verification node
    otpCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [activeTab, setActiveTab] = useState('password'); // Switches between 'password' and 'otp'
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Simple date formatter (dd:mm:yy)
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}:${month}:${year}`;
  };

  const fetchAdminProfileDetails = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${baseURL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your admin profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfileDetails();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const token = localStorage.getItem('token');

    const updatePromise = axios.put(`${baseURL}/api/auth/profile`, {
      name: profile.name,
      mobile: profile.mobile
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.promise(updatePromise, {
      loading: 'Saving profile details...',
      success: () => {
        setIsEditing(false);
        setActionLoading(false);
        return 'Profile details saved successfully!';
      },
      error: (err) => {
        setActionLoading(false);
        return err.response?.data?.message || 'Failed to update profile details.';
      }
    });
  };

  // METHOD 1: Traditional Password Rotation
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match.");
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
      loading: 'Changing password keys...',
      success: () => {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setActionLoading(false);
        return 'Password changed successfully!';
      },
      error: (err) => {
        setActionLoading(false);
        return err.response?.data?.message || 'Failed to verify current password.';
      }
    });
  };

  // METHOD 2: Request OTP via email address
  const handleRequestOtp = async () => {
    if (!otpData.emailInput) {
      toast.error("Please provide your email address first.");
      return;
    }
    setActionLoading(true);
    const token = localStorage.getItem('token');
    
    const otpPromise = axios.post(`${baseURL}/api/auth/profile/request-otp`, {
      email: otpData.emailInput
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.promise(otpPromise, {
      loading: `Sending verification code to ${otpData.emailInput}...`,
      success: () => {
        setOtpSent(true);
        setActionLoading(false);
        return 'OTP code sent to your email box!';
      },
      error: (err) => {
        setActionLoading(false);
        return err.response?.data?.message || 'Failed to send OTP code.';
      }
    });
  };

  // METHOD 2: Confirm OTP and Override Password
  const handleOtpVerifyAndSubmit = async (e) => {
    e.preventDefault();
    if (otpData.newPassword !== otpData.confirmPassword) {
      toast.error("Passwords do not match.");
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
      loading: 'Verifying OTP authenticity code...',
      success: () => {
        setOtpData({ emailInput: '', otpCode: '', newPassword: '', confirmPassword: '' });
        setOtpSent(false);
        setActionLoading(false);
        return 'Password updated securely via OTP!';
      },
      error: (err) => {
        setActionLoading(false);
        return err.response?.data?.message || 'Invalid or expired OTP code entry.';
      }
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium text-sm">
        Loading admin profile details...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-2 overflow-x-hidden">
      
      {/* Profile Page Header */}
      <div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Admin Account Profile</h3>
        <p className="text-xs md:text-sm text-slate-500">View your database file parameters, security credentials, and identity documents cleanly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: VISUAL PROFILE CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-between gap-6 text-center h-fit">
          <div className="space-y-4 flex flex-col items-center w-full">
            {profile.profilePhoto ? (
              <img 
                src={`${baseURL}/${profile.profilePhoto}`} 
                alt="Admin Profile" 
                className="w-24 h-24 rounded-full object-cover border-2 border-slate-100 shadow-md animate-fadeIn"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-950 text-slate-300 flex items-center justify-center border border-slate-800 shadow-inner">
                <User className="w-8 h-8" />
              </div>
            )}

            <div className="space-y-1.5">
              <h4 className="text-lg font-black text-slate-900 tracking-tight">{profile.name}</h4>
              <div className="flex gap-1.5 justify-center items-center">
                <span className="inline-flex items-center gap-1 text-[9px] bg-slate-900 text-white font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <ShieldCheck className="w-2.5 h-2.5" /> {profile.role}
                </span>
                <span className={`inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  profile.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {profile.status}
                </span>
              </div>
            </div>
          </div>
          
          {/* Detailed Schema Fields Display */}
          <div className="w-full pt-4 border-t border-slate-100 text-left space-y-3.5 text-xs text-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5"><Fingerprint className="w-3.5 h-3.5 text-slate-400" /> Unique Login ID:</span>
              <span className="font-mono font-bold text-slate-900 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-[11px]">{profile.identityId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile Contact:</span>
              <span className="font-bold text-slate-900">{profile.mobile}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-slate-400" /> Identity ID Number:</span>
              <span className="font-mono font-bold text-slate-900">{profile.adharNumber || 'Not Uploaded'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-slate-400" /> Onboarding Date:</span>
              <span className="font-mono font-bold text-slate-900">{formatDisplayDate(profile.createdAt)}</span>
            </div>

            {/* View document link button */}
            {profile.aadhaarPhoto && (
              <div className="pt-1">
                <a 
                  href={`${baseURL}/${profile.aadhaarPhoto}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-[11px] transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> View Identity Document File
                </a>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMNS: CONFIGURATION TILES */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Block A: General Info Editor */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserPen  className="w-4 h-4 text-slate-400" /> Personal Details Configuration
              </h5>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-orange-500 hover:text-orange-600 font-bold underline transition-colors"
                >
                  Edit Information
                </button>
              )}
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Full Display Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-75 focus:bg-white transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Mobile Number Connection</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profile.mobile}
                    onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-75 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {isEditing && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="flex justify-end gap-2 pt-1"
                >
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); fetchAdminProfileDetails(); }}
                    className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Save Information
                  </button>
                </motion.div>
              )}
            </form>
          </div>

          {/* Block B: Smart Security Dual-Method Password Engine */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h5 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <LockKeyhole className="w-4 h-4 text-slate-400" /> Security Access Pipeline
            </h5>
            
            {/* Methods Selection Tabs */}
            <div className="flex border-b border-slate-100 text-[11px] sm:text-xs font-bold">
              <button 
                type="button"
                onClick={() => setActiveTab('password')}
                className={`py-2 px-3 sm:px-4 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'password' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                <KeyRound className="w-3.5 h-3.5" /> Passphrase Rotation
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('otp')}
                className={`py-2 px-3 sm:px-4 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'otp' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                <Mail className="w-3.5 h-3.5" /> Email Verification OTP
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* CONTENT METHOD 1: TRADITIONAL KEY ROTATION */}
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
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Min 6 characters"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={actionLoading}
                      className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition-colors"
                    >
                      Update Account Passphrase
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* CONTENT METHOD 2: MODERN EMAIL OTP DISPATCH */}
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
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> Dispatch Dynamic Access Verification OTP
                        </p>
                        <input 
                          type="email"
                          value={otpData.emailInput}
                          onChange={(e) => setOtpData({ ...otpData, emailInput: e.target.value })}
                          placeholder="Enter your email address"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-orange-500 mt-1 transition-all"
                        />
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={actionLoading}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs whitespace-nowrap self-stretch sm:self-end h-10 flex items-center justify-center transition-colors"
                      >
                        Send OTP Code
                      </motion.button>
                    </div>
                  ) : (
                    <form onSubmit={handleOtpVerifyAndSubmit} className="space-y-4 border border-dashed border-orange-200 p-4 rounded-xl bg-orange-50/10">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-orange-600 uppercase mb-1.5 tracking-wider flex items-center gap-1">
                            <LockOpen className="w-3 h-3" /> Enter 6-Digit OTP
                          </label>
                          <input
                            type="text"
                            maxLength="6"
                            value={otpData.otpCode}
                            onChange={(e) => setOtpData({ ...otpData, otpCode: e.target.value })}
                            placeholder="e.g. 749201"
                            className="w-full bg-white border border-orange-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-orange-700 outline-none text-center tracking-widest focus:border-orange-500 transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">New Password</label>
                          <input
                            type="password"
                            value={otpData.newPassword}
                            onChange={(e) => setOtpData({ ...otpData, newPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-orange-500 transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Confirm Password</label>
                          <input
                            type="password"
                            value={otpData.confirmPassword}
                            onChange={(e) => setOtpData({ ...otpData, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-orange-500 transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-center pt-1 gap-3">
                        <button 
                          type="button" 
                          onClick={() => setOtpSent(false)} 
                          className="text-xs font-bold text-orange-500 hover:text-orange-600 underline transition-colors self-start sm:self-center"
                        >
                          Change Email Address / Resend
                        </button>
                        
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={actionLoading}
                          className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition-colors"
                        >
                          Confirm OTP & Save Password
                        </motion.button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}