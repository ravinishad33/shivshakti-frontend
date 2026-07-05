import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Attendance() {
  const baseURL = import.meta.env.VITE_BACKEND_URL;


  // Core Database States
  const [workers, setWorkers] = useState([]);
  const [sites, setSites] = useState([]);
  const [crossSiteLogs, setCrossSiteLogs] = useState([]);

  // Active Dropdown Target Choices
  const [selectedSiteId, setSelectedSiteId] = useState("");

  // Enforce boundary logic context to get today's exact format marker string (YYYY-MM-DD)
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDateString);

  // Report View Selection Filter (Format: YYYY-MM)
  const [reportMonth, setReportMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7); // Defaults to current month
  });

  // State to hold compiled analytical history matrices for the report section
  const [compiledReportData, setCompiledReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  // Attendance records state map tracking local interaction changes: { 'workerMongoId': 'Present' }
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // UI Processing Loaders
  const [pageLoading, setPageLoading] = useState(true);
  const [saveLoading, setLoading] = useState(false);

  // Helper: Convert HTML Input Date format (YYYY-MM-DD) to backend format (dd:mm:yy)
  const formatBackendDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}:${month}:${year.slice(-2)}`;
  };

  // Rapid-Mark Roster Modification Handler
  const handleBulkRapidMark = (targetStatus) => {
    if (workers.length === 0) return;

    const bulkUpdatedRecords = {};
    workers.forEach((worker) => {
      bulkUpdatedRecords[worker._id] = targetStatus;
    });

    setAttendanceRecords(bulkUpdatedRecords);
    toast.success(
      `Roster macro configured: Marked everyone as ${targetStatus}! ⚡`,
      { id: "bulk-macro" },
    );
  };

  // 1. Initial Load: Fetch master construction sites and active workers roster concurrently
  useEffect(() => {
    const fetchCoreModuleContextData = async () => {
      const token = localStorage.getItem("token");
      try {
        const sitesResponse = await axios.get(
          `${baseURL}/api/sites`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const fetchedSites = sitesResponse.data || [];
        if (fetchedSites.length === 0) {
          fetchedSites.push({
            _id: "default_site",
            name: "Main Construction Site",
          });
        }

        setSites(fetchedSites);
        setSelectedSiteId(fetchedSites[0]._id);

        const workersResponse = await axios.get(
          `${baseURL}/api/auth/workers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const workerData = workersResponse.data || [];
        setWorkers(workerData);

        const defaultRecords = {};
        workerData.forEach((worker) => {
          defaultRecords[worker._id] = "Present";
        });
        setAttendanceRecords(defaultRecords);
      } catch (error) {
        console.error("Context parsing errors:", error);
        setSites([{ _id: "default_site", name: "Main Construction Site" }]);
        setSelectedSiteId("default_site");
        toast.error("Connecting to local storage fallbacks...", {
          id: "context-fallback",
        });
      } finally {
        setPageLoading(false);
      }
    };

    fetchCoreModuleContextData();
  }, []);

  // 2. Dynamic Data Sync: Fetch saved attendance logs whenever date or site selection fields change
  useEffect(() => {
    if (!selectedSiteId || workers.length === 0) return;

    const fetchExistingAttendanceLog = async () => {
      const token = localStorage.getItem("token");
      const formattedTargetDate = formatBackendDate(selectedDate);

      try {
        const response = await axios.get(
          `${baseURL}/api/attendance/summary`,
          {
            params: { date: formattedTargetDate, siteId: selectedSiteId },
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const updatedRecords = {};

        if (
          response.data &&
          response.data.records &&
          response.data.records.length > 0
        ) {
          response.data.records.forEach((rec) => {
            if (rec.workerId) {
              updatedRecords[rec.workerId._id || rec.workerId] = rec.status;
            }
          });
          toast.success(`Loaded saved logs for ${formattedTargetDate}`, {
            id: "log-sync",
          });
        } else {
          workers.forEach((worker) => {
            updatedRecords[worker._id] = "Present";
          });
        }
        setAttendanceRecords(updatedRecords);
        setCrossSiteLogs(response.data?.records || []);
      } catch (error) {
        const defaultRecords = {};
        workers.forEach((worker) => {
          defaultRecords[worker._id] = "Present";
        });
        setAttendanceRecords(defaultRecords);
      }
    };

    fetchExistingAttendanceLog();
  }, [selectedDate, selectedSiteId, workers]);

  // 🚀 3. FIXED: Extracted monthly report generation engine to be standalone and reusable
  const generateMonthlyAnalyticsReport = async () => {
    if (workers.length === 0) return;
    setReportLoading(true);
    const token = localStorage.getItem("token");
    const [year, month] = reportMonth.split("-");
    const monthSegment = `:${month}:${year.slice(-2)}`;

    try {
      const response = await axios.get(
        `${baseURL}/api/attendance/summary`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const allLogs = response.data?.records || [];

      const compiled = workers.map((worker) => {
        let present = 0;
        let halfDay = 0;
        let absent = 0;

        allLogs.forEach((log) => {
          const matchWorker =
            log.workerId?._id === worker._id || log.workerId === worker._id;
          if (matchWorker && log.date?.endsWith(monthSegment)) {
            if (log.status === "Present") present++;
            if (log.status === "Half-Day") halfDay++;
            if (log.status === "Absent") absent++;
          }
        });

        const totalDaysPresentWeighted = present + halfDay * 0.5;
        const calculatedHours = present * 8 + halfDay * 4;

        const totalShiftsLogged = present + halfDay + absent;
        const attendancePercentage =
          totalShiftsLogged > 0
            ? Math.round((totalDaysPresentWeighted / totalShiftsLogged) * 100)
            : 0;

        return {
          _id: worker._id,
          identityId: worker.identityId,
          name: worker.name,
          role: worker.role || "Labour",
          present,
          halfDay,
          absent,
          totalPresentDays: totalDaysPresentWeighted,
          totalHours: calculatedHours,
          percentage: attendancePercentage,
        };
      });

      setCompiledReportData(compiled);
    } catch (err) {
      console.error("Report generation layer failed:", err);
    } finally {
      setReportLoading(false);
    }
  };

  // Re-trigger calculation automatically whenever month or target workers array shifts
  useEffect(() => {
    generateMonthlyAnalyticsReport();
  }, [reportMonth, workers]);

  const handleStatusChange = (workerId, newStatus) => {
    if (newStatus === "Present" || newStatus === "Half-Day") {
      const existingAssignment = crossSiteLogs.find(
        (log) =>
          (log.workerId?._id === workerId || log.workerId === workerId) &&
          log.siteId !== selectedSiteId &&
          (log.status === "Present" || log.status === "Half-Day"),
      );

      if (existingAssignment) {
        toast.error(
          `🚫 Worker already checked in at another site location on this date string!`,
          { id: `collision-${workerId}` },
        );
        return;
      }
    }

    setAttendanceRecords((prev) => ({ ...prev, [workerId]: newStatus }));
  };

  const getSummaryCount = (statusType) => {
    return Object.values(attendanceRecords).filter(
      (status) => status === statusType,
    ).length;
  };

  const handleSaveAttendance = async () => {
    if (selectedDate > getTodayDateString()) {
      toast.error(
        "🚫 Access Blocked: Cannot mark or save attendance for tomorrow or future dates!",
      );
      return;
    }

    if (!selectedSiteId || selectedSiteId === "default_site") {
      toast.error(
        "Please add and select a valid operational construction project site first.",
      );
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    const recordsArray = Object.keys(attendanceRecords).map((workerId) => ({
      workerId: workerId,
      status: attendanceRecords[workerId],
    }));

    const formattedTargetDate = formatBackendDate(selectedDate);

    const attendancePromise = axios.post(
      `${baseURL}/api/attendance/save`,
      {
        date: formattedTargetDate,
        siteId: selectedSiteId,
        records: recordsArray,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    toast.promise(attendancePromise, {
      loading: `Writing daily ledger rolls for date [${formattedTargetDate}]...`,
      success: "Attendance log committed safely to database! 📝",
      error: (err) =>
        err.response?.data?.message ||
        "Failed to submit aggregate records array.",
    });

    try {
      await attendancePromise;
      // 🚀 FIXED: Calling the freshly extracted module method now executes perfectly!
      generateMonthlyAnalyticsReport();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium text-sm">
        Parsing structural operations matrices...
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto p-2">
      {/* SECTION 1: ATTENDANCE ENTRY MODULE */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800">
              Daily Attendance Log
            </h3>
            <p className="text-xs md:text-sm text-slate-500">
              Track and manage daily on-site workforce roll logs securely.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex-1 sm:flex-initial">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1">
                Site
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="border-0 bg-transparent text-xs font-bold text-slate-800 outline-none focus:ring-0 max-w-[180px]"
              >
                {sites.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex-1 sm:flex-initial">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1">
                Date
              </label>
              <input
                type="date"
                max={getTodayDateString()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-0 bg-transparent text-xs font-bold text-slate-800 focus:ring-0 outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Summary Counters widgets with RAPID-MARK MACRO BUTTONS */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Workforce
                </p>
                <p className="text-lg md:text-xl font-bold text-slate-900 mt-0.5">
                  {workers.length}
                </p>
              </div>
            </div>
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Present
                </p>
                <p className="text-lg md:text-xl font-bold text-emerald-800 mt-0.5">
                  {getSummaryCount("Present")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleBulkRapidMark("Present")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase py-1.5 rounded-lg transition-all shadow-xs"
              >
                ⚡ Mark All
              </button>
            </div>
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 shadow-sm flex flex-col justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                  Half-Day
                </p>
                <p className="text-lg md:text-xl font-bold text-amber-800 mt-0.5">
                  {getSummaryCount("Half-Day")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleBulkRapidMark("Half-Day")}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase py-1.5 rounded-lg transition-all shadow-xs"
              >
                ⚡ Mark All
              </button>
            </div>
            <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-100 shadow-sm flex flex-col justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                  Absent
                </p>
                <p className="text-lg md:text-xl font-bold text-rose-800 mt-0.5">
                  {getSummaryCount("Absent")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleBulkRapidMark("Absent")}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase py-1.5 rounded-lg transition-all shadow-xs"
              >
                ⚡ Mark All
              </button>
            </div>
          </div>
        </div>

        {/* Main Roster Entry Matrix Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                  <th className="p-4 w-24">ID</th>
                  <th className="p-4">Labour Name</th>
                  <th className="p-4 w-36">Designation</th>
                  <th className="p-4 text-center w-80">
                    Attendance Status Selection
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {workers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-8 text-center text-xs text-slate-400 font-medium"
                    >
                      No registered workers found.
                    </td>
                  </tr>
                ) : (
                  workers.map((worker) => {
                    const currentStatus =
                      attendanceRecords[worker._id] || "Absent";
                    return (
                      <tr
                        key={worker._id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-4 text-slate-400 font-mono text-xs">
                          {worker.identityId}
                        </td>
                        <td className="p-4 font-semibold text-slate-900">
                          {worker.name}
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs capitalize">
                            {worker.role || "Labour"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center items-center gap-1.5 max-w-xs mx-auto">
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(worker._id, "Present")
                              }
                              className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${currentStatus === "Present" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(worker._id, "Half-Day")
                              }
                              className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${currentStatus === "Half-Day" ? "bg-amber-500 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                            >
                              Half-Day
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(worker._id, "Absent")
                              }
                              className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${currentStatus === "Absent" ? "bg-rose-500 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                            >
                              Absent
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

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveAttendance}
            disabled={saveLoading || workers.length === 0}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-semibold px-6 py-3 rounded-xl text-sm shadow-md transition-all disabled:cursor-not-allowed"
          >
            {saveLoading ? "Saving Ledger Logs..." : "Save Log Calculations"}
          </button>
        </div>
      </div>

      {/* SECTION 2: COMPREHENSIVE HISTORICAL REPORTS ENGINE WITH PRESENT MATRIX CALCULATIONS */}
      <div className="pt-6 border-t border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="text-xl font-bold text-slate-900">
              Workforce Cumulative Analytics Report
            </h4>
            <p className="text-xs text-slate-500">
              Review aggregated frequency allocations, weighted parameters, and
              fulfillment analytics.
            </p>
          </div>

          {/* Month Input Target Selector */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 w-full sm:w-auto">
            <label className="text-[10px] font-bold text-slate-400 uppercase px-1">
              Report Month
            </label>
            <input
              type="month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="border-0 bg-transparent text-xs font-bold text-slate-800 outline-none focus:ring-0 cursor-pointer flex-1 sm:flex-none"
            />
          </div>
        </div>

        {/* Detailed Analytical Report Output Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <th className="p-4">Labour Name Details</th>
                  <th className="p-4 text-center text-emerald-600">
                    Full Present (Days)
                  </th>
                  <th className="p-4 text-center text-amber-600">Half-Day (Days)</th>
                  <th className="p-4 text-center text-rose-600">Absent (Days)</th>
                  <th className="p-4 text-center text-teal-600 bg-teal-50/20">
                    Total Present (Days)
                  </th>
                  <th className="p-4 text-center text-indigo-600">
                    Total Hours Worked
                  </th>
                  <th className="p-4">Fulfillment Score / Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {reportLoading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-xs text-slate-400">
                      Compiling monthly structural analytic registers...
                    </td>
                  </tr>
                ) : compiledReportData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-xs text-slate-400">
                      No matching timeline parameters found.
                    </td>
                  </tr>
                ) : (
                  compiledReportData.map((report) => (
                    <tr key={report._id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{report.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: {report.identityId} • <span className="capitalize">{report.role}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-800 font-mono">{report.present}</td>
                      <td className="p-4 text-center font-bold text-slate-800 font-mono">{report.halfDay}</td>
                      <td className="p-4 text-center font-bold text-slate-400 font-mono">{report.absent}</td>
                      
                      <td className="p-4 text-center font-black text-teal-700 font-mono bg-teal-50/40">
                        {report.totalPresentDays} <span className="text-[10px] text-slate-400 font-medium font-sans">Days</span>
                      </td>

                      <td className="p-4 text-center font-black text-indigo-600 font-mono bg-indigo-50/30">
                        {report.totalHours} <span className="text-[10px] text-slate-400 font-semibold">Hrs</span>
                      </td>

                      {/* Metric Progress Bar indicators */}
                      <td className="p-4">
                        <div className="flex items-center gap-3 max-w-[180px]">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/40">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                report.percentage >= 80 ? 'bg-emerald-500' : report.percentage >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                              }`}
                              style={{ width: `${report.percentage}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-xs text-slate-900 whitespace-nowrap">{report.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}