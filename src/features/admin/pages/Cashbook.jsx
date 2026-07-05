import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cashbook() {
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  // Mock Transaction Ledger State
  const [transactions, setTransactions] = useState([
    { id: 'TX-501', date: '29/06/26', description: 'Received Capital from Owner', type: 'Income', amount: 250000, category: 'Capital' },
    { id: 'TX-502', date: '29/06/26', description: 'Bought 50 bags of Ambuja Cement', type: 'Expense', amount: 22000, category: 'Materials' },
    { id: 'TX-503', date: '29/06/26', description: 'Site tea and snacks expenses', type: 'Expense', amount: 450, category: 'Misc' },
    { id: 'TX-504', date: '28/06/26', description: 'Paid Advance to Ramesh Kumar (Mason)', type: 'Expense', amount: 2000, category: 'Labour Advance' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ description: '', type: 'Expense', amount: '', category: 'Materials' });

  // Running calculations engines
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type,
      category: type === 'Expense' ? 'Materials' : 'Capital'
    });
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const newTx = {
      id: `TX-${500 + transactions.length + 1}`,
      date: '06/07/26', // Real-time updated structural date string format
      description: formData.description,
      type: formData.type,
      amount: Number(formData.amount),
      category: formData.category
    };

    setTransactions([newTx, ...transactions]);
    setFormData({ description: '', type: 'Expense', amount: '', category: 'Materials' });
    setShowModal(false);
  };

  // Animation layout configs
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 max-w-7xl mx-auto overflow-x-hidden">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Site Cashbook Ledger</h3>
          <p className="text-xs sm:text-sm text-slate-500">Real-time accounting of site cash reserves and local structural expenses.</p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-colors shadow-md shadow-orange-500/10"
        >
          + Log Entry
        </motion.button>
      </div>

      {/* Financial Pulse Analytics Summary Boxes */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
      >
        <motion.div variants={cardVariants} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Total Received (Inflow)</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">₹{totalIncome.toLocaleString('en-IN')}</p>
        </motion.div>
        
        <motion.div variants={cardVariants} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spent (Outflow)</p>
          <p className="text-xl sm:text-2xl font-black text-red-600 mt-1">₹{totalExpense.toLocaleString('en-IN')}</p>
        </motion.div>
        
        <motion.div variants={cardVariants} className="bg-slate-900 p-5 rounded-2xl shadow-md text-white">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Net Cash Balance Handled</p>
          <p className="text-xl sm:text-2xl font-black text-orange-400 mt-1">₹{totalBalance.toLocaleString('en-IN')}</p>
        </motion.div>
      </motion.div>

      {/* Main Ledger Table view Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="w-full overflow-x-auto scrolling-touch">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <th className="p-4 w-[120px]">Date / ID</th>
                <th className="p-4">Description Info</th>
                <th className="p-4 w-[140px]">Category</th>
                <th className="p-4 text-right w-[140px]">Inflow (Income)</th>
                <th className="p-4 text-right w-[140px]">Outflow (Expense)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
              <AnimatePresence initial={false}>
                {transactions.map((tx) => (
                  <motion.tr 
                    key={tx.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-4">
                      <div className="text-slate-900 font-bold">{tx.date}</div>
                      <div className="text-slate-400 text-[10px] font-mono mt-0.5">{tx.id}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800 break-words max-w-[240px]">
                      {tx.description}
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 text-[11px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide">
                        {tx.category}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-emerald-600">
                      {tx.type === 'Income' ? `+ ₹${tx.amount.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="p-4 text-right font-black text-red-600">
                      {tx.type === 'Expense' ? `- ₹${tx.amount.toLocaleString('en-IN')}` : '—'}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Entry Creation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            
            {/* Modal Form Dialog Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <h4 className="text-lg font-black text-slate-900 tracking-tight">Record Cash Transaction</h4>
              
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Transaction Type</label>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button 
                      type="button" 
                      onClick={() => handleTypeChange('Expense')}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${formData.type === 'Expense' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Expense (Outflow)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleTypeChange('Income')}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${formData.type === 'Income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Income (Inflow)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Amount (₹)</label>
                  <input required min="1" type="number" className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50 focus:bg-white outline-none focus:border-orange-500 transition-colors" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Category</label>
                  <select className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50 focus:bg-white outline-none focus:border-orange-500 transition-colors" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    {formData.type === 'Expense' ? (
                      <>
                        <option value="Materials">Materials</option>
                        <option value="Labour Advance">Labour Advance</option>
                        <option value="Fuel / Transport">Fuel / Transport</option>
                        <option value="Misc / Food">Misc / Food</option>
                      </>
                    ) : (
                      <>
                        <option value="Capital">Capital</option>
                        <option value="Client Running Bill">Client Running Bill</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Description</label>
                  <input required type="text" placeholder="e.g. Purchased 10 brass sand delivery" className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50 focus:bg-white outline-none focus:border-orange-500 transition-colors" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md transition-colors">Add to Ledger</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}