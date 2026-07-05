import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
        return 'Site records synchronized flawlessly! 🏗️';
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

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header Context panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-800">Construction Sites Directory</h3>
          <p className="text-xs md:text-sm text-slate-500">Add, view, update, and manage active regional infrastructure locations.</p>
        </div>
        <button
          onClick={() => { setEditingWorkerId(null); setShowModal(true); }}
          className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md"
        >
          + Add New Project Site
        </button>
      </div>

      {/* Main Grid Container Display */}
      {fetchLoading ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm font-medium text-slate-400">
          Parsing active site index logs...
        </div>
      ) : sites.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm font-medium text-slate-400">
          No registered construction projects recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <div key={site._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-slate-900 text-lg">{site.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                    site.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : site.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {site.status || 'Active'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">📍 {site.location}</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  onClick={() => handleEditClick(site)}
                  className="text-indigo-600 hover:text-indigo-800 text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 transition-colors"
                >
                  Edit Configuration
                </button>
                <button 
                  onClick={() => handleDeleteSite(site._id, site.name)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Pop-up Modal Matrix Setup */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl text-white relative">
            <button type="button" onClick={handleCloseModal} className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg">×</button>
            <h2 className="text-xl font-bold text-indigo-400 mb-1">{editingSiteId ? 'Modify Project Site' : 'Register Project Site'}</h2>
            <p className="text-slate-400 mb-4 text-xs">Specify location parameters below to sync real-time modules.</p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1.5 tracking-wider">Site Designation Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleTextChange} placeholder="e.g., Shakti Residency" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" required />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1.5 tracking-wider">Geographic Location Address</label>
                <input type="text" name="location" value={formData.location} onChange={handleTextChange} placeholder="e.g., Surat, Gujarat" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" required />
              </div>

              {editingSiteId && (
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1.5 tracking-wider">Operational Status</label>
                  <select name="status" value={formData.status} onChange={handleTextChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500">
                    <option value="Active">Active Operations</option>
                    <option value="Completed">Project Completed</option>
                    <option value="On Hold">On Hold / Interrupted</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl">Cancel</button>
                <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors">
                  {editingSiteId ? 'Save Changes' : 'Initialize Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}