import React, { useState } from 'react';

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

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const newTx = {
      id: `TX-${500 + transactions.length + 1}`,
      date: '29/06/26', // Current project date snapshot
      description: formData.description,
      type: formData.type,
      amount: Number(formData.amount),
      category: formData.category
    };

    setTransactions([newTx, ...transactions]);
    setFormData({ description: '', type: 'Expense', amount: '', category: 'Materials' });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Site Cashbook Ledger</h3>
          <p className="text-sm text-slate-500">Real-time accounting of your site cash reserves and immediate expenses.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md"
        >
          + Log Entry
        </button>
      </div>

      {/* Financial Pulse Analytics Summary Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Received (Inflow)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">₹{totalIncome.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Spent (Outflow)</p>
          <p className="text-2xl font-bold text-red-600 mt-2">₹{totalExpense.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl shadow-md text-white">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Cash Balance Handled</p>
          <p className="text-2xl font-bold text-orange-400 mt-2">₹{totalBalance.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Main Ledger Table view */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-xs tracking-wider">
              <th className="p-4">Date / ID</th>
              <th className="p-4">Description Info</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-right">Inflow (Income)</th>
              <th className="p-4 text-right">Outflow (Expense)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="text-slate-900 font-semibold">{tx.date}</div>
                  <div className="text-slate-400 text-xs font-mono">{tx.id}</div>
                </td>
                <td className="p-4 font-semibold text-slate-800">{tx.description}</td>
                <td className="p-4">
                  <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded">
                    {tx.category}
                  </span>
                </td>
                <td className="p-4 text-right font-bold text-emerald-600">
                  {tx.type === 'Income' ? `+ ₹${tx.amount.toLocaleString('en-IN')}` : '—'}
                </td>
                <td className="p-4 text-right font-bold text-red-600">
                  {tx.type === 'Expense' ? `- ₹${tx.amount.toLocaleString('en-IN')}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Entry Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <h4 className="text-lg font-bold text-slate-900">Record Cash Transaction</h4>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Transaction Type</label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, type: 'Expense'})}
                    className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${formData.type === 'Expense' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Expense (Outflow)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, type: 'Income'})}
                    className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${formData.type === 'Income' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Income (Inflow)
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                <input required type="number" className="w-full border border-slate-200 p-2.5 rounded-xl text-sm" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                <select className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  {formData.type === 'Expense' ? (
                    <>
                      <option>Materials</option>
                      <option>Labour Advance</option>
                      <option>Fuel / Transport</option>
                      <option>Misc / Food</option>
                    </>
                  ) : (
                    <>
                      <option>Capital</option>
                      <option>Client Running Bill</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <input required type="text" placeholder="e.g. Purchased 10 brass sand delivery" className="w-full border border-slate-200 p-2.5 rounded-xl text-sm" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md">Add to Ledger</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}