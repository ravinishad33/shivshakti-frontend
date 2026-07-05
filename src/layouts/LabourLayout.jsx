import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";

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

  // Shared navigation items configuration matrix
  const navItems = [
    {
      path: "/labour/dashboard",
      label: "My Payslip",
      icon: "📊",
    },
    {
      path: "/labour/profile",
      label: "My Profile",
      icon: "👤",
    },
    {
      path: "#advance",
      label: "Ask Advance",
      icon: "💸",
      action: () =>
        toast.error(
          "Advance request engine coming soon! Contact your supervisor.",
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-100 antialiased overflow-x-hidden">
      {/* 🔮 SIDEBAR NAVIGATION (Hidden on mobile, layout locks on Desktop md+) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-5 justify-between shrink-0 h-screen sticky top-0 z-50">
        <div className="space-y-6">
          {/* Header Branding */}
          <div className="flex items-center gap-3 px-2 py-1.5 border-b border-slate-800/60 pb-4">
            <span className="text-xl bg-slate-800 p-2 rounded-xl border border-slate-700">
              🏗️
            </span>
            <div>
              <h1 className="text-xs font-black tracking-widest text-orange-500 uppercase">
                Shivshakti Portal
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
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/10"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  <span className={`text-base ${isActive ? "scale-110" : ""}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Details Block with Exit Command */}
        <div className="bg-slate-950/40 p-3.5 border border-slate-800/60 rounded-2xl space-y-3">
          <div className="flex items-center gap-2.5">
            {/* Dynamic Profile Avatar Image / Icon Fallback directly matching User Collection */}
            {profile?.profilePhoto ? (
              <img
                src={`${baseURL}/${profile?.profilePhoto}`}
                alt="User Badge"
                className="w-9 h-9 object-cover border border-slate-700 rounded-xl bg-slate-800 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 bg-slate-800 border border-slate-700 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                👷
              </div>
            )}
            <div className="truncate flex-1">
              {/* 🚀 DYNAMIC LOOKUP: Replaced placeholder values with active User state payload keys */}
              <p className="text-xs font-black text-white truncate">
                Namaste, {getFirstName(profile?.name || "" )}
              </p>
              <p className="text-[9px] font-mono font-bold text-slate-500 mt-0.5 tracking-wider">
                {profile?.identityId || "N/A"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLabourLogout}
            disabled={exitLoading}
            className="w-full text-center bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all text-[11px] font-black py-2 rounded-xl tracking-wider uppercase border border-rose-500/20 shadow-xs active:scale-[0.98] disabled:opacity-50"
          >
            {exitLoading ? "Exiting System..." : "Logout"}
          </button>
        </div>
      </aside>

      {/* 🔮 MAIN VIEWPORT ENGINE GRID CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile View Top Fixed Header (Hidden on Desktop) */}
        <header className="md:hidden sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md text-white px-4 py-3.5 shadow-md flex justify-between items-center border-b border-slate-800">
          <div>
            <h1 className="text-xs font-black tracking-widest bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent uppercase">
              Shivshakti Portal
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
              Namaste, {getFirstName(user?.name)}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* 🚀 DYNAMIC LOOKUP: Aligned Mobile Header mapping vector to match target schema layout key */}
            <span className="text-[9px] font-mono font-bold text-orange-400 bg-slate-950/60 px-2 py-1 rounded-md border border-slate-800">
              {user?.identityId || "N/A"}
            </span>
            <button
              onClick={handleLabourLogout}
              disabled={exitLoading}
              className="text-[10px] font-black bg-gradient-to-r from-rose-600 to-red-600 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all uppercase tracking-wider disabled:opacity-50 active:scale-95"
            >
              {exitLoading ? "..." : "Exit"}
            </button>
          </div>
        </header>

        {/* Core Content Loading Section */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto bg-slate-950 relative">
          {/* Subtle Background Ambience Orbs */}
          <div className="absolute top-10 left-10 w-48 h-48 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto w-full relative z-10">
            <Outlet />
          </div>
        </main>

        {/* Mobile View Bottom Navigation Dock (Hidden on Desktop) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 shadow-2xl flex items-center justify-around h-16 px-6 pb-safe">
          <div className="flex w-full max-w-md justify-around items-center">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={index}
                  onClick={item.action || (() => navigate(item.path))}
                  className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "text-orange-500 font-extrabold bg-orange-500/5 border border-orange-500/10"
                      : "text-slate-500 font-medium hover:text-slate-300"
                  }`}
                >
                  <span
                    className={`text-lg transition-transform ${isActive ? "scale-110" : ""}`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[10px] tracking-wide mt-0.5 font-bold uppercase">
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
