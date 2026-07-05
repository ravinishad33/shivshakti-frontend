import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

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

  if (pageLoading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium text-sm">
        Loading system control configuration matrices...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-2">
      {/* Page Title Section */}
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800">Control & Configuration Panel</h3>
        <p className="text-xs md:text-sm text-slate-500">Configure global parameters, site locations, attendance rules, and default wage multipliers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Core settings forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: General Profile Rules */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider text-slate-700">🏢 Firm Profile & Metadata</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Company Legal Entity Title</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-orange-500 font-semibold text-slate-800 bg-slate-50/50" 
                  value={siteConfig.companyName}
                  onChange={(e) => handleConfigChange('companyName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Central Corporate Location</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-orange-500 font-semibold text-slate-800 bg-slate-50/50" 
                  value={siteConfig.primaryLocation}
                  onChange={(e) => handleConfigChange('primaryLocation', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Attendance & Payroll Automation Engines Rules */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider text-slate-700">⚙️ Attendance & Payroll Logic Rules</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Morning Grace Window (Mins)</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-orange-500 font-medium text-slate-800 bg-slate-50/50" 
                  value={siteConfig.defaultGracePeriod}
                  onChange={(e) => handleConfigChange('defaultGracePeriod', e.target.value)}
                />
                <span className="text-[10px] text-slate-400 font-medium block mt-1">Late arrivals past this marker flag on the attendance log automatically.</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Overtime Multiplier Rate</label>
                <select 
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50/50 outline-none focus:border-orange-500 font-medium text-slate-800 cursor-pointer"
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

          {/* Section 3: Global Base Wages & Allowances */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider text-slate-700">💰 Global Base Wages & Allowances</h4>
            <p className="text-[11px] text-slate-400 font-medium">These defaults automatically apply when creating new workforce roster items.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Default Skilled Wage (₹/Day)</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-orange-500 font-bold text-slate-800 bg-slate-50/50" 
                  value={siteConfig.baseLabourWage}
                  onChange={(e) => handleConfigChange('baseLabourWage', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Default Helper Wage (₹/Day)</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-orange-500 font-bold text-slate-800 bg-slate-50/50" 
                  value={siteConfig.baseHelperWage}
                  onChange={(e) => handleConfigChange('baseHelperWage', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Daily Mess Allowance (₹/Day)</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-orange-500 font-bold text-slate-800 bg-slate-50/50" 
                  value={siteConfig.dailyFoodAllowance}
                  onChange={(e) => handleConfigChange('dailyFoodAllowance', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Data Integrity Systems */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Cloud Ledger Synchronization Matrix</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Enabling this flag commits daily operations and cashbook state logs to cloud streams continuously.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={siteConfig.autoBackup}
                onChange={(e) => handleConfigChange('autoBackup', e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>

        {/* Right 1 Column: Manage Active Sites Directory List */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider text-slate-700">🏗️ Project Sites Directory</h4>
            
            {/* Dynamic Site Adder Form */}
            <form onSubmit={handleAddSite} className="space-y-2">
              <input 
                type="text" 
                placeholder="Site Title (e.g., Apex Hub)..." 
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-orange-500 text-slate-800"
                value={newSiteName}
                onChange={(e) => setNewSiteName(e.target.value)}
              />
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Location (e.g., Surat)..." 
                  className="flex-1 border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-orange-500 text-slate-800"
                  value={newSiteLocation}
                  onChange={(e) => setNewSiteLocation(e.target.value)}
                />
                <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 shadow-sm transition-colors">+</button>
              </div>
            </form>

            {/* Sites Loop Stack from DB */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {activeSites.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-4">No construction sites active.</p>
              ) : (
                activeSites.map((site) => (
                  <div key={site._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-medium">
                    <div className="truncate max-w-[150px]">
                      <p className="text-slate-900 font-bold truncate">{site.name}</p>
                      <span className="text-[10px] font-medium text-slate-400">📍 {site.location}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      site.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {site.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Form Submission Trigger Bar */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <button
          onClick={handleSaveAllSettings}
          disabled={saveLoading}
          className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-orange-500/10 disabled:bg-slate-300"
        >
          {saveLoading ? 'Saving Parameters...' : 'Commit Master Changes'}
        </button>
      </div>
    </div>
  );
}