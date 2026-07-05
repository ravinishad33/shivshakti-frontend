import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

// Import streamlined icons from lucide-react
import {
  Banknote,
  Calendar,
  Clock,
  CircleDollarSign,
  User,
  Printer,
  MessageSquare,
  Coins,
  X,
  PlusCircle,
  FileText,
  Briefcase
} from "lucide-react";

export default function ManageSalary() {
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  // Core Operational States
  const [salaryRoster, setSalaryRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advance Pop-up Modal UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceDescription, setAdvanceDescription] = useState("");

  // Default Monthly Filter (Format: YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7); // e.g., "2026-07"
  });

  // Helper: Format integers into clean Indian Rupee Layouts
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Helper: Format current timestamp directly to your required dd:mm:yy variant
  const getFormattedToday = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(-2);
    return `${day}:${month}:${year}`;
  };

  const calculateGrossSalary = (wages, totalDays) => wages * totalDays;
  const calculateNetSalary = (wages, totalDays, advance) =>
    wages * totalDays - advance;

  // 1. Core Analytics Calculation Engine Pipeline
  const compileMonthlySalaryLedger = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const [workersRes, cashbookRes] = await Promise.all([
        axios.get(`${baseURL}/api/auth/workers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseURL}/api/cashbook`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const workers = workersRes.data || [];
      const cashbookEntries = cashbookRes.data?.ledgerHistory || [];

      const [targetYear, targetMonth] = selectedMonth.split("-");
      const backendMonthSegment = `:${targetMonth}:${targetYear.slice(-2)}`;

      const computedRoster = await Promise.all(
        workers.map(async (worker) => {
          let fullPresentCount = 0;
          let halfDayCount = 0;

          try {
            const attendanceRes = await axios.get(
              `${baseURL}/api/attendance/summary`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );

            const allLogs = attendanceRes.data?.records || [];

            allLogs.forEach((log) => {
              const matchWorker =
                log.workerId?._id === worker._id || log.workerId === worker._id;
              if (matchWorker && log.date?.endsWith(backendMonthSegment)) {
                if (log.status === "Present") fullPresentCount++;
                if (log.status === "Half-Day") halfDayCount++;
              }
            });
          } catch (e) {
            console.error("Attendance extraction sub-fault:", e);
          }

          const totalPresentDays = fullPresentCount + halfDayCount * 0.5;
          const totalHoursWorked = fullPresentCount * 9 + halfDayCount * 4.5;

          let advanceTaken = 0;
          cashbookEntries.forEach((entry) => {
            if (
              entry.category === "Labour Advance" &&
              entry.description
                ?.toLowerCase()
                .includes(worker.name.toLowerCase())
            ) {
              if (entry.date?.includes(`:${targetMonth}:`)) {
                advanceTaken += entry.amount || 0;
              }
            }
          });

          const assignedSiteObjectId = worker.site?._id || worker.site || "";

          return {
            _id: worker._id,
            identityId: worker.identityId,
            name: worker.name,
            role: worker.role || "Labour / Helper",
            dailyWage: worker.dailyWage || 400,
            siteId: assignedSiteObjectId, 
            totalPresentDays,
            totalHoursWorked,
            advanceTaken,
          };
        }),
      );

      setSalaryRoster(computedRoster);
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed to process calculation layers from live collections.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    compileMonthlySalaryLedger();
  }, [selectedMonth]);

  // Open advance configuration window handler
  const openAdvanceModal = (worker) => {
    setSelectedWorker(worker);
    setAdvanceAmount("");
    setAdvanceDescription(
      `Advance cash issued to worker ${worker.name} (ID: ${worker.identityId})`,
    );
    setIsModalOpen(true);
  };

  // Submit Advance Request directly to the active Cashbook API
  const handleSubmitAdvance = async (e) => {
    e.preventDefault();
    if (!advanceAmount || Number(advanceAmount) <= 0) {
      toast.error("Please provide a valid cash payout amount.");
      return;
    }

    setModalLoading(true);
    const token = localStorage.getItem("token");
    const [targetYear, targetMonth] = selectedMonth.split("-");
    const structuredDate = `${String(new Date().getDate()).padStart(2, "0")}:${targetMonth}:${targetYear.slice(-2)}`;

    try {
      const targetSiteId = selectedWorker.siteId || "6a44f95ee9d755ee52f9bb0e";

      await axios.post(
        `${baseURL}/api/cashbook/entry`,
        {
          type: "Debit",
          category: "Labour Advance",
          amount: Number(advanceAmount),
          description: advanceDescription.trim(),
          date: structuredDate,
          siteId: targetSiteId, 
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success(
        `₹${advanceAmount} advance logged successfully for ${selectedWorker.name}! 💸`,
      );
      setIsModalOpen(false);
      compileMonthlySalaryLedger(); 
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to commit Cashbook ledger entry.",
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Global Payroll Totals Accumulator Calculation loop
  const totalPayrollOutflow = salaryRoster.reduce(
    (sum, worker) =>
      sum +
      calculateNetSalary(
        worker.dailyWage,
        worker.totalPresentDays,
        worker.advanceTaken,
      ),
    0,
  );

  // WhatsApp Messaging Share Automation
  const handleShareWhatsApp = (worker) => {
    const gross = calculateGrossSalary(
      worker.dailyWage,
      worker.totalPresentDays,
    );
    const net = calculateNetSalary(
      worker.dailyWage,
      worker.totalPresentDays,
      worker.advanceTaken,
    );
    const statementToday = getFormattedToday();

    const text =
      `*Shivshakti Construction — Payslip Report*\n\n` +
      `*Worker ID:* ${worker.identityId}\n` +
      `*Labour Name:* ${worker.name}\n` +
      `*Role:* ${worker.role}\n\n` +
      `*Total Present Days:* ${worker.totalPresentDays} days\n` +
      `*Total Hours Worked:* ${worker.totalHoursWorked} Hrs\n` +
      `*Daily Wage Rate:* ₹${worker.dailyWage}\n` +
      `*Gross Earnings:* ₹${gross}\n` +
      `*Advance Deductions:* -₹${worker.advanceTaken}\n` +
      `--------------------------------------\n` +
      `*Net Payable Salary:* ₹${net}\n\n` +
      `Generated on: ${statementToday}. Securely verified by Shivshakti Core Operations Hub.`;

    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      "_blank",
    );
    toast.success(`Disbursal receipt dispatched for ${worker.name}`);
  };

  // Browser Print Document Threading
  const handlePrintPayslip = (worker) => {
    const gross = calculateGrossSalary(
      worker.dailyWage,
      worker.totalPresentDays,
    );
    const net = calculateNetSalary(
      worker.dailyWage,
      worker.totalPresentDays,
      worker.advanceTaken,
    );
    const statementToday = getFormattedToday();

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip_${worker.identityId}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #334155; }
            .receipt-card { border: 2px solid #e2e8f0; border-radius: 16px; padding: 32px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
            .title { color: #ea580c; font-size: 24px; font-weight: bold; margin: 0; }
            .row { display: flex; justify-content: space-between; margin: 16px 0; font-size: 14px; }
            .bold { font-weight: bold; color: #0f172a; }
            .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
            .total-row { background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: bold; color: #16a34a; }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <div class="title">SHIVSHAKTI CONSTRUCTION</div>
              <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">Workforce Payroll Management System</p>
            </div>
            <div style="margin-top: 24px;">
              <div class="row"><span>Worker ID / Name:</span><span class="bold">${worker.identityId} / ${worker.name}</span></div>
              <div class="row"><span>Skill Designation:</span><span class="bold capitalize">${worker.role}</span></div>
              <div class="row"><span>Statement Date:</span><span class="bold">${statementToday}</span></div>
              <div class="divider"></div>
              <div class="row"><span>Total Present (Weighted):</span><span>${worker.totalPresentDays} days</span></div>
              <div class="row"><span>Total Hours Worked:</span><span class="bold">${worker.totalHoursWorked} Hrs</span></div>
              <div class="row"><span>Base Daily Wage Rate:</span><span>₹${worker.dailyWage}</span></div>
              <div class="row"><span>Gross Earned Salary:</span><span>₹${gross}</span></div>
              <div class="row" style="color: #dc2626;"><span>Advanced Deductions:</span><span>-₹${worker.advanceTaken}</span></div>
              <div class="divider"></div>
              <div class="row total-row"><span>Net Disbursed Payable:</span><span>₹${net}</span></div>
            </div>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 max-w-7xl mx-auto relative font-sans overflow-x-hidden">
      
      {/* Header Info Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Banknote className="w-6 h-6 text-orange-500 animate-pulse" /> Automated Salary Engine
          </h3>
          <p className="text-xs md:text-sm text-slate-500">
            Live payroll processing pipeline synced with dynamic attendance records and advance balances.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 flex-1 sm:flex-initial">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <label className="text-[10px] font-bold text-slate-400 uppercase px-1">
              Payroll Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border-0 bg-transparent text-xs font-bold text-slate-800 outline-none focus:ring-0 cursor-pointer"
            />
          </div>

          <div className="bg-slate-950 text-white px-4 py-2.5 rounded-xl shadow-md border border-slate-900 shrink-0 flex flex-col justify-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3 h-3 text-orange-400" /> Net Monthly Outflow
            </p>
            <p className="text-base md:text-lg font-black text-orange-400 mt-0.5 leading-none">
              {formatCurrency(totalPayrollOutflow)}
            </p>
          </div>
        </div>
      </div>

      {/* Roster Accounting Layout Blocks */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs sm:text-sm font-bold text-slate-400">
          Processing multi-module transactional sheets balances...
        </div>
      ) : salaryRoster.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs sm:text-sm font-bold text-slate-400">
          No active workforce profiles detected in ledger database files.
        </div>
      ) : (
        <>
          {/* MOBILE RESPONSIVE CARD VIEW (< md viewport) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {salaryRoster.map((worker) => {
              const gross = calculateGrossSalary(worker.dailyWage, worker.totalPresentDays);
              const net = calculateNetSalary(worker.dailyWage, worker.totalPresentDays, worker.advanceTaken);

              return (
                <div key={worker._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-900 text-base truncate">{worker.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400 font-bold mt-1 flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3" /> ID: {worker.identityId} • <span className="capitalize">{worker.role}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-100 py-3 font-semibold text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Daily Rate</span>
                      <span className="text-slate-800 font-bold font-mono">₹{worker.dailyWage}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Attendance</span>
                      <span className="text-slate-900 font-bold">{worker.totalPresentDays} Days</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Hours Logged</span>
                      <span className="text-indigo-600 font-mono font-bold flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" /> {worker.totalHoursWorked} Hrs
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Gross Earned</span>
                      <span className="text-slate-800 font-bold font-mono">₹{gross.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-rose-400 block text-[9px] uppercase font-bold tracking-wider">Advance Debits</span>
                      <span className="text-rose-600 font-bold font-mono">- ₹{worker.advanceTaken.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 block text-[9px] uppercase font-bold tracking-wider">Net Payable</span>
                      <span className={`font-black font-mono text-sm ${net < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        ₹{net.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 justify-end">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openAdvanceModal(worker)}
                      className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Advance
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePrintPayslip(worker)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold p-2 rounded-xl transition-colors shadow-sm flex items-center justify-center"
                      title="Print Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShareWhatsApp(worker)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold p-2 rounded-xl transition-colors shadow-sm flex items-center justify-center"
                      title="Share via WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP MATRIX TABLE VIEW (>= md viewports) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="w-full overflow-x-auto scrolling-touch">
              <table className="w-full text-left border-collapse min-w-[1050px]">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <th className="p-4">Labour Operational Details</th>
                    <th className="p-4 w-[110px]">Daily Rate</th>
                    <th className="p-4 w-[150px]">Total Present</th>
                    <th className="p-4 w-[130px]">Hours Logged</th>
                    <th className="p-4 w-[130px]">Gross Earned</th>
                    <th className="p-4 text-rose-400 w-[140px]">Advance Debits</th>
                    <th className="p-4 text-emerald-400 w-[140px]">Net Payable</th>
                    <th className="p-4 text-right w-[240px]">Actions Pipeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
                  {salaryRoster.map((worker) => {
                    const gross = calculateGrossSalary(worker.dailyWage, worker.totalPresentDays);
                    const net = calculateNetSalary(worker.dailyWage, worker.totalPresentDays, worker.advanceTaken);

                    return (
                      <tr key={worker._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4">
                          <div className="font-black text-slate-900">{worker.name}</div>
                          <div className="text-[10px] font-mono text-slate-400 tracking-tight font-bold mt-0.5">
                            ID: {worker.identityId} • <span className="capitalize">{worker.role}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 font-bold font-mono">
                          ₹{worker.dailyWage}
                        </td>
                        <td className="p-4 font-bold text-slate-900">
                          {worker.totalPresentDays} Days
                        </td>
                        <td className="p-4 font-mono font-bold text-indigo-600">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" /> {worker.totalHoursWorked} Hrs
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-800 font-mono">
                          ₹{gross.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-rose-600 font-black font-mono">
                          - ₹{worker.advanceTaken.toLocaleString('en-IN')}
                        </td>
                        <td className={`p-4 font-black text-base font-mono ${net < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                          ₹{net.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openAdvanceModal(worker)}
                              className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-colors shadow-sm flex items-center gap-1"
                            >
                              <PlusCircle className="w-3.5 h-3.5" /> Advance
                            </button>
                            <button
                              onClick={() => handlePrintPayslip(worker)}
                              className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-colors shadow-sm flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" /> Receipt
                            </button>
                            <button
                              onClick={() => handleShareWhatsApp(worker)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-colors shadow-sm flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> Share
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* INTERACTIVE ADVANCE LOG MODAL OVERLAY */}
      <AnimatePresence>
        {isModalOpen && selectedWorker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Modal Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            
            {/* Modal Box Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-2xl space-y-4 relative z-10"
            >
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 border border-slate-100 bg-slate-50 hover:bg-slate-100 rounded-xl h-8 w-8 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600 shrink-0">
                  <CircleDollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">
                    Issue Cash Advance
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    This debit transaction will log directly into the dynamic Cashbook pipeline database.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs font-bold text-slate-600 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> 
                  <span>Worker Target:</span> 
                  <span className="text-slate-900 font-black ml-auto">{selectedWorker.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> 
                  <span>Identity Roster Tag:</span> 
                  <span className="font-mono font-bold text-slate-900 ml-auto">{selectedWorker.identityId}</span>
                </div>
              </div>

              <form onSubmit={handleSubmitAdvance} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider pl-0.5">
                    Advance Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    placeholder="Enter cash payout amount (e.g., 2000)"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:border-orange-500 rounded-xl px-3.5 py-3 text-xs sm:text-sm outline-none focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider pl-0.5">
                    Cashbook Log Description
                  </label>
                  <textarea
                    value={advanceDescription}
                    onChange={(e) => setAdvanceDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs outline-none h-20 transition-all focus:bg-white resize-none"
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/10 disabled:opacity-50"
                  >
                    {modalLoading ? "Processing Outflow..." : "Issue Advance Cash"}
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