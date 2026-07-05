import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

// Import required sleek icons from lucide-react
import {
  Users,
  UserPlus,
  Search,
  SlidersHorizontal,
  Eye,
  EyeOff,
  FileImage,
  User,
  Trash2,
  FileEdit,
  IndianRupee,
  Smartphone,
  Fingerprint,
  X,
  AlertTriangle
} from 'lucide-react';

export default function ManageLabour() {
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  const [workers, setWorkers] = useState([]);

  // UI Control States
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [visibleAadhaars, setVisibleAadhaars] = useState({});

  // Track if we are editing an existing worker
  const [editingWorkerId, setEditingWorkerId] = useState(null);

  // Real Multipart Form States
  const [formData, setFormData] = useState({ 
    name: '', 
    mobile: '', 
    dailyWage: '', 
    adharNumber: '' 
  });
  const [aadhaarPhoto, setAadhaarPhoto] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  // API Process Trackers
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true); 
  const [credentials, setCredentials] = useState(null);

  const fetchWorkersFromDatabase = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${baseURL}/api/auth/workers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkers(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching workforce ledger metrics.", {
        id: 'fetch-error'
      });
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkersFromDatabase();
  }, []);

  // Populate data fields for updating profiles
  const handleEditClick = (worker) => {
    setEditingWorkerId(worker._id); // Set active target database ID
    setFormData({
      name: worker.name || '',
      mobile: worker.mobile || '',
      dailyWage: worker.dailyWage || '',
      adharNumber: worker.adharNumber || ''
    });
    setCredentials(null);
    setShowModal(true);
  };

  const toggleAadhaarVisibility = (id) => {
    setVisibleAadhaars(prev => ({ ...prev, [id]: !prev[id] }));
    if (!visibleAadhaars[id]) {
      toast('Verification parameters unmasked', { icon: '👁️', duration: 1500 });
    } else {
      toast('Verification parameters masked', { icon: '🔒', duration: 1500 });
    }
  };

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'aadhaarPhoto') {
      setAadhaarPhoto(e.target.files[0]);
    } else if (e.target.name === 'profilePhoto') {
      setProfilePhoto(e.target.files[0]);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingWorkerId(null);
    setFormData({ name: '', mobile: '', dailyWage: '', adharNumber: '' });
    setAadhaarPhoto(null);
    setProfilePhoto(null);
    setCredentials(null);
  };

  // Handle Real Network Form Submission (Create or Update dynamically)
  const handleAddWorkerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCredentials(null);

    const token = localStorage.getItem('token'); 
    if (!token) {
      toast.error('Authentication token missing. Please log in.');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('mobile', formData.mobile);
    data.append('dailyWage', formData.dailyWage || 400);
    data.append('adharNumber', formData.adharNumber); 
    if (aadhaarPhoto) data.append('aadhaarPhoto', aadhaarPhoto);
    if (profilePhoto) data.append('profilePhoto', profilePhoto);

    let onboardingPromise;

    if (editingWorkerId) {
      onboardingPromise = axios.put(`${baseURL}/api/auth/workers/${editingWorkerId}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      onboardingPromise = axios.post(`${baseURL}/api/auth/workers`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    toast.promise(onboardingPromise, {
      loading: editingWorkerId ? 'Updating worker profile records...' : 'Onboarding new worker profile...',
      success: (response) => {
        fetchWorkersFromDatabase();
        setLoading(false);
        if (editingWorkerId) {
          setTimeout(() => handleCloseModal(), 1000);
          return 'Worker profile changes saved successfully! 💾';
        } else {
          setCredentials(response.data.worker);
          return 'Worker profile initialized successfully! 🎉';
        }
      },
      error: (error) => {
        setLoading(false);
        return error.response?.data?.message || 'Failed to save changes via pipeline link.';
      }
    });
  };

  const handleDeleteWorker = async (id, dbId) => {
    if (window.confirm(`Are you sure you want to completely remove worker ${id}?`)) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`${baseURL}/api/auth/workers/${dbId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWorkers(workers.filter(worker => worker._id !== dbId));
        toast.success(`Worker profile ${id} permanently dropped from roster.`);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete the worker from backend ledger.");
      }
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
      worker.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      worker.identityId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || worker.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const renderAssetUrl = (filePath) => {
    if (!filePath) return null;
    const unifiedPath = filePath.replace(/\\/g, '/');
    return `${baseURL}/${unifiedPath}`;
  };

  // Animation layout configurations
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 max-w-7xl mx-auto overflow-x-hidden font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-500" /> Workforce Directory
          </h3>
          <p className="text-xs md:text-sm text-slate-500">Manage master profiles, identity records, and individual daily wage rates.</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setEditingWorkerId(null); setShowModal(true); }}
          className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-colors shadow-md shadow-orange-500/10 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" /> Onboard New Labour
        </motion.button>
      </div>

      {/* Filter and Search Utility Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-full sm:flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search worker by name or identification ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-slate-200 p-2.5 pl-10 rounded-xl text-xs sm:text-sm bg-slate-50 focus:bg-white outline-none focus:border-orange-500 transition-all"
          />
        </div>
        <div className="w-full sm:w-52 relative flex items-center">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full border border-slate-200 p-2.5 pl-10 rounded-xl text-xs sm:text-sm bg-white font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-orange-500 transition-all"
          >
            <option value="All">All Applied Roles</option>
            <option value="labour">Labour / Field Helper</option>
          </select>
        </div>
      </div>

      {/* Main Labour Directory Roster Container */}
      {fetchLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs sm:text-sm font-bold text-slate-400">
          Loading live workforce metrics...
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs sm:text-sm font-bold text-slate-400">
          No records found matching current criteria.
        </div>
      ) : (
        <>
          {/* MOBILE CARD LAYOUT */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden"
          >
            {filteredWorkers.map((worker) => (
              <motion.div variants={cardVariants} key={worker._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  {worker.profilePhoto ? (
                    <img 
                      src={renderAssetUrl(worker.profilePhoto)} 
                      alt="avatar" 
                      className="w-12 h-12 rounded-full object-cover border border-slate-100 bg-slate-50 shadow-inner shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-950 text-slate-300 flex items-center justify-center border border-slate-800 text-sm font-black uppercase shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-900 truncate leading-tight">{worker.name}</h4>
                    <span className="inline-block text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold mt-1">
                      {worker.identityId}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-100 py-3.5">
                  <div className="min-w-0">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1"><Smartphone className="w-3 h-3" /> Mobile</span>
                    <span className="text-slate-700 font-mono font-bold truncate block mt-0.5">{worker.mobile}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Daily Wage</span>
                    <span className="text-slate-900 font-black block mt-0.5">₹{worker.dailyWage}/day</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1"><Fingerprint className="w-3 h-3" /> Identity Verification</span>
                    <div className="flex flex-col gap-1.5 mt-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-800 font-mono font-bold tracking-wide bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-xl text-xs flex-1 text-center">
                          {visibleAadhaars[worker._id] 
                            ? worker.adharNumber 
                            : `•••• •••• ${worker.adharNumber?.slice(-4) || '0000'}`}
                        </span>
                        <button 
                          onClick={() => toggleAadhaarVisibility(worker._id)}
                          className="text-slate-600 hover:text-orange-500 text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1 shrink-0"
                        >
                          {visibleAadhaars[worker._id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {worker.aadhaarPhoto && (
                        <a 
                          href={renderAssetUrl(worker.aadhaarPhoto)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-orange-500 hover:text-orange-600 font-bold text-[11px] flex items-center gap-1 underline mt-0.5 self-start"
                        >
                          <FileImage className="w-3.5 h-3.5" /> View Uploaded Document ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditClick(worker)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-bold px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                    >
                      <FileEdit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteWorker(worker.identityId, worker._id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Drop
                    </button>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    worker.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {worker.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* DESKTOP TABLE LAYOUT */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <th className="p-4">Worker Profile Details</th>
                    <th className="p-4 w-[140px]">Roster ID</th>
                    <th className="p-4 w-[140px]">Mobile Contact</th>
                    <th className="p-4 w-[280px]">Identity Verification Parameter</th>
                    <th className="p-4 w-[150px]">Daily Wage Tally</th>
                    <th className="p-4 w-[120px]">System Status</th>
                    <th className="p-4 text-right w-[150px]">Actions Ledger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
                  {filteredWorkers.map((worker) => (
                    <tr key={worker._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        {worker.profilePhoto ? (
                          <img 
                            src={renderAssetUrl(worker.profilePhoto)} 
                            alt="avatar" 
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-50 shadow-inner shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-950 text-slate-300 flex items-center justify-center border border-slate-800 text-xs font-black uppercase shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-black text-slate-900 truncate max-w-[180px]">{worker.name}</span>
                      </td>

                      <td className="p-4 text-slate-500 font-mono font-bold text-xs">{worker.identityId}</td>
                      <td className="p-4 text-slate-500 font-mono font-bold text-xs">{worker.mobile}</td>
                      
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-2 max-w-[220px]">
                          <span className="font-mono text-xs text-slate-800 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg tracking-wide flex-1 text-center font-bold">
                            {visibleAadhaars[worker._id] 
                              ? worker.adharNumber 
                              : `•••• •••• ${worker.adharNumber?.slice(-4) || '0000'}`}
                          </span>
                          <button 
                            onClick={() => toggleAadhaarVisibility(worker._id)}
                            className="text-slate-500 hover:text-orange-500 text-[11px] font-bold p-1 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors shrink-0"
                          >
                            {visibleAadhaars[worker._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {worker.aadhaarPhoto && (
                          <a 
                            href={renderAssetUrl(worker.aadhaarPhoto)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-orange-500 hover:text-orange-600 underline font-bold inline-flex items-center gap-1 pl-1"
                          >
                            <FileImage className="w-3.5 h-3.5" /> Open Document Attachment ↗
                          </a>
                        )}
                      </td>

                      <td className="p-4 text-slate-900 font-black flex items-center gap-0.5 mt-2"><IndianRupee className="w-3.5 h-3.5 text-slate-400" />{worker.dailyWage} / day</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          worker.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {worker.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button 
                          onClick={() => handleEditClick(worker)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteWorker(worker.identityId, worker._id)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {/* Embedded Dynamic Modal Configuration with Framer Motion AnimatePresence */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Modal Backdrop Layer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            {/* Modal Body Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-5 sm:p-8 rounded-2xl shadow-2xl text-white relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <button 
                type="button"
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors border border-slate-800 bg-slate-950 hover:bg-slate-800 rounded-xl h-8 w-8 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1 text-orange-400">
                {editingWorkerId ? 'Modify Worker Profile' : 'Onboard New Labour'}
              </h2>
              <p className="text-slate-400 mb-6 text-xs font-medium">
                {editingWorkerId ? 'Update master records. Document fields can be left empty if unchanged.' : 'Fill in workforce credentials. System will auto-generate secure login keys.'}
              </p>

              {credentials && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-5 shadow-inner space-y-2">
                  <h4 className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> System Login Access Token Issued
                  </h4>
                  <p className="text-xs text-slate-300">Provide these details to the worker immediately. Passwords cannot be recovered later:</p>
                  <div className="font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <div><span className="text-slate-500 font-bold">Identity ID:</span> <span className="text-amber-400 font-bold">{credentials.identityId}</span></div>
                    <div><span className="text-slate-500 font-bold">Temp Password:</span> <span className="text-emerald-400 font-bold">{credentials.temporaryPassword}</span></div>
                  </div>
                </div>
              )}

              <form onSubmit={handleAddWorkerSubmit} className="space-y-4" encType="multipart/form-data">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleTextChange} placeholder="Enter full name" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-slate-950 transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mobile Number</label>
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleTextChange} placeholder="10-digit mobile number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-slate-950 transition-colors" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Identification Parameter</label>
                    <input type="text" name="adharNumber" value={formData.adharNumber} onChange={handleTextChange} placeholder="12-digit identification key" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-slate-950 transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Daily Wage (₹)</label>
                    <input type="number" name="dailyWage" value={formData.dailyWage} onChange={handleTextChange} placeholder="Default value: 400" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-slate-950 transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Update Document Image {editingWorkerId && '(Optional)'}
                    </label>
                    <input type="file" name="aadhaarPhoto" onChange={handleFileChange} accept="image/*" className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 file:cursor-pointer transition-colors" required={!editingWorkerId} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Update Profile Photo (Optional)</label>
                    <input type="file" name="profilePhoto" onChange={handleFileChange} accept="image/*" className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 file:cursor-pointer transition-colors" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {editingWorkerId ? 'Save Changes' : 'Register Worker'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}