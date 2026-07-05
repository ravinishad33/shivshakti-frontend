import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const services = [
    { title: 'Residential Landmark Creation', desc: 'Custom luxury villas, high-rise residential complexes, and modern housing environments engineered to perfection.', icon: '🏢' },
    { title: 'Commercial & Industrial Centers', desc: 'State-of-the-art office spaces, retail hubs, warehouses, and heavy engineering structural builds.', icon: '🏗️' },
    { title: 'Civil Infrastructure Works', desc: 'Precision layout design, foundation work, robust structural reinforcement, and vast scale earthworks.', icon: '🛣️' }
  ];

  const projects = [
    { title: 'Shakti Residency', type: 'Luxury Residential', location: 'Surat, Gujarat', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80' },
    { title: 'The Apex Corporate Hub', type: 'Commercial High-Rise', location: 'Commercial Zone', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80' },
    { title: 'Greenfield Industrial Complex', type: 'Heavy Infrastructure', location: 'Industrial Zone', img: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80' }
  ];

  // Animation configuration constants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden">
      
      {/* 1. Public Top Navigation Header Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-12 py-4 flex justify-between items-center shadow-sm">
        <div className="flex flex-col">
          <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
            Shivshakti <span className="text-orange-500">Construction</span>
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 uppercase break-words max-w-[240px] sm:max-w-none">
            Building Trust, Delivering Excellence
          </span>
        </div>
        
        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => navigate('/auth')}
            className="text-xs font-bold text-slate-600 hover:text-orange-500 transition-colors"
          >
            Portal Access Login →
          </button>
          <a 
            href="#contact" 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/10"
          >
            Get a Free Quote
          </a>
        </div>

        {/* Mobile Hamburger Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-orange-500 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu with Framer Motion AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-[65px] left-0 w-full bg-white border-b border-slate-200 z-40 shadow-lg p-4"
          >
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="w-full text-left py-2 text-sm font-bold text-slate-600 hover:text-orange-500 transition-colors"
              >
                Portal Access Login →
              </button>
              <a 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-3 rounded-xl transition-all block"
              >
                Get a Free Quote
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Hero Presentation Section */}
      <section className="relative bg-gradient-to-r from-slate-950 to-slate-900 text-white py-16 sm:py-24 lg:py-36 px-4 sm:px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1920&q=80')" }}></div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="max-w-4xl space-y-6 relative z-10 text-center md:text-left"
        >
          <span className="inline-block bg-orange-500/20 text-orange-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest px-3 py-1 rounded-md border border-orange-500/30 max-w-full">
            Engineering & Infrastructure Contracting
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
            We Turn Complex Blueprints <br className="hidden sm:inline" />Into Sustainable Realities.
          </h1>
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto md:mx-0 leading-relaxed">
            From iconic high-rise centers to state-of-the-art residential developments, Shivshakti Construction couples raw materials with advanced civil engineering to deliver structural engineering landmarks built to last generations.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center md:justify-start gap-3 sm:gap-4">
            <a href="#services" className="text-center bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20">
              Explore Our Services
            </a>
            <a href="#contact" className="text-center bg-transparent hover:bg-white/10 text-white border-2 border-white/30 font-bold text-sm px-6 py-3 rounded-xl transition-all">
              Contact Engineering Desk
            </a>
          </div>
        </motion.div>
      </section>

      {/* 3. Corporate Value Summary Cards */}
      <section className="py-8 sm:py-12 bg-slate-50 px-4 sm:px-6 lg:px-12 border-b border-slate-200">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center"
        >
          {[
            { metric: "15+", label: "Years Civil Competence" },
            { metric: "120+", label: "Projects Commissioned" },
            { metric: "500+", label: "Skilled Workforce" },
            { metric: "100%", label: "On-Time Delivery" }
          ].map((item, idx) => (
            <motion.div variants={fadeInUp} key={idx} className="p-2 sm:p-0">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">{item.metric}</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 4. Strategic Services Area */}
      <section id="services" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 space-y-12">
        <div className="text-center space-y-2 px-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Our Core Project Competencies</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">We deploy robust machinery and top-tier materials to maintain strict project timelines.</p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          {services.map((srv, idx) => (
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              key={idx} 
              className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-orange-500/40 transition-colors group cursor-pointer"
            >
              <span className="text-3xl sm:text-4xl p-3 bg-slate-50 rounded-xl inline-block group-hover:scale-110 transition-transform">{srv.icon}</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{srv.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{srv.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. Project Portfolio Gallery */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Featured Project Showcases</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Take a look inside our newly handed-over physical landmarks across urban sectors.</p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8"
          >
            {projects.map((proj, idx) => (
              <motion.div 
                variants={fadeInUp}
                key={idx} 
                className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 group shadow-lg"
              >
                <div className="h-48 sm:h-56 overflow-hidden relative">
                  <img src={proj.img} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-5 sm:p-6 space-y-1">
                  <span className="text-[9px] sm:text-[10px] font-bold text-orange-400 uppercase tracking-widest">{proj.type}</span>
                  <h3 className="text-base sm:text-lg font-bold text-white">{proj.title}</h3>
                  <p className="text-xs text-slate-400 font-medium">📍 Site Area: {proj.location}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. Contact Form Information Area */}
      <section id="contact" className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Let's Build Your Vision</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">Get in touch with our operations desk to request a structural engineering quote or set up a consultation.</p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="bg-slate-50 p-5 sm:p-8 rounded-2xl border border-slate-200 text-left grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-xs sm:text-sm font-bold uppercase text-slate-400 tracking-widest">Headquarters Office Desk</h4>
              <div className="space-y-3 text-xs sm:text-sm font-semibold text-slate-700 break-words">
                <p>📍 Surat, Gujarat, India</p>
                <p>📞 Phone: +91 98765 43210</p>
                <p>✉️ Email: contract@shivshakticonstruction.com</p>
              </div>
            </div>
            <div className="pt-4 md:pt-0">
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto text-center text-xs bg-slate-900 text-white font-bold px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Access Unified Mobile Portal →
              </button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Thank you! Our structural estimate desk will connect shortly.'); }} className="space-y-3">
            <input required type="text" placeholder="Your Name / Enterprise Name" className="w-full border border-slate-200 p-3 rounded-xl text-xs bg-white outline-none focus:border-orange-500" />
            <input required type="email" placeholder="Corporate Email Address" className="w-full border border-slate-200 p-3 rounded-xl text-xs bg-white outline-none focus:border-orange-500" />
            <textarea required placeholder="Briefly describe your project parameters (e.g., site area, structural type)..." rows="3" className="w-full border border-slate-200 p-3 rounded-xl text-xs bg-white outline-none focus:border-orange-500 resize-none"></textarea>
            <button type="submit" className="w-full bg-orange-500 text-white font-bold text-xs p-3 rounded-xl hover:bg-orange-600 transition-colors shadow-md">Submit Estimate Request</button>
          </form>
        </motion.div>
      </section>

      {/* 7. Footer License Plate */}
    {/* 7. Footer License Plate */}
    {/* 7. Footer License Plate */}
      <footer className="bg-slate-950 text-slate-500 py-8 text-center text-xs font-medium border-t border-slate-900 px-4">
        <p>© 2026 Shivshakti Construction. All Rights Reserved.</p>
        <p className="text-[10px] text-slate-600 mt-1 tracking-wide">
          Architected with High-Performance Digital Solutions by <span className="text-orange-500 font-bold tracking-normal">Ravi Nishad</span>.
        </p>
      </footer>

    </div>
  );
}