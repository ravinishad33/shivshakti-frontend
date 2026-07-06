import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PageNotFound() {
  const navigate = useNavigate();

  // Container structural variant layout
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.15 
      }
    }
  };

  // Fade-in children items macro variants
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-orange-500 selection:text-white flex flex-col overflow-x-hidden antialiased">
      
      {/* 1. Public Top Navigation Header Bar (Matches Homepage & Auth Theme) */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-12 py-4 flex justify-between items-center shadow-sm z-50">
        <div className="flex flex-col cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
            Shivshakti <span className="text-orange-500">Construction</span>
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Building Trust, Delivering Excellence
          </span>
        </div>
        
        <div className="hidden sm:block">
          <a 
            href="#contact" 
            onClick={() => navigate('/#contact')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/10"
          >
            Get a Free Quote
          </a>
        </div>
      </header>

      {/* 2. Main Centered 404 Visual Content Section */}
      <div className="flex-1 bg-gradient-to-tr from-slate-50 via-white to-slate-100/50 relative flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden z-10">
        
        {/* 🔮 Background Floating Ambient Glass Blobs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            x: [0, 30, 0],
            y: [0, -40, 0] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-64 h-64 md:w-96 md:h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -40, 0],
            y: [0, 30, 0] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-20 -right-20 w-64 h-64 md:w-96 md:h-96 rounded-full bg-slate-400/10 blur-3xl pointer-events-none" 
        />

        {/* 📱 Main Responsive Structural Blueprint Box Wrapper */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[95%] sm:max-w-md text-center bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xl space-y-6 relative z-10"
        >
          
          {/* 🚨 Animated 404 Status Counter Badge */}
          <motion.div variants={itemVariants} className="relative flex justify-center">
            <motion.div 
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-orange-500/15 blur-2xl rounded-full w-28 h-28 mx-auto" 
            />
            <motion.h1 
              drag
              dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
              whileDrag={{ scale: 1.1 }}
              className="text-6xl sm:text-7xl md:text-8xl font-black text-slate-900 relative tracking-widest font-mono select-none cursor-grab active:cursor-grabbing drop-shadow-sm bg-gradient-to-b from-slate-900 to-slate-800 bg-clip-text text-transparent"
            >
              404
            </motion.h1>
          </motion.div>

          {/* 📝 Messaging Hierarchy */}
          <motion.div variants={itemVariants} className="space-y-3 px-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Blueprint Route Missing
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-[290px] sm:max-w-none mx-auto">
              The project module parameter layout you are exploring could not be reached. It may have been relocated to an authorized zone or archived.
            </p>
          </motion.div>

          {/* 🏗️ Interactive Structural Separator */}
          <motion.div 
            variants={itemVariants} 
            className="flex items-center justify-center gap-2 opacity-60"
          >
            <div className="h-[2px] w-8 sm:w-12 bg-slate-200 rounded-full" />
            <motion.span 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-base select-none"
            >
              🏗️
            </motion.span>
            <div className="h-[2px] w-8 sm:w-12 bg-slate-200 rounded-full" />
          </motion.div>

          {/* 🚀 Dynamic Mobile-Friendly Navigation Buttons */}
          <motion.div 
            variants={itemVariants} 
            className="flex flex-col sm:flex-row gap-3 pt-2 text-xs sm:text-sm font-bold"
          >
            <motion.button
              type="button"
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:flex-1 bg-slate-50 text-slate-600 border border-slate-200 px-4 py-3.5 rounded-2xl transition-all shadow-sm"
            >
              ← Go Back
            </motion.button>
            
            <motion.div className="w-full sm:flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/"
                className="w-full h-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3.5 rounded-2xl shadow-md shadow-orange-500/15 flex items-center justify-center gap-1.5 transition-colors"
              >
                ⚡ Return Home
              </Link>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>

      {/* 3. Footer License Plate (Matches Homepage Theme) */}
      <footer className="bg-slate-950 text-slate-500 py-8 text-center text-xs font-medium border-t border-slate-900 px-4">
        <p>© 2026 Shivshakti Construction. All Rights Reserved.</p>
        <p className="text-[10px] text-slate-600 mt-1 tracking-wide">
          Architected with High-Performance Digital Solutions by <span className="text-orange-500 font-bold tracking-normal">Ravi Nishad</span>.
        </p>
      </footer>

    </div>
  );
}