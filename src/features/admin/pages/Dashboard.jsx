import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

// Import professional SVG icons from lucide-react
import { 
  FolderOpen, 
  HardHat, 
  CheckCircle2, 
  BookOpen, 
  Building2, 
  CalendarCheck2, 
  CircleDollarSign, 
  Coins,
  MapPin,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

export default function Dashboard() {
  const baseURL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  // Core Analytics States
  const [stats, setSummaryStats] = useState({
    totalRegistered: 0,
    activeWorkers: 0,
    todayPresent: 0,
    cashBalance: '₹0',
    payrollPool: '₹0'
  });
  
  const [siteDistribution, setSiteDistribution] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: Format integers into clean Indian Rupee Currency Layouts
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Helper: Get today's localized date matching backend format (dd:mm:yy)
  const getTodayBackendString = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    return `${day}:${month}:${year}`; 
  };

  useEffect(() => {
    const fetchDashboardAggregatedAnalytics = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Session clearance dropped. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const todayStr = getTodayBackendString();

        // 🚀 1. Fetch all structural data pools concurrently
        const [workersRes, cashbookRes, sitesRes] = await Promise.all([
          axios.get(`${baseURL}/api/auth/workers`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${baseURL}/api/cashbook`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${baseURL}/api/sites`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const workerData = workersRes.data || [];
        const cashbookData = cashbookRes.data || { netAvailableBalance: 0, ledgerHistory: [] };
        const siteData = sitesRes.data || [];

        // 🚀 2. Tally Workforce status breakdowns
        const totalRegistered = workerData.length;
        const activeWorkers = workerData.filter(w => w.status === 'Active').length;

        // 🚀 3. Query attendance logs for all sites to compute today's present totals & site distributions
        let totalTodayPresent = 0;
        const computedDistributions = [];

        // Loop through each site to count active operational deployments
        await Promise.all(siteData.map(async (site) => {
          let sitePresentCount = 0;
          try {
            const attendanceRes = await axios.get(`${baseURL}/api/attendance/summary`, {
              params: { date: todayStr, siteId: site._id },
              headers: { Authorization: `Bearer ${token}` }
            });

            const siteRecords = attendanceRes.data?.records || [];
            const present = siteRecords.filter(r => r.status === 'Present' || r.status === 'Half-Day').length;
            
            sitePresentCount = present;
            totalTodayPresent += present;
          } catch (err) {
            // No logs saved for this site today yet
          }

          computedDistributions.push({
            _id: site._id,
            name: site.name,
            location: site.location,
            count: sitePresentCount
          });
        }));

        setSiteDistribution(computedDistributions);

        // 4. Calculate Payroll Estimate metrics (Active Daily Wages Tally across 26 days)
        let totalMonthlyPayrollEstimate = 0;
        workerData.forEach(w => {
          if (w.status === 'Active') {
            totalMonthlyPayrollEstimate += (w.dailyWage || 400) * 26;
          }
        });

        // 5. Generate automated recent activity logs stream
        const rawHistory = cashbookData.ledgerHistory || [];
        const dynamicallyCompiledLogs = [];
        
        rawHistory.slice(0, 2).forEach((item, index) => {
          dynamicallyCompiledLogs.push({
            id: `cash-${index}`,
            text: `Cashbook: Logged ${formatCurrency(item.amount)} ${item.type === 'Income' ? 'Inflow from' : 'Outflow for'} "${item.description}"`,
            time: item.date || 'Recent',
            tag: item.type,
            icon: <CircleDollarSign className="w-3.5 h-3.5 text-emerald-500" />
          });
        });

        if (workerData.length > 0) {
          const newestWorker = workerData[workerData.length - 1];
          dynamicallyCompiledLogs.push({
            id: 'worker-latest',
            text: `Workforce: ${newestWorker.name} onboarded under ID [${newestWorker.identityId}]`,
            time: 'Recent',
            tag: 'Workforce',
            icon: <HardHat className="w-3.5 h-3.5 text-orange-500" />
          });
        }

        // 6. Set calculated states safely to view layers
        setSummaryStats({
          totalRegistered,
          activeWorkers,
          todayPresent: totalTodayPresent,
          cashBalance: formatCurrency(cashbookData.netAvailableBalance || 0),
          payrollPool: formatCurrency(totalMonthlyPayrollEstimate)
        });

        setRecentLogs(dynamicallyCompiledLogs.slice(0, 3));

      } catch (error) {
        console.error("Dashboard engine compilation error:", error);
        toast.error("Error refreshing dynamic system metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardAggregatedAnalytics();
  }, []);

  const metrics = [
    { 
      title: 'Total Registered', 
      value: stats.totalRegistered, 
      detail: 'Profiles in Database',
      icon: <FolderOpen className="w-5 h-5" />, color: 'text-slate-600', bg: 'bg-slate-100',
      path: '/admin/labour'
    },
    { 
      title: 'Active Workforce', 
      value: stats.activeWorkers, 
      detail: 'Marked "Active" in System',
      icon: <HardHat className="w-5 h-5" />, color: 'text-orange-600', bg: 'bg-orange-100',
      path: '/admin/labour'
    },
    { 
      title: 'Present Today', 
      value: stats.todayPresent, 
      detail: `Marked Present / Half-Day`,
      icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-100',
      path: '/admin/attendance'
    },
    { 
      title: 'Cash Balance', 
      value: stats.cashBalance, 
      detail: 'Live Net Operational Capital',
      icon: <BookOpen className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-100',
      path: '/admin/cashbook'
    },
  ];

  // Motion Configuration Presets
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 110, damping: 15 } }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium text-sm">
        Compiling dynamic operational dashboard intelligence...
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2 max-w-7xl mx-auto overflow-x-hidden font-sans">
      
      {/* Title Header area */}
      <div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Shivshakti Construction Dashboard</h3>
        <p className="text-xs md:text-sm text-slate-500">Central command station for live project site metrics, active deployment roster counts, and cashbook analytics.</p>
      </div>

      {/* Dynamic Summary Cards Row */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {metrics.map((metric, idx) => (
          <motion.div 
            variants={itemVariants}
            key={idx} 
            onClick={() => navigate(metric.path)}
            className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-orange-400 hover:shadow-md transition-all duration-200 group"
          >
            <div className="space-y-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{metric.title}</p>
              <h4 className="text-xl md:text-2xl font-black text-slate-900">{metric.value}</h4>
              <p className="text-xs text-slate-500 font-medium truncate">{metric.detail}</p>
            </div>
            <div className={`p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${metric.bg} ${metric.color}`}>
              {metric.icon}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Structural Breakdown Block Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 🏗️ LEFT/CENTER COLUMNS: Site Specific Worker Deployment Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 lg:col-span-2 space-y-4"
        >
          <div className="flex justify-between items-center gap-2">
            <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" /> Site-Specific Active Deployments
            </h4>
            <button onClick={() => navigate('/admin/sites')} className="text-xs text-orange-500 hover:text-orange-600 font-bold shrink-0 flex items-center gap-1 group/btn">
              Manage Sites <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {siteDistribution.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No infrastructure sites registered yet.</p>
            ) : (
              siteDistribution.map((site) => (
                <div key={site._id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center gap-4 hover:border-slate-200 transition-colors">
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{site.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {site.location}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg sm:text-xl font-black text-slate-900 block leading-none">{site.count}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Present</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Ledger History Inner Container */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h5 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-500" /> Recent Project Activity Logs
            </h5>
            <div className="divide-y divide-slate-100">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex justify-between items-start py-2.5 last:pb-0 gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 shrink-0">{log.icon}</div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 leading-normal break-words">{log.text}</p>
                      <span className="inline-block text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-wide">{log.tag}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Action Tasks Shortcuts Link Board */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">Administrative Tasks</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Quickly jump directly to primary tasks to run field updates or review automated accounts.</p>
            
            <div className="space-y-2">
              {[
                { label: 'Sites: Manage Infrastructure Registry', path: '/admin/sites', icon: <Building2 className="w-4 h-4 text-slate-500" /> },
                { label: 'Muster: Log Daily Site Attendance', path: '/admin/attendance', icon: <CalendarCheck2 className="w-4 h-4 text-slate-500" /> },
                { label: 'Expense: Record Outflow Transaction', path: '/admin/cashbook', icon: <CircleDollarSign className="w-4 h-4 text-slate-500" /> },
                { label: 'Payroll: Process Outflows & Receipts', path: '/admin/salary', icon: <Coins className="w-4 h-4 text-slate-500" /> }
              ].map((task, idx) => (
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  key={idx}
                  onClick={() => navigate(task.path)}
                  className="w-full text-left text-xs sm:text-sm font-bold text-slate-700 p-3.5 rounded-xl bg-slate-50 hover:bg-orange-50/60 hover:text-orange-600 border border-slate-100 hover:border-orange-200/40 transition-all duration-150 flex items-center gap-2.5 group"
                >
                  <div className="shrink-0 transition-colors group-hover:text-orange-500">{task.icon}</div>
                  <span className="truncate">{task.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Shivshakti Systems Core • 2026
          </div>
        </motion.div>

      </div>
    </div>
  );
}