import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* 1. Public Top Navigation Header Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 lg:px-12 py-4 flex justify-between items-center shadow-sm">
        <div className="flex flex-col">
          <span className="text-xl font-black text-slate-900 tracking-tight uppercase">
            Shivshakti <span className="text-orange-500">Construction</span>
          </span>
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Building Trust, Delivering Excellence</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="text-xs font-bold text-slate-600 hover:text-orange-500 transition-colors hidden sm:block"
          >
            Staff Portal Login →
          </button>
          <a 
            href="#contact" 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/10"
          >
            Get a Free Quote
          </a>
        </div>
      </header>

      {/* 2. Hero Presentation Section */}
      <section className="relative bg-gradient-to-r from-slate-950 to-slate-900 text-white py-24 lg:py-36 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1920&q=80')" }}></div>
        
        <div className="max-w-4xl space-y-6 relative z-10">
          <span className="inline-block bg-orange-500/20 text-orange-400 font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-md border border-orange-500/30">
            Engineering & Infrastructure Contracting
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
            We Turn Complex Blueprints <br />Into Sustainable Realities.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            From iconic high-rise centers to state-of-the-art residential developments, Shivshakti Construction couples raw materials with advanced civil engineering to deliver structural engineering landmarks built to last generations.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <a href="#services" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20">
              Explore Our Services
            </a>
            <a href="#contact" className="bg-transparent hover:bg-white/10 text-white border-2 border-white/30 font-bold text-sm px-6 py-3 rounded-xl transition-all">
              Contact Engineering Desk
            </a>
          </div>
        </div>
      </section>

      {/* 3. Corporate Value Summary Cards */}
      <section className="py-12 bg-slate-50 px-6 lg:px-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl lg:text-4xl font-black text-slate-900">15+</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Years Civil Competence</p>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-black text-slate-900">120+</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Projects Safely Commissioned</p>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-black text-slate-900">500+</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Skilled Workforce Force</p>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-black text-slate-900">100%</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">On-Time Project Delivery</p>
          </div>
        </div>
      </section>

      {/* 4. Strategic Services Area */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Our Core Project Competencies</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">We deploy robust machinery and top-tier materials to maintain strict project timelines.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((srv, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-orange-500/30 transition-all group">
              <span className="text-4xl p-3 bg-slate-50 rounded-xl inline-block group-hover:scale-110 transition-transform">{srv.icon}</span>
              <h3 className="text-lg font-bold text-slate-900">{srv.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{srv.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Project Portfolio Gallery */}
      <section className="py-20 bg-slate-900 text-white px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white">Featured Project Showcases</h2>
              <p className="text-sm text-slate-400 mt-1">Take a look inside our newly handed-over physical landmarks across urban sectors.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((proj, idx) => (
              <div key={idx} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 group shadow-lg">
                <div className="h-56 overflow-hidden relative">
                  <img src={proj.img} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6 space-y-1">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{proj.type}</span>
                  <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                  <p className="text-xs text-slate-400 font-medium">📍 Site Area: {proj.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Contact Form Information Area */}
      <section id="contact" className="py-20 max-w-4xl mx-auto px-6 text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Let's Build Your Vision</h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">Get in touch with our operations desk to request an structural engineering quote or set up a consultation.</p>
        </div>

        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-left grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase text-slate-400 tracking-widest">Headquarters Office Desk</h4>
            <div className="space-y-2 text-sm font-semibold text-slate-700">
              <p>📍 Surat, Gujarat, India</p>
              <p>📞 Phone: +91 98765 43210</p>
              <p>✉️ Email: contract@shivshakticonstruction.com</p>
            </div>
            <div className="pt-4">
              <button 
                onClick={() => navigate('/labour/dashboard')}
                className="text-xs bg-slate-900 text-white font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Access Labour Mobile Portal →
              </button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Thank you! Our structural estimate desk will connect shortly.'); }} className="space-y-3">
            <input required type="text" placeholder="Your Name / Enterprise Name" className="w-full border border-slate-200 p-3 rounded-xl text-xs bg-white outline-none focus:border-orange-500" />
            <input required type="email" placeholder="Corporate Email Address" className="w-full border border-slate-200 p-3 rounded-xl text-xs bg-white outline-none focus:border-orange-500" />
            <textarea required placeholder="Briefly describe your project parameters (e.g., site area, structural type)..." rows="3" className="w-full border border-slate-200 p-3 rounded-xl text-xs bg-white outline-none focus:border-orange-500 resize-none"></textarea>
            <button type="submit" className="w-full bg-orange-500 text-white font-bold text-xs p-3 rounded-xl hover:bg-orange-600 transition-colors shadow-md">Submit Estimate Request</button>
          </form>
        </div>
      </section>

      {/* 7. Footer License Plate */}
      <footer className="bg-slate-950 text-slate-500 py-8 text-center text-xs font-medium border-t border-slate-900">
        <p>© 29:06:26 Shivshakti Construction. All Rights Reserved.</p>
        <p className="text-[10px] text-slate-700 mt-1">Designed with high-scale functional React and Tailwind architecture.</p>
      </footer>

    </div>
  );
}