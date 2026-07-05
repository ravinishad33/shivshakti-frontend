import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
        return 'Profile details saved successfully! 👤';
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
        return 'Password changed successfully! 🔐';
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
        return 'OTP code sent to your email box! 📧';
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
        return 'Password updated securely via OTP! 🔓';
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
    <div className="space-y-8 max-w-6xl mx-auto p-2">
      {/* Profile Page Header */}
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800">Admin Account Profile</h3>
        <p className="text-xs md:text-sm text-slate-500">View your database file parameters, security credentials, and identity documents cleanly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: VISUAL PROFILE CARD WITH ALL MODEL SPECIFICATIONS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-between gap-6 text-center">
          <div className="space-y-4 flex flex-col items-center w-full">
            {/* Display profile picture if available, fallback to gear emoji */}
            {profile.profilePhoto ? (
              <img 
                src={`${baseURL}/${profile.profilePhoto}`} 
                alt="Admin Profile" 
                className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-black shadow-inner">
                🛠️
              </div>
            )}

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900">{profile.name}</h4>
              <div className="flex gap-1.5 justify-center items-center">
                <span className="inline-block text-[9px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  System {profile.role}
                </span>
                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  profile.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {profile.status}
                </span>
              </div>
            </div>
          </div>
          
          {/* Detailed Schema Fields Display */}
          <div className="w-full pt-4 border-t border-slate-100 text-left space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Unique Login ID:</span>
              <span className="font-mono font-bold text-slate-800">{profile.identityId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Mobile Contact:</span>
              <span className="font-bold text-slate-800">{profile.mobile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Aadhaar Number:</span>
              <span className="font-mono font-bold text-slate-800">{profile.adharNumber || 'Not Uploaded'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Onboarding Date:</span>
              <span className="font-mono font-bold text-slate-800">{formatDisplayDate(profile.createdAt)}</span>
            </div>

            {/* View document link button */}
            {profile.aadhaarPhoto && (
              <div className="pt-2">
                <a 
                  href={`${baseURL}/${profile.aadhaarPhoto}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full inline-block text-center bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2 rounded-xl text-[11px] transition-colors"
                >
                  📄 View Aadhaar Card Document File
                </a>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMNS: EDIT PROFILE AND SECURITY ACTION BOARDS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Block A: General Info Editor (Name & Mobile) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Personal Details Configuration</h5>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline"
                >
                  Edit Information
                </button>
              )}
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Full Display Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-75"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Mobile Number Connection</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profile.mobile}
                    onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-75"
                    required
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); fetchAdminProfileDetails(); }}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
                  >
                    Save Information
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Block B: Smart Security Dual-Method Password Engine */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Security Access & Password Change Pipeline</h5>
            
            {/* Methods Selection Tabs */}
            <div className="flex border-b border-slate-100 text-xs font-bold">
              <button 
                type="button"
                onClick={() => setActiveTab('password')}
                className={`py-2 px-4 border-b-2 transition-all ${activeTab === 'password' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                🔄 Method 1: Use Current Password
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('otp')}
                className={`py-2 px-4 border-b-2 transition-all ${activeTab === 'otp' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                📧 Method 2: Use Email OTP Code
              </button>
            </div>

            {/* TAB CONTENT METHOD 1: TRADITIONAL OLD PASSWORD CHANGE ROUTINE */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">New Password Variant</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-sm transition-all"
                  >
                    Change Account Password
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT METHOD 2: MODERN EMAIL OTP KEY DISPATCH OVERRIDE */}
            {activeTab === 'otp' && (
              <div className="space-y-4 pt-2">
                {!otpSent ? (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <p className="text-xs font-bold text-slate-800">Dispatch Dynamic Access Verification OTP</p>
                      <input 
                        type="email"
                        // value={"sfeel414@gmail.com"}
                        value={otpData.emailInput}
                        onChange={(e) => setOtpData({ ...otpData, emailInput: e.target.value })}
                        placeholder="Enter your email address (e.g., admin@construction.com)"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 mt-1"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={actionLoading}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs whitespace-nowrap self-end sm:self-center"
                    >
                      Send OTP Code
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleOtpVerifyAndSubmit} className="space-y-4 border border-dashed border-indigo-200 p-4 rounded-xl bg-indigo-50/20">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1 tracking-wider">Enter 6-Digit OTP</label>
                        <input
                          type="text"
                          maxLength="6"
                          value={otpData.otpCode}
                          onChange={(e) => setOtpData({ ...otpData, otpCode: e.target.value })}
                          placeholder="e.g. 749201"
                          className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-indigo-900 outline-none text-center tracking-widest"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">New Password Variant</label>
                        <input
                          type="password"
                          value={otpData.newPassword}
                          onChange={(e) => setOtpData({ ...otpData, newPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Confirm Password</label>
                        <input
                          type="password"
                          value={otpData.confirmPassword}
                          onChange={(e) => setOtpData({ ...otpData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 gap-4">
                      <button 
                        type="button" 
                        onClick={() => setOtpSent(false)} 
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                      >
                        Change Email Address / Resend
                      </button>
                      
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-sm transition-all"
                      >
                        Confirm OTP & Save Password
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}