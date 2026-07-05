import React, { useState } from 'react';

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
      alert('⚠️ New passwords do not match!');
      return;
    }
    alert('✅ Security passcode updated successfully!');
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Title block */}
      <div>
        <h3 className="text-xl font-bold text-slate-900">Portal Settings</h3>
        <p className="text-xs text-slate-500">Manage your worker account security, alerts, and legal terms.</p>
      </div>

      {/* Section 1: Security Code Update */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
          🔒 Change Login Password
        </h4>
        <form onSubmit={handleSecurityUpdate} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Current Password</label>
            <input 
              required 
              type="password" 
              placeholder="••••••••"
              className="w-full border border-slate-200 p-2 rounded-xl text-xs outline-none focus:border-orange-500" 
              value={securityData.currentPassword}
              onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">New Password</label>
            <input 
              required 
              type="password" 
              placeholder="Min 6 characters"
              className="w-full border border-slate-200 p-2 rounded-xl text-xs outline-none focus:border-orange-500" 
              value={securityData.newPassword}
              onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Confirm New Password</label>
            <input 
              required 
              type="password" 
              placeholder="Re-enter password"
              className="w-full border border-slate-200 p-2 rounded-xl text-xs outline-none focus:border-orange-500" 
              value={securityData.confirmPassword}
              onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            Update Security Code
          </button>
        </form>
      </div>

      {/* Section 2: Alert Preferences */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
          🔔 Notification Settings
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div>
              <p className="text-slate-800">Weekly Payout Alerts</p>
              <p className="text-[10px] text-slate-400 font-medium">Get notified via SMS when salaries are processed.</p>
            </div>
            <input 
              type="checkbox" 
              className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
              checked={notificationSettings.wagesAlert}
              onChange={(e) => setNotificationSettings({...notificationSettings, wagesAlert: e.target.checked})}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-semibold pt-1">
            <div>
              <p className="text-slate-800">Attendance Flag Alerts</p>
              <p className="text-[10px] text-slate-400 font-medium">Get notified if marked absent or half-day.</p>
            </div>
            <input 
              type="checkbox" 
              className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
              checked={notificationSettings.attendanceAlert}
              onChange={(e) => setNotificationSettings({...notificationSettings, attendanceAlert: e.target.checked})}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Workplace Guidelines and Policy Documents */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
          📋 On-Site Policy & Guidelines
        </h4>
        <div className="space-y-1.5 text-xs font-medium text-slate-600">
          <div className="p-2 bg-slate-50 rounded-lg flex justify-between items-center">
            <span>👷 Safety Gear Policy</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Mandatory</span>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg flex justify-between items-center">
            <span>⏰ Daily Punch-in Window</span>
            <span className="text-slate-500 font-mono text-[11px]">09:00 AM — 09:15 AM</span>
          </div>
        </div>
      </div>
    </div>
  );
}