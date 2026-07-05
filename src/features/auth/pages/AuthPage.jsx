import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AuthPage() {
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  // UI States
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login Inputs State
  const [identityId, setIdentityId] = useState("");
  const [password, setPassword] = useState("");

  // Form Submission Logic
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identityId.trim() || !password.trim()) {
      setError("Please provide both identity ID and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${baseURL}/api/auth/login`,
        {
          identityId: identityId.trim(),
          password: password.trim(),
        },
      );

      const { token, role, name } = response.data;

      // Save tokens securely to local browser storage spaces
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userName", name);

      // Dynamic routing splits based on worker or manager roles
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/labour/dashboard");
      }
    } catch (error) {
      const fallbackError =
        error.response?.data?.message ||
        "Connection failed to Shivshakti backend core system.";
      setError(fallbackError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 overflow-hidden select-none font-sans">
      {/* 🔮 ANIMATED BACKGROUND ORBS */}
      <div className="absolute top-1/4 -left-16 w-72 h-72 md:w-96 md:h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 -right-16 w-72 h-72 md:w-96 md:h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse pointer-events-none delay-1000" />

      {/* 🏢 MAIN GLASS CARD MODULE CONTAINER */}
      <div className="relative w-full max-w-md bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300 hover:border-slate-700/80">
        {/* Brand Banner Section */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 md:p-8 text-center border-b border-slate-800">
          <div className="inline-block p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 mb-3 text-2xl shadow-inner">
            🏗️
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-wide uppercase">
            Shivshakti <span className="text-orange-500">Construction</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">
            Staff & Workforce Control Dashboard
          </p>
        </div>

        {/* Security Alert Header Strip */}
        <div className="bg-slate-950/40 px-6 py-2.5 border-b border-slate-800/60 text-center text-[10px] md:text-xs font-semibold text-slate-400 flex items-center justify-center gap-1.5">
          <span>🔒</span> Restricted Management Terminal. Contact Admin for
          keys.
        </div>

        <div className="p-6 md:p-8 space-y-5">
          {/* Dynamic Error Interceptor Box */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold p-3.5 rounded-xl animate-shake flex items-start gap-2 leading-relaxed">
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Core Login Form Elements */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Input Component 1: Unique User ID Key */}
            <div className="space-y-1">
              <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                Identity ID
              </label>
              <div className="relative">
                <input
                  required
                  type="text"
                  disabled={loading}
                  placeholder="admin@shivshakti.com or L-102"
                  className="w-full bg-slate-950/50 text-white border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 p-3 rounded-xl text-xs md:text-sm outline-none transition-all placeholder:text-slate-600 disabled:opacity-50"
                  value={identityId}
                  onChange={(e) => setIdentityId(e.target.value)}
                />
                <span className="absolute right-3.5 top-3.5 text-xs text-slate-600 pointer-events-none">
                  👤
                </span>
              </div>
            </div>

            {/* Input Component 2: Secret Account Password Card Field */}
            <div className="space-y-1">
              <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                Security Passkey
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  disabled={loading}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 text-white border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 p-3 rounded-xl text-xs md:text-sm outline-none transition-all placeholder:text-slate-600 tracking-wide disabled:opacity-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* Interactive Visibility Toggle Button */}
                <button
                  type="button"
                  tabIndex="-1"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 text-xs font-bold transition-colors select-none focus:outline-none"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {/* Form Master Submit Processing Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg hover:shadow-orange-500/10 active:scale-[0.99] disabled:scale-100 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Verifying Authority...</span>
                  </>
                ) : (
                  <span>Verify Credentials →</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
