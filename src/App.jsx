import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast"; // 🆕 Import the global toaster provider

/**
 * Root Application Entry Component
 * * In an industry-standard environment, this is where you would also wrap
 * your application with global contexts such as:
 * - AuthProvider (User sessions)
 * - AttendanceProvider / SalaryProvider (Shared module states if necessary)
 * - ThemeProvider (Tailwind UI configurations)
 */
export default function App() {
  return (
    <>
      {/* 🥞 Attractive, Dark Slate-Themed Toast Alerts Configuration Layer */}
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a', // Sleek dark slate theme matching your backend layouts
            color: '#ffffff',      // Clean typography contrast
            border: '1px solid rgba(51, 65, 85, 0.4)', // Sharp subtle border accentuation
            borderRadius: '12px',
            fontSize: '13px',
            padding: '12px 16px',
            fontFamily: 'sans-serif'
          },
          success: {
            iconTheme: {
              primary: '#f97316', // Orange theme match indicator matching your design profile
              secondary: '#ffffff',
            },
          },
        }}
      />

      <AuthProvider>
        {/* Central Route Engine */}
        <AppRoutes />
      </AuthProvider>
    </>
  );
}