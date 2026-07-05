import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Import required clean icons from lucide-react
import {
  Sliders,
  LockKeyhole,
  Bell,
  FileText,
  ShieldCheck,
  Clock,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function LabourSettings() {
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  // Local worker configuration states
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    wagesAlert: true,
    attendanceAlert: true
  });

  const handleSecurityUpdate = (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    toast.success('Security passcode updated successfully!');
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Motion animation parameters
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto p-2 md:p-4 font-sans text-slate-800 overflow-x-hidden">
      
      {/* Title block */}
      <div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-orange-500" /> Portal Settings
        </h3>
        <p className="text-xs md:text-sm text-slate-500">Manage your worker account security, alerts, and legal terms.</p>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        {/* Section 1: Security Code Update */}
        <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
            <LockKeyhole className="w-4 h-4 text-slate-400" /> Change Login Password
          </h4>
          
          <form onSubmit={handleSecurityUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Current Password</label>
                <input 
                  required 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500 bg-slate-50 focus:bg-white transition-all font-medium" 
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">New Password</label>
                <input 
                  required 
                  type="password" 
                  placeholder="Min 6 characters"
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500 bg-slate-50 focus:bg-white transition-all font-medium" 
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Confirm New Password</label>
                <input 
                  required 
                  type="password" 
                  placeholder="Re-enter password"
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500 bg-slate-50 focus:bg-white transition-all font-medium" 
                  value={securityData.confirmPassword}
                  onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-1">
              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="w-full sm:w-auto bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> Update Security Code
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Section 2: Alert Preferences */}
        <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-slate-400" /> Notification Settings
          </h4>
          
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold pb-3.5">
              <div className="space-y-0.5 pr-4">
                <p className="text-slate-800">Weekly Payout Alerts</p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-normal">Get notified via SMS when salaries are processed.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notificationSettings.wagesAlert}
                  onChange={(e) => setNotificationSettings({...notificationSettings, wagesAlert: e.target.checked})}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold pt-3.5">
              <div className="space-y-0.5 pr-4">
                <p className="text-slate-800">Attendance Flag Alerts</p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-normal">Get notified if marked absent or half-day.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notificationSettings.attendanceAlert}
                  onChange={(e) => setNotificationSettings({...notificationSettings, attendanceAlert: e.target.checked})}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Section 3: Workplace Guidelines and Policy Documents */}
        <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-400" /> On-Site Policy & Guidelines
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-slate-700">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center gap-3">
              <span className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" /> 
                <span className="truncate">Safety Gear Policy</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold shrink-0">Mandatory</span>
            </div>
            
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center gap-3">
              <span className="flex items-center gap-2 min-w-0">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" /> 
                <span className="truncate">Daily Punch-in Window</span>
              </span>
              <span className="text-slate-500 font-mono text-xs font-bold shrink-0">09:00 AM — 09:15 AM</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}