import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard', label: '📊 Dashboard' },
    { path: '/admin/profile', label: '👤 Profile' },
    { path: '/admin/labour', label: '👷 Manage Labour' },
    { path: '/admin/attendance', label: '📅 Attendance' },
    { path: '/admin/cashbook', label: '📖 Cashbook' },
    { path: '/admin/salary', label: '💰 Manage Salary' },
    { path: '/admin/sites', label: '🚧 Manage Sites' },

    { path: '/admin/settings', label: '⚙️ Settings' },
  ];

  const handleAdminLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-500 selection:text-white overflow-hidden">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 1. Sidebar Navigation (Responsive: Sliding Drawer on Mobile, Fixed Sidebar on Desktop) */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-20
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Branding Hub */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-orange-500 uppercase bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
              Shivshakti
            </h1>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">Construction Suite</p>
          </div>
          {/* Close button inside drawer - Mobile Only */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
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
                className={`block px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm transform hover:translate-x-1 ${
                  isActive 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 scale-[1.02]' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Metadata Plate */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-center text-[10px] font-bold tracking-wider text-slate-500">
          v1.0.0 • 2026 ENGINE
        </div>
      </aside>

      {/* 2. Right Main Working Workspace Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        
        {/* Top Control Breadcrumb Status Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shadow-sm z-10 w-full">
          
          {/* Left Header Section (Hamburger + Breadcrumb) */}
          <div className="flex items-center gap-3">
            {/* Hamburger Button - Shown only on Mobile/Tablet */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
              aria-label="Open Navigation Menu"
            >
              ☰
            </button>
            
            <div className="flex items-center gap-1 sm:gap-2 overflow-hidden whitespace-nowrap">
              <span className="text-slate-400 text-xs sm:text-sm font-medium hidden xs:inline">Workspace /</span>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate capitalize tracking-tight">
                {location.pathname.split('/').pop() || 'Dashboard'} Panel
              </h2>
            </div>
          </div>

          {/* User Session Profile & Logout Trigger Layout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || 'Administrator'}</p>
              <span className="text-[9px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-orange-100">
                Central Admin
              </span>
            </div>
            
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            
            <button 
              onClick={handleAdminLogout}
              className="text-xs font-bold text-red-600 hover:bg-red-50 active:scale-95 border border-red-200/60 px-3 sm:px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Inner Content Rendering Window */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-8 bg-gradient-to-tr from-slate-50 via-slate-50/60 to-slate-100/40">
          <Outlet />
        </main>
      </div>

    </div>
  );
}