import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

// Import required clean SVG icons from lucide-react
import {
  HardHat,
  Fingerprint,
  Activity,
  MapPin,
  Smartphone,
  CreditCard,
  LineChart,
  Banknote,
  CalendarDays,
  UserCheck,
  AlertTriangle,
  XCircle,
  History
} from 'lucide-react';

export default function LabourDashboard() {
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  // Core dynamic user data states matching your system metrics
  const [workerData, setWorkerData] = useState({
    _id: '',
    name: '',
    role: '',
    identityId: '',
    mobile: '',
    dailyWage: 0,
    status: 'Active',
    adharNumber: '',
    profilePhoto: '',
    activeSite: 'Assigning Construction Yard...',
    createdAt: ''
  });

  const [metrics, setMetrics] = useState({
    totalDaysPresent: 0,
    totalHalfDays: 0,
    totalDaysAbsent: 0,
    advanceTaken: 0,
    grossEarned: 0,
    netPayable: 0
  });

  const [attendanceLog, setAttendanceLog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic date utility transforming timestamp indices to strict dd:mm:yy formatting
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}:${month}:${year}`;
  };

  // Initial Load Pipeline: Pull live worker parameters and summary reports concurrently
  const fetchLabourDashboardContext = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      // Pull authenticated profile context details
      const profileRes = await axios.get(`${baseURL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userDoc = profileRes.data;
      setWorkerData({
        _id: userDoc._id || '',
        name: userDoc.name || 'Worker Account',
        role: userDoc.role === 'labour' ? 'Labour Personnel' : 'Admin Control',
        identityId: userDoc.identityId || 'N/A',
        mobile: userDoc.mobile || 'N/A',
        dailyWage: userDoc.dailyWage || 0,
        status: userDoc.status || 'Active',
        adharNumber: userDoc.adharNumber || 'Not Linked',
        profilePhoto: userDoc.profilePhoto || '',
        activeSite: userDoc.siteName || 'Unassigned Workspace Site',
        createdAt: userDoc.createdAt || ''
      });

      // Fetch summary statistics metrics
      const metricsRes = await axios.get(`${baseURL}/api/attendance/my-dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (metricsRes.data) {
        setMetrics({
          totalDaysPresent: metricsRes.data.presentCount || 0,
          totalHalfDays: metricsRes.data.halfDayCount || 0,
          totalDaysAbsent: metricsRes.data.absentCount || 0,
          advanceTaken: metricsRes.data.advanceTaken || 0,
          grossEarned: metricsRes.data.grossEarned || 0,
          netPayable: metricsRes.data.netPayable || 0
        });
        setAttendanceLog(metricsRes.data.recentLogs || []);
      }

    } catch (error) {
      console.error("Labour dashboard sync error:", error);
      toast.error("Failed to load your daily attendance profile parameters.");
    } 
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabourDashboardContext();
  }, []);

  // Motion scaling constants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500 font-bold text-xs tracking-wider gap-3">
        <svg className="animate-spin h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>SYNCHRONIZING PERSONAL TRACKER METRICS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-2 md:p-4 select-none font-sans overflow-x-hidden">
      
      {/* 👤 MODULE HEADER PANEL WIDGET */}
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-5 md:p-6 text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        {workerData.profilePhoto ? (
          <img 
            src={`${baseURL}/${workerData.profilePhoto}`} 
            alt="Profile Avatar" 
            className="w-20 h-20 rounded-2xl object-cover border border-slate-800 shadow-md bg-slate-900 shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shadow-inner shrink-0">
            <HardHat className="w-8 h-8 text-slate-500" />
          </div>
        )}

        <div className="space-y-2.5 flex-1 w-full min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1 text-[9px] bg-orange-500 text-white font-black px-2.5 py-0.5 rounded-md uppercase tracking-widest">
              <HardHat className="w-2.5 h-2.5" /> {workerData.role}
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded-md">
              <Fingerprint className="w-2.5 h-2.5" /> ID: {workerData.identityId}
            </span>
            <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
              workerData.status === 'Active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              <Activity className="w-2.5 h-2.5" /> {workerData.status}
            </span>
          </div>
          
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white truncate">Namaste, {workerData.name} 👋</h2>
          
          {/* Detailed Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-slate-400 font-semibold">
            <p className="flex items-center justify-center sm:justify-start gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">Yard: <span className="text-orange-400 font-bold">{workerData.activeSite}</span></span>
            </p>
            <p className="flex items-center justify-center sm:justify-start gap-1.5 min-w-0">
              <Smartphone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">Contact: <span className="text-slate-200 font-mono">{workerData.mobile}</span></span>
            </p>
            <p className="flex items-center justify-center sm:justify-start gap-1.5 min-w-0">
              <CreditCard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">Identity: <span className="text-slate-200 font-mono">
                {workerData.adharNumber && workerData.adharNumber !== 'Not Linked' ? '[Aadhaar Verified]' : 'Not Linked'}
              </span></span>
            </p>
          </div>
        </div>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        
        {/* 💰 FINANCIAL SUMMATION MATRIX */}
        <motion.div variants={itemVariants} className="md:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-slate-400" /> Monthly Balance Overview
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100/80 transition-colors hover:bg-slate-100/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base Wage Rate</p>
                <p className="text-base md:text-lg font-black text-slate-900 mt-0.5 font-mono">₹{workerData.dailyWage}<span className="text-[10px] text-slate-400 font-bold font-sans">/Day</span></p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100/80 transition-colors hover:bg-slate-100/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Matrix</p>
                <p className="text-base md:text-lg font-black text-slate-900 mt-0.5 font-mono">
                  {metrics.totalDaysPresent + metrics.totalHalfDays}<span className="text-[10px] text-slate-400 font-bold font-sans"> Days</span>
                </p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100/80 transition-colors hover:bg-slate-100/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Total Earned</p>
                <p className="text-base md:text-lg font-black text-slate-800 mt-0.5 font-mono">₹{metrics.grossEarned.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100/60 transition-colors hover:bg-rose-100/50">
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Advance Deductions</p>
                <p className="text-base md:text-lg font-black text-rose-600 mt-0.5 font-mono">-₹{metrics.advanceTaken.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* NET Payout Summary Box */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-4 text-center shadow-md shadow-emerald-600/10 mt-4">
            <p className="text-[10px] md:text-xs font-bold text-emerald-100 uppercase tracking-widest">Estimated Net Balance Payable</p>
            <p className="text-2xl md:text-3xl font-black mt-1 tracking-tight font-mono">₹{metrics.netPayable.toLocaleString('en-IN')}</p>
          </div>
        </motion.div>

        {/* 📊 ATTENDANCE BREAKDOWN RULES SUMMARY */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <LineChart className="w-4 h-4 text-slate-400" /> Metrics Breakdown
            </h3>

            <div className="space-y-3.5 py-1">
              {/* Present Tracker */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Full Present</span>
                  <span className="font-mono font-bold text-slate-900">{metrics.totalDaysPresent} Days</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((metrics.totalDaysPresent / 30) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Half Day Tracker */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Half-Days</span>
                  <span className="font-mono font-bold text-slate-900">{metrics.totalHalfDays} Days</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((metrics.totalHalfDays / 30) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Absent Tracker */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>Absences</span>
                  <span className="font-mono font-bold text-slate-900">{metrics.totalDaysAbsent} Days</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((metrics.totalDaysAbsent / 30) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] font-bold text-slate-400 text-center tracking-wide uppercase font-mono">
            Registered: {formatDisplayDate(workerData.createdAt)}
          </div>
        </motion.div>
      </motion.div>

      {/* 📅 RECENT ATTENDANCE STATUS TIMELINE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-slate-400" /> Recent Attendance Calendar Timeline
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Displays verification markers logged by the supervisor for the current workflow period.</p>
        </div>
        
        <div className="flex flex-wrap gap-2.5 pt-1.5">
          {attendanceLog.length === 0 ? (
            <div className="w-full text-center py-8 text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded-2xl">
              No recent attendance logs recorded for this account cycle.
            </div>
          ) : (
            attendanceLog.map((log, idx) => (
              <div 
                key={idx} 
                className={`w-11 h-14 rounded-2xl flex flex-col items-center justify-center border font-bold shadow-xs transition-transform hover:scale-105 ${
                  log.status === 'Present' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  log.status === 'Half-Day' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                <span className="text-[9px] text-slate-400 font-bold font-mono">
                  {log.date ? log.date.split('-')[2] : `D-${idx + 1}`}
                </span>
                <span className="text-sm font-black mt-0.5">
                  {log.status === 'Present' ? 'P' : log.status === 'Half-Day' ? 'H' : 'A'}
                </span>
              </div>
            ))
          )}
        </div>
        
        {/* Status Indicator Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 items-center text-[10px] font-black text-slate-400 pt-3.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-emerald-500" /> P: PRESENT (FULL WAGE)</div>
          <div className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> H: HALF-DAY (50% BASE WAGE)</div>
          <div className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-rose-500" /> A: ABSENT (NO ACCRUED EARNINGS)</div>
        </div>
      </div>
    </div>
  );
}