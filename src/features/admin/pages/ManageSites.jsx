import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

// Import Required professional icons from lucide-react
import {
  Building2,
  PlusCircle,
  MapPin,
  FileEdit,
  Trash2,
  X,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function ManageSites() {
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  const [sites, setSites] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [editingSiteId, setEditingWorkerId] = useState(null);

  const [formData, setFormData] = useState({ name: '', location: '', status: 'Active' });

  const fetchSitesFromDatabase = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${baseURL}/api/sites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSites(response.data || []);
    } catch (error) {
      toast.error("Failed to refresh structural site blueprint index registers.");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchSitesFromDatabase();
  }, []);

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (site) => {
    setEditingWorkerId(site._id);
    setFormData({ name: site.name, location: site.location, status: site.status || 'Active' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingWorkerId(null);
    setFormData({ name: '', location: '', status: 'Active' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    let sitePromise;
    if (editingSiteId) {
      sitePromise = axios.put(`${baseURL}/api/sites/${editingSiteId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      sitePromise = axios.post(`${baseURL}/api/sites`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    toast.promise(sitePromise, {
      loading: 'Writing site parameters to database...',
      success: () => {
        fetchSitesFromDatabase();
        handleCloseModal();
        setLoading(false);
        return 'Site records synchronized flawlessly!';
      },
      error: (err) => {
        setLoading(false);
        return err.response?.data?.message || 'Failed to modify location registry blueprint.';
      }
    });
  };

  const handleDeleteSite = async (dbId, siteName) => {
    if (window.confirm(`Are you sure you want to permanently delete "${siteName}"?`)) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`${baseURL}/api/sites/${dbId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSites(sites.filter(s => s._id !== dbId));
        toast.success('Site blueprint purged from directory database.');
      } catch (error) {
        toast.error("Failed to execute data array drop parameters.");
      }
    }
  };

  // Framer Motion staggered animations configuration
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 max-w-7xl mx-auto overflow-x-hidden font-sans">
      
      {/* Header Context panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-orange-500" /> Construction Sites Directory
          </h3>
          <p className="text-xs md:text-sm text-slate-500">Add, view, update, and manage active regional infrastructure locations.</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setEditingWorkerId(null); setShowModal(true); }}
          className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-colors shadow-md shadow-orange-500/10 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" /> Add New Project Site
        </motion.button>
      </div>

      {/* Main Grid Container Display */}
      {fetchLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs sm:text-sm font-bold text-slate-400">
          Parsing active site index logs...
        </div>
      ) : sites.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs sm:text-sm font-bold text-slate-400">
          No registered construction projects recorded yet.
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {sites.map((site) => (
            <motion.div 
              variants={cardVariants}
              key={site._id} 
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-start gap-3">
                  <h4 className="font-black text-slate-900 text-base sm:text-lg tracking-tight leading-snug break-words min-w-0 flex-1">
                    {site.name}
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 whitespace-nowrap ${
                    site.status === 'Completed' 
                      ? 'bg-blue-100 text-blue-700' 
                      : site.status === 'On Hold' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {site.status || 'Active'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 break-all">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {site.location}
                </p>
              </div>

              <div className="flex justify-end gap-1.5 pt-3.5 border-t border-slate-100">
                <button 
                  onClick={() => handleEditClick(site)}
                  className="text-indigo-600 hover:text-indigo-800 text-xs font-bold px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                >
                  <FileEdit className="w-3.5 h-3.5" /> Edit Configuration
                </button>
                <button 
                  onClick={() => handleDeleteSite(site._id, site.name)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-2 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pop-up Modal Registry Dashboard with Framer Motion AnimatePresence */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop Dimmer Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            {/* Modal Input Content Window Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl text-white relative z-10"
            >
              <button 
                type="button" 
                onClick={handleCloseModal} 
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors border border-slate-800 bg-slate-950 hover:bg-slate-800 rounded-xl h-8 w-8 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h2 className="text-xl font-black tracking-tight mb-1 text-orange-400 flex items-center gap-2">
                {editingSiteId ? 'Modify Project Site' : 'Register Project Site'}
              </h2>
              <p className="text-slate-400 mb-5 text-xs font-medium">Specify location parameters below to sync real-time modules.</p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Site Designation Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleTextChange} placeholder="e.g., Shakti Residency" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 focus:bg-slate-950 transition-colors" required />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Geographic Location Address</label>
                  <input type="text" name="location" value={formData.location} onChange={handleTextChange} placeholder="e.g., Surat, Gujarat" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 focus:bg-slate-950 transition-colors" required />
                </div>

                {editingSiteId && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Operational Status</label>
                    <select name="status" value={formData.status} onChange={handleTextChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer focus:bg-slate-950 transition-colors">
                      <option value="Active">Active Operations</option>
                      <option value="Completed">Project Completed</option>
                      <option value="On Hold">On Hold / Interrupted</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {editingSiteId ? 'Save Changes' : 'Initialize Site'}
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