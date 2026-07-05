import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ManageSalary() {

  const baseURL = import.meta.env.VITE_BACKEND_URL;



  // Core Operational States
  const [salaryRoster, setSalaryRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🆕 Advance Pop-up Modal UI States
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
                if (log.status === "Half-Day") fullPresentCount++;
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

          // Safe extraction of the site ObjectId field reference path string from the worker item configuration blueprint mapping
          const assignedSiteObjectId = worker.site?._id || worker.site || "";

          return {
            _id: worker._id,
            identityId: worker.identityId,
            name: worker.name,
            role: worker.role || "Labour / Helper",
            dailyWage: worker.dailyWage || 400,
            siteId: assignedSiteObjectId, // 🚀 Saved explicitly for the Modal submit transaction pipeline payload
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

  // 🆕 Submit Advance Request directly to the active Cashbook API
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
      // 🚀 FIXED: Injects the valid site reference configuration token parsed inside the worker profile payload
      const targetSiteId = selectedWorker.siteId || "6a44f95ee9d755ee52f9bb0e";

      await axios.post(
        "${baseURL}/api/cashbook/entry",
        {
          type: "Debit",
          category: "Labour Advance",
          amount: Number(advanceAmount),
          description: advanceDescription.trim(),
          date: structuredDate,
          siteId: targetSiteId, // Passed cleanly to conform directly to unified controller body key maps
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success(
        `₹${advanceAmount} advance logged successfully for ${selectedWorker.name}! 💸`,
      );
      setIsModalOpen(false);
      compileMonthlySalaryLedger(); // Refresh table fields instantly!
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
    <div className="space-y-6 p-2 max-w-7xl mx-auto relative">
      {/* Header Info Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-800">
            Automated Salary Engine
          </h3>
          <p className="text-xs md:text-sm text-slate-500">
            Live payroll processing pipeline synced with dynamic attendance
            records and advance balances.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
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

          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-800">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Net Monthly Outflow
            </p>
            <p className="text-base md:text-lg font-bold text-orange-400 mt-0.5">
              {formatCurrency(totalPayrollOutflow)}
            </p>
          </div>
        </div>
      </div>

      {/* Roster Accounting Matrix Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <th className="p-4">Labour Details</th>
                <th className="p-4">Daily Rate</th>
                <th className="p-4">Total Present (Days)</th>
                <th className="p-4">Hours Worked</th>
                <th className="p-4">Gross Earned</th>
                <th className="p-4 text-red-400">Advance Debited</th>
                <th className="p-4 text-emerald-400">Net Payable</th>
                <th className="p-4 text-right">Actions Pipeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="p-8 text-center text-xs text-slate-400 font-medium"
                  >
                    Processing multi-module transactional sheets balances...
                  </td>
                </tr>
              ) : salaryRoster.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="p-8 text-center text-xs text-slate-400 font-medium"
                  >
                    No active workforce profiles detected in ledger database
                    files.
                  </td>
                </tr>
              ) : (
                salaryRoster.map((worker) => {
                  const gross = calculateGrossSalary(
                    worker.dailyWage,
                    worker.totalPresentDays,
                  );
                  const net = calculateNetSalary(
                    worker.dailyWage,
                    worker.totalPresentDays,
                    worker.advanceTaken,
                  );

                  return (
                    <tr
                      key={worker._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {worker.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 tracking-tight mt-0.5">
                          ID: {worker.identityId} •{" "}
                          <span className="capitalize">{worker.role}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">
                        ₹{worker.dailyWage}
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        {worker.totalPresentDays} Days
                      </td>
                      <td className="p-4 font-mono font-bold text-indigo-600">
                        {worker.totalHoursWorked} Hrs
                      </td>
                      <td className="p-4 font-semibold text-slate-800">
                        ₹{gross}
                      </td>
                      <td className="p-4 text-red-600 font-semibold">
                        - ₹{worker.advanceTaken}
                      </td>
                      <td
                        className={`p-4 font-bold text-base ${
                          net < 0 ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        ₹{net}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openAdvanceModal(worker)}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            💸 Advance
                          </button>
                          <button
                            onClick={() => handlePrintPayslip(worker)}
                            className="bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            📄 Receipt
                          </button>
                          <button
                            onClick={() => handleShareWhatsApp(worker)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            💬 Share
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔮 INTERACTIVE ADVANCE LOG MODAL OVERLAY */}
      {isModalOpen && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-2xl space-y-4">
            <div>
              <span className="text-xl bg-orange-100 p-2 rounded-xl text-orange-600">
                💸
              </span>
              <h4 className="text-lg font-black text-slate-900 tracking-tight pt-3">
                Give Cash Advance
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                This transaction drops directly into the live Cashbook
                collection as a debit.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-600 space-y-1">
              <p>
                👷 <span className="text-slate-400">Worker:</span>{" "}
                <span className="text-slate-800 font-black">
                  {selectedWorker.name}
                </span>
              </p>
              <p>
                🆔 <span className="text-slate-400">Identity Tag:</span>{" "}
                <span className="font-mono font-bold text-slate-800">
                  {selectedWorker.identityId}
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmitAdvance} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider pl-0.5">
                  Advance Amount (₹)
                </label>
                <input
                  type="number"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider pl-0.5">
                  Cashbook Log Description
                </label>
                <textarea
                  value={advanceDescription}
                  onChange={(e) => setAdvanceDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:border-orange-500 rounded-xl px-3 py-2 text-xs outline-none h-20 transition-all resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/10 disabled:opacity-50"
                >
                  {modalLoading
                    ? "Processing Outflow..."
                    : "Issue Advance Cash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
