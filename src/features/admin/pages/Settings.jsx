import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

// Import crisp responsive icons from lucide-react
import {
  Sliders,
  Building2,
  MapPin,
  Clock,
  Percent,
  IndianRupee,
  Utensils,
  CloudSync,
  Plus,
  Save,
  MapPinHouse
} from 'lucide-react';

export default function Settings() {
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  // Global Operational Configurations State
  const [siteConfig, setSiteConfig] = useState({
    companyName: '',
    primaryLocation: '',
    defaultGracePeriod: '', 
    overtimeRateMultiplier: '', 
    autoBackup: true,
    currencySymbol: '₹',
    baseLabourWage: '',
    baseHelperWage: '',
    dailyFoodAllowance: ''
  });

  // Local Project Sites Directory List from Database
  const [activeSites, setActiveSites] = useState([]);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteLocation, setNewSiteLocation] = useState('');

  // UI Processing Loaders
  const [pageLoading, setPageLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // 1. Initial Load: Fetch global settings configurations and sites directory concurrently
  const fetchConfigurationData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [settingsRes, sitesRes] = await Promise.all([
        axios.get(`${baseURL}/api/settings`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseURL}/api/sites`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (settingsRes.data) {
        setSiteConfig(settingsRes.data);
      }
      setActiveSites(sitesRes.data || []);
    } catch (error) {
      console.error("Settings load error:", error);
      toast.error("Failed to sync system configurations.");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigurationData();
  }, []);

  const handleConfigChange = (key, value) => {
    setSiteConfig(prev => ({ ...prev, [key]: value }));
  };

  // 2. Action: Create a new Site inside the database collection
  const handleAddSite = async (e) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteLocation.trim()) {
      toast.error("Please provide both site name and location details.");
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${baseURL}/api/sites`, {
        name: newSiteName,
        location: newSiteLocation,
        status: 'Active'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("New site directory entry created! 🏗️");
      setActiveSites(prev => [...prev, response.data]);
      setNewSiteName('');
      setNewSiteLocation('');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create new operational site.");
    }
  };

  // 3. Action: Save Global Parameters and Base Wage Metrics
  const handleSaveAllSettings = async () => {
    setSaveLoading(true);
    const token = localStorage.getItem('token');

    try {
      await axios.put(`${baseURL}/api/settings`, siteConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Global operational specifications synchronized! ⚙️');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to commit profile updates.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Stagger entry variables
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
      <div className="p-8 text-center text-slate-500 font-medium text-sm">
        Loading system control configuration matrices...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-2 font-sans overflow-x-hidden">
      
      {/* Page Title Section */}
      <div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-orange-500" /> Control & Configuration Panel
        </h3>
        <p className="text-xs md:text-sm text-slate-500">Configure global parameters, site locations, attendance rules, and default wage multipliers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Core settings forms */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="lg:col-span-2 space-y-6"
        >
          
          {/* Section 1: General Profile Rules */}
          <motion.div variants={itemVariants} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" /> Firm Profile & Metadata
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Company Legal Entity Title</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500 font-bold text-slate-800 bg-slate-50/50 focus:bg-white transition-all" 
                  value={siteConfig.companyName}
                  onChange={(e) => handleConfigChange('companyName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Central Corporate Location</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500 font-bold text-slate-800 bg-slate-50/50 focus:bg-white transition-all" 
                  value={siteConfig.primaryLocation}
                  onChange={(e) => handleConfigChange('primaryLocation', e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* Section 2: Attendance & Payroll Automation Engines Rules */}
          <motion.div variants={itemVariants} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Attendance & Payroll Logic Rules
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Morning Grace Window (Mins)</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500 font-bold text-slate-800 bg-slate-50/50 focus:bg-white transition-all" 
                  value={siteConfig.defaultGracePeriod}
                  onChange={(e) => handleConfigChange('defaultGracePeriod', e.target.value)}
                />
                <span className="text-[10px] text-slate-400 font-medium block mt-1.5 leading-relaxed">Late arrivals past this marker flag on the attendance log automatically.</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Overtime Multiplier Rate</label>
                <div className="relative flex items-center">
                  <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <select 
                    className="w-full border border-slate-200 p-2.5 pl-9 rounded-xl text-xs sm:text-sm bg-slate-50/50 focus:bg-white outline-none focus:border-orange-500 font-bold text-slate-700 cursor-pointer appearance-none transition-all"
                    value={siteConfig.overtimeRateMultiplier}
                    onChange={(e) => handleConfigChange('overtimeRateMultiplier', e.target.value)}
                  >
                    <option value="1">1.0x (Regular Hourly Rate)</option>
                    <option value="1.25">1.25x Hourly Base</option>
                    <option value="1.5">1.5x (Industry Standard)</option>
                    <option value="2">2.0x Double-Time Pay</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 3: Global Base Wages & Allowances */}
          <motion.div variants={itemVariants} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wider flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-slate-400" /> Global Base Wages & Allowances
            </h4>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">These defaults automatically apply when creating new workforce roster items.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Skilled Wage (₹/Day)</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500 font-black text-slate-800 bg-slate-50/50 focus:bg-white transition-all" 
                  value={siteConfig.baseLabourWage}
                  onChange={(e) => handleConfigChange('baseLabourWage', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Helper Wage (₹/Day)</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500 font-black text-slate-800 bg-slate-50/50 focus:bg-white transition-all" 
                  value={siteConfig.baseHelperWage}
                  onChange={(e) => handleConfigChange('baseHelperWage', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Daily Mess Pay (₹/Day)</label>
                <div className="relative flex items-center">
                  <Utensils className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input 
                    type="number" 
                    className="w-full border border-slate-200 p-2.5 pl-9 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500 font-black text-slate-800 bg-slate-50/50 focus:bg-white transition-all" 
                    value={siteConfig.dailyFoodAllowance}
                    onChange={(e) => handleConfigChange('dailyFoodAllowance', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 4: Data Integrity Systems */}
          <motion.div variants={itemVariants} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <CloudSync className="w-4 h-4 text-slate-400 shrink-0" /> Cloud Ledger Synchronization Matrix
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal break-words">Enabling this flag commits daily operations and cashbook state logs to cloud streams continuously.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={siteConfig.autoBackup}
                onChange={(e) => handleConfigChange('autoBackup', e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </motion.div>
        </motion.div>

        {/* Right 1 Column: Manage Active Sites Directory List */}
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wider flex items-center gap-2">
              <MapPinHouse className="w-4 h-4 text-slate-400" /> Project Sites Directory
            </h4>
            
            {/* Dynamic Site Adder Form */}
            <form onSubmit={handleAddSite} className="space-y-2">
              <input 
                type="text" 
                placeholder="Site Title (e.g., Apex Hub)..." 
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-orange-500 text-slate-800 bg-slate-50 focus:bg-white transition-all font-semibold"
                value={newSiteName}
                onChange={(e) => setNewSiteName(e.target.value)}
              />
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Location (e.g., Surat)..." 
                  className="flex-1 border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-orange-500 text-slate-800 bg-slate-50 focus:bg-white transition-all font-semibold"
                  value={newSiteLocation}
                  onChange={(e) => setNewSiteLocation(e.target.value)}
                />
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  type="submit" 
                  className="bg-slate-950 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-800 shadow-sm transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </form>

            {/* Sites Loop Stack from DB */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrolling-touch">
              <AnimatePresence initial={false}>
                {activeSites.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-4 font-bold">No construction sites active.</p>
                ) : (
                  activeSites.map((site) => (
                    <motion.div 
                      key={site._id} 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-medium gap-3"
                    >
                      <div className="truncate min-w-0 flex-1">
                        <p className="text-slate-900 font-black truncate">{site.name}</p>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {site.location}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                        site.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {site.status || 'Active'}
                      </span>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Global Form Submission Trigger Bar */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveAllSettings}
          disabled={saveLoading}
          className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-3.5 rounded-xl text-xs sm:text-sm shadow-md shadow-orange-500/10 disabled:bg-slate-200 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saveLoading ? 'Saving Parameters...' : 'Commit Master Changes'}
        </motion.button>
      </div>
    </div>
  );
}