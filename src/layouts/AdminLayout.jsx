import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Import required clean UI navigation icons from lucide-react
import {
  LayoutDashboard,
  User,
  HardHat,
  CalendarCheck2,
  BookOpen,
  Banknote,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Updated navigation data mapping to cleanly ingest components instead of string literals
  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      path: "/admin/profile",
      label: "Profile",
      icon: <User className="w-4 h-4" />,
    },
    {
      path: "/admin/labour",
      label: "Manage Labour",
      icon: <HardHat className="w-4 h-4" />,
    },
    {
      path: "/admin/attendance",
      label: "Attendance",
      icon: <CalendarCheck2 className="w-4 h-4" />,
    },
    {
      path: "/admin/cashbook",
      label: "Cashbook",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      path: "/admin/salary",
      label: "Manage Salary",
      icon: <Banknote className="w-4 h-4" />,
    },
    {
      path: "/admin/sites",
      label: "Manage Sites",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      path: "/admin/settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleAdminLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-500 selection:text-white overflow-hidden">
      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 1. Sidebar Navigation (Responsive Drawer Container) */}
      <aside
        className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-20 shrink-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Branding Hub */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-orange-500 uppercase bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
              Shivshakti
            </h1>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
              Construction
            </p>
          </div>
          {/* Close button inside drawer - Mobile Only */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close navigation panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Route Links Stack */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)} // Auto-close drawer on link click
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm transform hover:translate-x-1 ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 scale-[1.02]"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div
                  className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-white"} transition-colors shrink-0`}
                >
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Metadata Plate */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-center text-[10px] font-bold tracking-wider text-slate-500">
          v1.0.0 • 2026
        </div>
      </aside>

      {/* 2. Right Main Working Workspace Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Control Breadcrumb Status Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shadow-sm z-10 w-full">
          {/* Left Header Section (Hamburger + Breadcrumb) */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger Button - Mobile Only */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 sm:gap-2 overflow-hidden whitespace-nowrap text-xs sm:text-sm">
              <span className="text-slate-400 font-semibold hidden sm:inline">
                Workspace /
              </span>
              <h2 className="font-black text-slate-900 truncate capitalize tracking-tight">
                {location.pathname.split("/").pop() || "Dashboard"} Panel
              </h2>
            </div>
          </div>

          {/* User Profile Info & Sign Out Trigger Bar */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-900 leading-none">
                {user?.name || "Administrator"}
              </p>
              <span className="text-[9px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-orange-100">
                Central Admin
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            <button
              onClick={handleAdminLogout}
              className="text-xs font-bold text-red-600 hover:bg-red-50 active:scale-95 border border-red-200/60 px-3 sm:px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Inner Content Rendering Window Container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-8 bg-gradient-to-tr from-slate-50 via-slate-50/60 to-slate-100/40">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
