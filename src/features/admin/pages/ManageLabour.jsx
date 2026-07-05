import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ManageLabour() {
  const baseURL = import.meta.env.VITE_BACKEND_URL;




  const [workers, setWorkers] = useState([]);

  // UI Control States
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [visibleAadhaars, setVisibleAadhaars] = useState({});

  // 🆕 Track if we are editing an existing worker
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
      // 🆕 Route to the PUT update endpoint if an ID target is active
      onboardingPromise = axios.put(`${baseURL}/api/auth/workers/${editingWorkerId}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // Route to the standard POST create endpoint
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
          setTimeout(() => handleCloseModal(), 1000); // Close editing window smoothly
          return 'Worker profile changes saved successfully! 💾';
        } else {
          setCredentials(response.data.worker); // Expose temporary keys for new workers
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

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-800">Workforce Directory</h3>
          <p className="text-xs md:text-sm text-slate-500">Manage master profiles, identity records, and individual daily wage rates.</p>
        </div>
        <button
          onClick={() => { setEditingWorkerId(null); setShowModal(true); }}
          className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-orange-500/10 whitespace-nowrap"
        >
          + Onboard New Labour
        </button>
      </div>

      {/* Filter and Search Utility Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-full sm:flex-1 relative">
          <input 
            type="text" 
            placeholder="🔍 Search worker by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-slate-200 p-2.5 pl-4 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-orange-500 outline-none transition-all"
          />
        </div>
        <div className="w-full sm:w-48">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white font-medium text-slate-700 outline-none"
          >
            <option value="All">All Roles</option>
            <option value="labour">Labour / Helper</option>
          </select>
        </div>
      </div>

      {/* Main Labour Directory Roster Container */}
      {fetchLoading ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm font-medium text-slate-400">
          Loading live workforce metrics...
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm font-medium text-slate-400">
          No records found matching current criteria.
        </div>
      ) : (
        <>
          {/* MOBILE LAYOUT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {filteredWorkers.map((worker) => (
              <div key={worker._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  {worker.profilePhoto ? (
                    <img 
                      src={renderAssetUrl(worker.profilePhoto)} 
                      alt="avatar" 
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-slate-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-lg font-bold uppercase">
                      {worker.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-slate-900">{worker.name}</h4>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                      {worker.identityId}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-100 py-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Mobile</span>
                    <span className="text-slate-700 font-mono">{worker.mobile}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Daily Wage</span>
                    <span className="text-slate-900 font-bold">₹{worker.dailyWage}/day</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Aadhaar Card Reference</span>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700 font-mono tracking-wide bg-slate-50 border border-slate-100 px-2 py-1 rounded text-xs flex-1">
                          {visibleAadhaars[worker._id] 
                            ? worker.adharNumber 
                            : `•••• •••• ${worker.adharNumber?.slice(-4) || '0000'}`}
                        </span>
                        <button 
                          onClick={() => toggleAadhaarVisibility(worker._id)}
                          className="text-slate-500 hover:text-orange-500 text-xs font-semibold px-2 py-1 bg-slate-100 rounded transition-colors"
                        >
                          {visibleAadhaars[worker._id] ? '🙈 Hide' : '👁️ Show'}
                        </button>
                      </div>
                      {worker.aadhaarPhoto && (
                        <a 
                          href={renderAssetUrl(worker.aadhaarPhoto)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-orange-500 hover:text-orange-600 font-bold text-[11px] underline mt-1 self-start"
                        >
                          View Original Image Document ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditClick(worker)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-indigo-50 transition-colors"
                    >
                      Edit Info
                    </button>
                    <button 
                      onClick={() => handleDeleteWorker(worker.identityId, worker._id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    worker.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {worker.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP LAYOUT */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                    <th className="p-4">Worker Info</th>
                    <th className="p-4">ID Reference</th>
                    <th className="p-4">Mobile Contact</th>
                    <th className="p-4">Aadhaar Identification</th>
                    <th className="p-4">Base Wage</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {filteredWorkers.map((worker) => (
                    <tr key={worker._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        {worker.profilePhoto ? (
                          <img 
                            src={renderAssetUrl(worker.profilePhoto)} 
                            alt="avatar" 
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-50"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-bold uppercase">
                            {worker.name?.charAt(0)}
                          </div>
                        )}
                        <span className="font-bold text-slate-900">{worker.name}</span>
                      </td>

                      <td className="p-4 text-slate-400 font-mono text-xs">{worker.identityId}</td>
                      <td className="p-4 text-slate-500 font-mono text-xs">{worker.mobile}</td>
                      
                      <td className="p-4 space-y-1.5">
                        <div className="flex items-center gap-2 max-w-[220px]">
                          <span className="font-mono text-xs text-slate-800 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded tracking-wide flex-1">
                            {visibleAadhaars[worker._id] 
                              ? worker.adharNumber 
                              : `•••• •••• ${worker.adharNumber?.slice(-4) || '0000'}`}
                          </span>
                          <button 
                            onClick={() => toggleAadhaarVisibility(worker._id)}
                            className="text-slate-500 hover:text-orange-500 text-[11px] font-bold px-1.5 py-0.5 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
                          >
                            {visibleAadhaars[worker._id] ? '🙈' : '👁️'}
                          </button>
                        </div>
                        {worker.aadhaarPhoto && (
                          <a 
                            href={renderAssetUrl(worker.aadhaarPhoto)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-orange-500 hover:text-orange-600 underline block font-semibold"
                          >
                            View Card Document ↗
                          </a>
                        )}
                      </td>

                      <td className="p-4 text-slate-900 font-semibold">₹{worker.dailyWage} / day</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          worker.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {worker.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => handleEditClick(worker)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-bold px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteWorker(worker.identityId, worker._id)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Embedded Dynamic Modal Configuration (Handles both Onboard & Update matrices) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl text-white my-8 max-h-[90vh] overflow-y-auto relative">
            
            <button 
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-xl font-bold bg-slate-800 rounded-full h-8 w-8 flex items-center justify-center"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold tracking-tight mb-1 text-indigo-400">
              {editingWorkerId ? 'Modify Worker Profile' : 'Onboard New Labour'}
            </h2>
            <p className="text-slate-400 mb-6 text-xs">
              {editingWorkerId ? 'Update master records. Document fields can be left empty if unchanged.' : 'Fill in workforce credentials. System will auto-generate secure login keys.'}
            </p>

            {credentials && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-5 shadow-inner">
                <h4 className="text-amber-400 font-bold mb-1 text-xs uppercase tracking-wider">⚠️ System Login Access Token Issued</h4>
                <p className="text-xs text-slate-300 mb-2">Provide these details to the worker immediately. Passwords cannot be recovered later:</p>
                <div className="font-mono bg-slate-950 p-3 rounded border border-slate-800 space-y-1 text-xs">
                  <div><span className="text-slate-500">Identity ID:</span> <span className="text-amber-400 font-bold">{credentials.identityId}</span></div>
                  <div><span className="text-slate-500">Temp Password:</span> <span className="text-emerald-400 font-bold">{credentials.temporaryPassword}</span></div>
                </div>
              </div>
            )}

            <form onSubmit={handleAddWorkerSubmit} className="space-y-4" encType="multipart/form-data">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleTextChange} placeholder="Enter full name" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors" required />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mobile Number</label>
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleTextChange} placeholder="10-digit mobile number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Identification Parameter</label>
                  <input type="text" name="adharNumber" value={formData.adharNumber} onChange={handleTextChange} placeholder="12-digit number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors" required />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Daily Wage (₹)</label>
                  <input type="number" name="dailyWage" value={formData.dailyWage} onChange={handleTextChange} placeholder="Default: 400" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Update Document Image {editingWorkerId && '(Optional)'}
                  </label>
                  <input type="file" name="aadhaarPhoto" onChange={handleFileChange} accept="image/*" className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 file:cursor-pointer transition-colors" required={!editingWorkerId} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Update Profile Photo (Optional)</label>
                  <input type="file" name="profilePhoto" onChange={handleFileChange} accept="image/*" className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 file:cursor-pointer transition-colors" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {editingWorkerId ? 'Save Changes' : 'Register Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}