import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";

// Import clean navigation vector icons from lucide-react
import {
  Building2,
  FileSpreadsheet,
  User,
  HandCoins,
  HardHat,
  LogOut,
  Settings, // 🆕 Added settings icon configuration
} from "lucide-react";

export default function LabourLayout() {
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [exitLoading, setExitLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    identityId: "",
    role: "labour",
    profilePhoto: "",
    createdAt: "",
  });

  const handleLabourLogout = () => {
    setExitLoading(true);

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");

    setTimeout(() => {
      logout();
      navigate("/");
      toast.success("Logged out securely. Have a great day! 👋");
    }, 800);
  };

  const fetchLabourProfileDetails = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${baseURL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your structural profile data matrix.");
    }
  };

  useEffect(() => {
    fetchLabourProfileDetails();
  }, []);

  // Safe helper to extract first name strings from backend data payload
  const getFirstName = (fullName) => {
    if (!fullName) return "Worker";
    return fullName.trim().split(" ")[0];
  };

  // 🆕 Shared navigation items configuration matrix updated with Settings routing path
  const navItems = [
    {
      path: "/labour/dashboard",
      label: "My Payslip",
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      path: "/labour/profile",
      label: "My Profile",
      icon: <User className="w-4 h-4" />,
    },
    {
      path: "/labour/settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      path: "#advance",
      label: "Ask Advance",
      icon: <HandCoins className="w-4 h-4" />,
      action: () =>
        toast.error(
          "Advance request engine coming soon! Contact your supervisor.",
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-100 antialiased overflow-x-hidden">
      {/* 🔮 SIDEBAR NAVIGATION (Hidden on mobile, locks on Desktop md+) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-5 justify-between shrink-0 h-screen sticky top-0 z-50">
        <div className="space-y-6">
          {/* Header Branding */}
          <div className="flex items-center gap-3 px-2 py-1.5 border-b border-slate-800/60 pb-4">
            <span className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-orange-500">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xs font-black tracking-widest text-orange-500 uppercase">
                Shivshakti Construction
              </h1>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-wide">
                Workforce Terminal
              </p>
            </div>
          </div>

          {/* Nav Links Stack Loop */}
          <nav className="space-y-1.5">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={index}
                  onClick={item.action || (() => navigate(item.path))}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/10"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  <div
                    className={`${isActive ? "text-white scale-110" : "text-slate-500 group-hover:text-slate-300"} transition-all shrink-0`}
                  >
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Details Block with Exit Command */}
        <div className="bg-slate-950/40 p-3.5 border border-slate-800/60 rounded-2xl space-y-3">
          <div className="flex items-center gap-2.5">
            {profile?.profilePhoto ? (
              <img
                src={`${baseURL}/${profile?.profilePhoto}`}
                alt="User Badge"
                className="w-9 h-9 object-cover border border-slate-700 rounded-xl bg-slate-800 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 bg-slate-950 border border-slate-800 text-slate-500 rounded-xl flex items-center justify-center font-bold text-sm">
                <HardHat className="w-4 h-4" />
              </div>
            )}
            <div className="truncate flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate">
                Namaste, {getFirstName(profile?.name || "")}
              </p>
              <p className="text-[9px] font-mono font-bold text-slate-500 mt-0.5 tracking-wider truncate">
                {profile?.identityId || "N/A"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLabourLogout}
            disabled={exitLoading}
            className="w-full flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-50 text-rose-400 hover:text-rose-700 transition-colors text-[11px] font-black py-2 rounded-xl tracking-wider uppercase border border-rose-500/20 shadow-xs disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{exitLoading ? "Exiting System..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      {/* 🔮 MAIN VIEWPORT ENGINE GRID CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile View Top Fixed Header (Hidden on Desktop) */}
        <header className="md:hidden sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md text-white px-4 py-3.5 shadow-md flex justify-between items-center border-b border-slate-800">
          <div className="min-w-0 flex-1 pr-2">
            <h1 className="text-xs font-black tracking-widest bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent uppercase truncate">
              Shivshakti Construction
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5 truncate">
              Namaste, {getFirstName(user?.name)}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[9px] font-mono font-bold text-orange-400 bg-slate-950/60 px-2 py-1 rounded-md border border-slate-800">
              {user?.identityId || "N/A"}
            </span>
            <button
              onClick={handleLabourLogout}
              disabled={exitLoading}
              className="text-[10px] font-black bg-gradient-to-r from-rose-600 to-red-600 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all uppercase tracking-wider disabled:opacity-50 active:scale-95"
            >
              {exitLoading ? "..." : "Logout"}
            </button>
          </div>
        </header>

        {/* Core Content Loading Section */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto bg-slate-950 relative">
          <div className="absolute top-10 left-10 w-48 h-48 bg-orange-600/5 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-4xl mx-auto w-full relative z-10">
            <Outlet />
          </div>
        </main>

        {/* Mobile View Bottom Navigation Dock (Hidden on Desktop) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 shadow-2xl flex items-center justify-around h-16 px-2 pb-safe">
          <div className="flex w-full max-w-md justify-around items-center">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={index}
                  onClick={item.action || (() => navigate(item.path))}
                  className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-95 group ${
                    isActive
                      ? "text-orange-500 font-extrabold bg-orange-500/5 border border-orange-500/10"
                      : "text-slate-500 font-medium hover:text-slate-300"
                  }`}
                >
                  <div
                    className={`transition-transform ${isActive ? "text-orange-500 scale-110" : "text-slate-500 group-hover:text-slate-300"}`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[9px] tracking-wide mt-1 font-bold uppercase whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
