import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf, ArrowRight, CheckCircle2, Shield, Recycle, Droplet,
  Trash2, Cpu, BarChart3, HelpCircle, Network, Layers, Sparkles,
  GitBranch, HelpCircle as InfoIcon, Compass, Globe, Share2, Menu, X, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user, darkMode, toggleDarkMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Animated Counters State
  const [landfillCount, setLandfillCount] = useState(0);
  const [waterCount, setWaterCount] = useState(0);
  const [carbonCount, setCarbonCount] = useState(0);

  // Smooth scroll handler
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Animate stats counters on mount
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;

      // Calculate progress percentage
      const progress = currentStep / steps;

      // Target values: Landfill = 98%, Water = 372000 L, Carbon = 6250 kg
      setLandfillCount(Math.floor(progress * 98));
      setWaterCount(Math.floor(progress * 372000));
      setCarbonCount(Math.floor(progress * 6250));

      if (currentStep >= steps) {
        clearInterval(timer);
        setLandfillCount(98);
        setWaterCount(372000);
        setCarbonCount(6250);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080C0A] text-slate-800 dark:text-slate-200 transition-colors duration-300 scroll-smooth">

      {/* Navigation Header */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-[#080C0A]/85 backdrop-blur-md shadow-md py-1 border-b border-slate-200 dark:border-[#1C2621]' 
          : 'bg-transparent py-2 border-b border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl transition-colors ${scrolled ? 'bg-primary-800/10 text-primary-800 dark:bg-white/10 dark:text-white' : 'bg-white/10 text-white'}`}>
              <Leaf size={18} className="animate-pulse" />
            </div>
            <span className={`text-lg font-bold tracking-tight transition-colors ${scrolled ? 'text-slate-800 dark:text-white' : 'text-white'}`}>
              Weave<span className="text-[#A5D6A7] font-black">Cycle</span>
            </span>
          </div>

          {/* Desktop Navbar Links */}
          <div className={`hidden md:flex items-center space-x-8 text-xs font-bold tracking-wider uppercase transition-colors ${
            scrolled ? 'text-slate-600 dark:text-white/80' : 'text-white/80'
          }`}>
            <a href="#about" onClick={(e) => handleSmoothScroll(e, 'about')} className={`transition-colors ${scrolled ? 'hover:text-slate-900 dark:hover:text-white' : 'hover:text-white'}`}>Why WeaveCycle</a>
            <a href="#features" onClick={(e) => handleSmoothScroll(e, 'features')} className={`transition-colors ${scrolled ? 'hover:text-slate-900 dark:hover:text-white' : 'hover:text-white'}`}>Our Solution</a>
            <a href="#benefits" onClick={(e) => handleSmoothScroll(e, 'benefits')} className={`transition-colors ${scrolled ? 'hover:text-slate-900 dark:hover:text-white' : 'hover:text-white'}`}>Platform Benefits</a>
            <a href="#impact" onClick={(e) => handleSmoothScroll(e, 'impact')} className={`transition-colors ${scrolled ? 'hover:text-slate-900 dark:hover:text-white' : 'hover:text-white'}`}>Environmental Impact</a>
            <a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, 'how-it-works')} className={`transition-colors ${scrolled ? 'hover:text-slate-900 dark:hover:text-white' : 'hover:text-white'}`}>How It Works</a>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${scrolled ? 'text-slate-600 dark:text-white/80 hover:text-slate-900 dark:hover:text-white' : 'text-white/80 hover:text-white'}`}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {user ? (
              <Link
                to="/dashboard"
                id="landing-dashboard-btn"
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#43A047] rounded-full shadow-soft hover-scale flex items-center space-x-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  id="landing-login-btn"
                  className={`px-4 py-2.5 text-xs font-bold transition-colors ${
                    scrolled ? 'text-slate-600 dark:text-white/80 hover:text-slate-900 dark:hover:text-white' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  id="landing-register-btn"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#43A047] rounded-full shadow-soft hover-scale"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburguer */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${scrolled ? 'text-slate-600 dark:text-white/80 hover:text-slate-900 dark:hover:text-white' : 'text-white/80 hover:text-white'}`}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 transition-colors ${scrolled ? 'text-slate-800 dark:text-white' : 'text-white'}`}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden p-6 bg-[#111815] border-b border-[#1C2621] space-y-4 animate-fade-in text-xs font-bold uppercase tracking-wider text-slate-400">
            <a href="#about" onClick={(e) => { setMobileMenuOpen(false); handleSmoothScroll(e, 'about'); }} className="block py-2 hover:text-white">Why WeaveCycle</a>
            <a href="#features" onClick={(e) => { setMobileMenuOpen(false); handleSmoothScroll(e, 'features'); }} className="block py-2 hover:text-white">Our Solution</a>
            <a href="#benefits" onClick={(e) => { setMobileMenuOpen(false); handleSmoothScroll(e, 'benefits'); }} className="block py-2 hover:text-white">Platform Benefits</a>
            <a href="#impact" onClick={(e) => { setMobileMenuOpen(false); handleSmoothScroll(e, 'impact'); }} className="block py-2 hover:text-white">Environmental Impact</a>
            <a href="#how-it-works" onClick={(e) => { setMobileMenuOpen(false); handleSmoothScroll(e, 'how-it-works'); }} className="block py-2 hover:text-white">How It Works</a>
            <div className="border-t border-[#1C2621] pt-4 flex flex-col gap-3">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 bg-[#2E7D32] text-white rounded-xl shadow-soft"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 border border-slate-800 rounded-xl text-white"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 bg-[#2E7D32] text-white rounded-xl shadow-soft"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header
        className="relative pt-36 pb-28 sm:pt-48 sm:pb-36 bg-cover bg-center bg-no-repeat bg-fixed overflow-hidden flex items-center min-h-[90vh]"
        style={{ backgroundImage: "linear-gradient(rgba(8, 12, 10, 0.75), rgba(8, 12, 10, 0.65)), url('/hero_bg.png')" }}
      >
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <span className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#A5D6A7] bg-white/10 rounded-full border border-white/20 shadow-soft">
            AI Platform for Textile Recovery
          </span>

          <h1 className="mt-8 text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Transforming Textile Waste<br />
            into a <span className="bg-gradient-to-r from-[#A5D6A7] via-[#43A047] to-[#00F5A0] bg-clip-text text-transparent">Circular Future</span>
          </h1>

          <p className="mt-8 max-w-3xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            WeaveCycle uses Artificial Intelligence, Computer Vision, and Sustainability Intelligence to identify textile materials, evaluate recyclability, recommend recovery strategies, and accelerate the transition toward a circular textile economy.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? "/dashboard" : "/register"}
              id="hero-primary-cta"
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#43A047] rounded-full shadow-soft hover-scale flex items-center justify-center space-x-1.5"
            >
              <span>Explore Platform</span>
              <ArrowRight size={14} />
            </Link>
            <a
              href="#about"
              onClick={(e) => handleSmoothScroll(e, 'about')}
              id="hero-secondary-cta"
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full shadow-soft hover-scale flex items-center justify-center"
            >
              Learn More
            </a>
          </div>
        </div>
      </header>

      {/* Why WeaveCycle? */}
      <section id="about" className="py-24 bg-white dark:bg-[#0c120e] border-y border-slate-100 dark:border-[#1C2621]">
        <div className="max-w-7xl mx-auto px-6 space-y-20">

          {/* Challenge & Mission Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* The Challenge */}
            <div className="space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-1 rounded-full border border-red-100 dark:border-red-950/40">The Challenge</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">Inefficient Sorting Blocks Global Recovery</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-405 leading-relaxed font-medium">
                Every year millions of tonnes of textile waste are discarded, while valuable materials that could be reused or recycled are lost. Traditional waste management processes rely heavily on manual inspection, making textile sorting slow, expensive, inconsistent, and difficult to scale. Many recyclable textiles still end up in landfills because of poor identification and limited decision support.
              </p>
              <p className="text-xs sm:text-sm text-[#2E7D32] dark:text-[#A5D6A7] leading-relaxed font-semibold">
                WeaveCycle addresses these challenges by combining artificial intelligence with sustainability analytics to improve textile recovery, increase recycling efficiency, and reduce environmental impact.
              </p>
            </div>

            {/* Our Mission */}
            <div className="space-y-6 p-8 bg-[#2E7D32]/5 dark:bg-emerald-950/10 border border-[#2E7D32]/10 dark:border-emerald-950/20 rounded-3xl relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-4 right-6 text-slate-200/50 dark:text-slate-900 select-none font-black text-7xl font-mono">01</div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32] dark:text-[#A5D6A7]">Our Mission</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Building a Circular Textile Economy</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Our mission is to help industries transform textile waste into valuable resources through intelligent technology. By combining AI-powered material recognition, digital inventory management, sustainability analytics, and recycling recommendations, WeaveCycle empowers organizations to minimize waste while maximizing resource recovery.
              </p>
            </div>
          </div>

          {/* Why It Matters (4 Animated Cards) */}
          <div className="space-y-10">
            <div className="text-center max-w-lg mx-auto">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Why It Matters</h3>
              <p className="text-xs text-slate-400 font-medium mt-2">Diverting fibers, conserving reserves, and making data-driven actions.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              <div className="p-6 bg-[#F8FAFC] dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl hover-glow-green shadow-soft">
                <div className="w-10 h-10 rounded-2xl bg-red-100/70 dark:bg-red-950/30 text-red-500 flex items-center justify-center mb-6">
                  <Trash2 size={18} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Reduce Landfill Waste</h4>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                  Identify recyclable textiles before they become landfill waste.
                </p>
              </div>

              <div className="p-6 bg-[#F8FAFC] dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl hover-glow-green shadow-soft">
                <div className="w-10 h-10 rounded-2xl bg-[#2E7D32]/10 dark:bg-emerald-950/30 text-[#43A047] flex items-center justify-center mb-6">
                  <Recycle size={18} className="animate-spin-slow" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Promote Circular Economy</h4>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                  Keep valuable textile materials in circulation through recycling, reuse, and upcycling.
                </p>
              </div>

              <div className="p-6 bg-[#F8FAFC] dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl hover-glow-green shadow-soft">
                <div className="w-10 h-10 rounded-2xl bg-blue-100/70 dark:bg-emerald-950/30 text-blue-500 flex items-center justify-center mb-6">
                  <Droplet size={18} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Reduce Environmental Impact</h4>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                  Support lower carbon emissions, reduced water consumption, and conservation of natural resources by extending the life of textile materials.
                </p>
              </div>

              <div className="p-6 bg-[#F8FAFC] dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl hover-glow-green shadow-soft">
                <div className="w-10 h-10 rounded-2xl bg-amber-100/75 dark:bg-amber-955/30 text-amber-600 flex items-center justify-center mb-6">
                  <Cpu size={18} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Smarter Decision Making</h4>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                  Use AI-driven insights to help organizations choose the most sustainable recovery option for every textile batch.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Our Solution (6 Feature Cards) */}
      <section id="features" className="py-24 bg-[#F8FAFC] dark:bg-[#080C0A]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#2E7D32] dark:text-[#A5D6A7] bg-[#2E7D32]/10 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-full">Innovative Suite</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-6">Our Sustainability Solution</h2>
            <p className="text-xs text-slate-400 mt-2 font-medium">AI computer vision and blockchain-ready traceability pipelines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Feature 1 */}
            <div className="p-8 bg-white dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl hover-scale shadow-soft hover:shadow-neon">
              <div className="p-3 bg-[#2E7D32]/10 dark:bg-emerald-950/40 text-[#43A047] w-fit rounded-2xl mb-6">
                <Cpu size={20} />
              </div>
              <h3 className="text-md font-bold text-slate-900 dark:text-white mb-2">AI Material Recognition</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Automatically recognize textile materials using computer vision.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-white dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl hover-scale shadow-soft hover:shadow-neon">
              <div className="p-3 bg-[#2E7D32]/10 dark:bg-emerald-950/40 text-[#43A047] w-fit rounded-2xl mb-6">
                <Layers size={20} />
              </div>
              <h3 className="text-md font-bold text-slate-900 dark:text-white mb-2">Textile Waste Classification</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Categorize waste according to material type and recovery potential.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-white dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl hover-scale shadow-soft hover:shadow-neon">
              <div className="p-3 bg-[#2E7D32]/10 dark:bg-emerald-950/40 text-[#43A047] w-fit rounded-2xl mb-6">
                <Network size={20} />
              </div>
              <h3 className="text-md font-bold text-slate-900 dark:text-white mb-2">Inventory Management</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Digitally manage textile waste batches from collection to recovery.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-white dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl hover-scale shadow-soft hover:shadow-neon">
              <div className="p-3 bg-blue-50 dark:bg-emerald-950/40 text-blue-600 w-fit rounded-2xl mb-6">
                <Sparkles size={20} />
              </div>
              <h3 className="text-md font-bold text-slate-900 dark:text-white mb-2">Recycling Recommendations</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Suggest the most appropriate recycling, reuse, or upcycling strategy.</p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-white dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl hover-scale shadow-soft hover:shadow-neon">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 w-fit rounded-2xl mb-6">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-md font-bold text-slate-900 dark:text-white mb-2">Sustainability Intelligence</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Measure environmental benefits through sustainability analytics and impact tracking.</p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-white dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl hover-scale shadow-soft hover:shadow-neon">
              <div className="p-3 bg-amber-50 dark:bg-emerald-950/40 text-amber-605 w-fit rounded-2xl mb-6">
                <Compass size={20} />
              </div>
              <h3 className="text-md font-bold text-slate-900 dark:text-white mb-2">Circular Economy Dashboard</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Provide real-time insights into waste recovery, recycling performance, and sustainability metrics.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Platform Benefits (2-Column Grid) */}
      <section id="benefits" className="py-24 bg-white dark:bg-[#0c120e] border-y border-slate-100 dark:border-[#1C2621]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#2E7D32] dark:text-[#A5D6A7] bg-[#2E7D32]/10 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-full">Value Alignment</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-6">Targeted Platform Benefits</h2>
            <p className="text-xs text-slate-400 mt-2 font-medium">Engineered to drive efficiency at every tier of the textile pipeline.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-medium">

            {/* For Manufacturers */}
            <div className="p-8 bg-[#F8FAFC] dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl shadow-soft">
              <h3 className="text-md font-bold text-[#2E7D32] dark:text-[#A5D6A7] mb-6 flex items-center space-x-2">
                <Leaf size={16} />
                <span>For Textile Manufacturers</span>
              </h3>
              <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Reduce production waste volume</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Improve raw resource efficiency</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Track waste generation metrics at source</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Support global corporate ESG initiatives</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Increase sustainability and chemical compliance</span>
                </li>
              </ul>
            </div>

            {/* For Recycling Facilities */}
            <div className="p-8 bg-[#F8FAFC] dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl shadow-soft">
              <h3 className="text-md font-bold text-[#2E7D32] dark:text-[#A5D6A7] mb-6 flex items-center space-x-2">
                <Recycle size={16} />
                <span>For Recycling Facilities</span>
              </h3>
              <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Faster, automated waste sorting cycles</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Better storage shelving and inventory management</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>AI-assisted material fiber identification</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Improved overall mechanical recycling efficiency</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Higher pure fiber material recovery rates</span>
                </li>
              </ul>
            </div>

            {/* For Sustainability Managers */}
            <div className="p-8 bg-[#F8FAFC] dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl shadow-soft">
              <h3 className="text-md font-bold text-[#2E7D32] dark:text-[#A5D6A7] mb-6 flex items-center space-x-2">
                <BarChart3 size={16} />
                <span>For Sustainability Managers</span>
              </h3>
              <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Real-time carbon reduction insights</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Waste diversion and landfill avoidance analytics</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Standardized circular economy reporting models</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Organizational sustainability score tracking</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Interactive environmental performance dashboards</span>
                </li>
              </ul>
            </div>

            {/* For Administrators */}
            <div className="p-8 bg-[#F8FAFC] dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl shadow-soft">
              <h3 className="text-md font-bold text-[#2E7D32] dark:text-[#A5D6A7] mb-6 flex items-center space-x-2">
                <Shield size={16} />
                <span>For Administrators</span>
              </h3>
              <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Centralized user credential management</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Corporate organization registration approvals</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Unified platform-wide analytics and audit feeds</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Real-time API and background system monitoring</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 size={13} className="text-[#43A047]" />
                  <span>Centralized compliance and ESG reports generation</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Environmental Impact (With Counters) */}
      <section id="impact" className="py-24 bg-[#F8FAFC] dark:bg-[#080C0A]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div className="space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32] dark:text-[#A5D6A7]">Impact Focus</span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Every Textile Matters</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Recovering textile waste means more than recycling fabric.
              </p>
              <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-450 leading-relaxed font-medium">
                It means reducing greenhouse gas emissions, conserving water, decreasing landfill dependency, extending material life, and creating a more resilient circular economy where resources remain valuable for longer.
              </p>
            </div>

            {/* Static & Dynamic Impact Outcomes (6 Cards Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <div className="p-5 bg-white dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl shadow-soft">
                <span className="text-xl">♻️</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-3">Less Textile Waste</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">Reduce unnecessary landfill disposal.</p>
                <span className="block text-md font-bold text-[#2E7D32] dark:text-[#A5D6A7] mt-3 font-mono">-{landfillCount}% Landfill</span>
              </div>

              <div className="p-5 bg-white dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl shadow-soft">
                <span className="text-xl">🌱</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-3">Better Resource Recovery</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">Recover valuable fibers for future use.</p>
                <span className="block text-md font-bold text-[#43A047] mt-3 font-mono">1,490 kg Logged</span>
              </div>

              <div className="p-5 bg-white dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl shadow-soft">
                <span className="text-xl">💧</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-3">Water Conservation</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">Reduce demand for virgin textile production.</p>
                <span className="block text-md font-bold text-blue-500 mt-3 font-mono">{waterCount.toLocaleString()} Liters</span>
              </div>

              <div className="p-5 bg-white dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl shadow-soft">
                <span className="text-xl">🌍</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-3">Lower Carbon Emissions</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">Support climate-conscious manufacturing.</p>
                <span className="block text-md font-bold text-teal-400 mt-3 font-mono">-{carbonCount.toLocaleString()} kg CO₂</span>
              </div>

              <div className="p-5 bg-white dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl shadow-soft col-span-1 sm:col-span-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">🧵 Circular Fashion</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Enable textile-to-textile recycling loops.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">📊 Sustainable Choices</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Data-driven environmental decisions.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* How WeaveCycle Works (6-step horizontal timeline) */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-[#0c120e] border-y border-slate-100 dark:border-[#1C2621] overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#2E7D32] dark:text-[#A5D6A7] bg-[#2E7D32]/10 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-full">Workflow Pipeline</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-6">How WeaveCycle Works</h2>
            <p className="text-xs text-slate-400 mt-2 font-medium">A connected, digital circularity pipeline for post-industrial scrap.</p>
          </div>

          {/* Timeline steps horizontal scroll wrapper */}
          <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-0 mt-12 pl-6 md:pl-0">
            {/* Background connecting bar for large screens */}
            <div className="hidden md:block absolute left-[8%] right-[8%] top-6 h-0.5 bg-slate-100 dark:bg-[#1C2621] -z-10"></div>

            {/* Background connecting bar for mobile */}
            <div className="md:hidden absolute left-4 top-2 bottom-8 w-0.5 bg-slate-100 dark:bg-[#1C2621] -z-10"></div>

            <div className="flex md:flex-col items-center w-full md:text-center relative gap-4 md:gap-0">
              <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 dark:bg-emerald-950/40 text-[#43A047] flex items-center justify-center font-bold text-sm border border-[#2E7D32]/20 dark:border-emerald-900/30 shadow-soft animate-pulse">1</div>
              <div className="mt-0 md:mt-4 text-left md:text-center text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">Textile Waste Generated</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Scraps created at factory sources</p>
              </div>
            </div>

            <div className="flex md:flex-col items-center w-full md:text-center relative gap-4 md:gap-0">
              <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 dark:bg-emerald-950/40 text-[#43A047] flex items-center justify-center font-bold text-sm border border-[#2E7D32]/20 dark:border-emerald-900/30 shadow-soft">2</div>
              <div className="mt-0 md:mt-4 text-left md:text-center text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">Waste Registration</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Manufacturer submits weights & tags</p>
              </div>
            </div>

            <div className="flex md:flex-col items-center w-full md:text-center relative gap-4 md:gap-0">
              <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 dark:bg-emerald-950/40 text-[#43A047] flex items-center justify-center font-bold text-sm border border-[#2E7D32]/20 dark:border-emerald-900/30 shadow-soft">3</div>
              <div className="mt-0 md:mt-4 text-left md:text-center text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">AI Material Recognition</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Optical camera scans fiber blend specs</p>
              </div>
            </div>

            <div className="flex md:flex-col items-center w-full md:text-center relative gap-4 md:gap-0">
              <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 dark:bg-emerald-950/40 text-[#43A047] flex items-center justify-center font-bold text-sm border border-[#2E7D32]/20 dark:border-emerald-900/30 shadow-soft">4</div>
              <div className="mt-0 md:mt-4 text-left md:text-center text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">Waste Classification</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Sorter tags defects and blends categories</p>
              </div>
            </div>

            <div className="flex md:flex-col items-center w-full md:text-center relative gap-4 md:gap-0">
              <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 dark:bg-emerald-950/40 text-[#43A047] flex items-center justify-center font-bold text-sm border border-[#2E7D32]/20 dark:border-emerald-900/30 shadow-soft">5</div>
              <div className="mt-0 md:mt-4 text-left md:text-center text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">Recycling Recommendation</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">System suggests reuse, shred, or spin routes</p>
              </div>
            </div>

            <div className="flex md:flex-col items-center w-full md:text-center relative gap-4 md:gap-0">
              <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 dark:bg-emerald-950/40 text-[#43A047] flex items-center justify-center font-bold text-sm border border-[#2E7D32]/20 dark:border-emerald-900/30 shadow-soft animate-pulse">6</div>
              <div className="mt-0 md:mt-4 text-left md:text-center text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">Circular Economy Analytics</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Managers review ESG offsets dashboard</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Our Vision & Core Values */}
      <section className="py-24 bg-[#F8FAFC] dark:bg-[#080C0A]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">

          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#2E7D32] dark:text-[#A5D6A7]">Future Projection</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-6">Creating a Future Where Every Thread Counts</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-4 font-semibold">
              We envision a world where textile waste is no longer considered waste but a valuable resource. Through intelligent technology, sustainable innovation, and circular thinking, WeaveCycle helps industries transition from linear production models to regenerative systems that benefit businesses, communities, and the environment.
            </p>
          </div>

          {/* Core Values (4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-semibold">

            <div className="p-6 bg-white dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl shadow-soft">
              <div className="w-8 h-8 rounded-xl bg-[#2E7D32]/10 dark:bg-emerald-950/40 text-[#43A047] flex items-center justify-center mb-4">
                <Cpu size={14} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Innovation</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">Leveraging AI to solve complex sustainability challenges.</p>
            </div>

            <div className="p-6 bg-white dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl shadow-soft">
              <div className="w-8 h-8 rounded-xl bg-[#2E7D32]/10 dark:bg-emerald-950/40 text-[#43A047] flex items-center justify-center mb-4">
                <Leaf size={14} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Sustainability</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">Designing technology that supports long-term environmental health.</p>
            </div>

            <div className="p-6 bg-white dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl shadow-soft">
              <div className="w-8 h-8 rounded-xl bg-[#2E7D32]/10 dark:bg-emerald-950/40 text-[#43A047] flex items-center justify-center mb-4">
                <Shield size={14} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Transparency</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">Providing reliable data and measurable impact statistics.</p>
            </div>

            <div className="p-6 bg-white dark:bg-[#111815] border border-slate-100 dark:border-[#1C2621] rounded-3xl shadow-soft">
              <div className="w-8 h-8 rounded-xl bg-[#2E7D32]/10 dark:bg-emerald-950/40 text-[#43A047] flex items-center justify-center mb-4">
                <Globe size={14} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Collaboration</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">Connecting manufacturers, recyclers, and managers in one ecosystem.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-24 bg-[#2E7D32] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(165,214,167,0.1),transparent)]"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
          <h2 className="text-3xl font-black">Ready to Build a Circular Future?</h2>
          <p className="text-xs text-emerald-100 max-w-xl mx-auto font-medium">
            Join WeaveCycle and transform textile waste into opportunity through AI-powered sustainability intelligence.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to={user ? "/dashboard" : "/register"}
              id="cta-get-started"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#2E7D32] hover:bg-slate-50 font-bold rounded-full shadow-soft hover-scale"
            >
              Get Started
            </Link>
            <a
              href="mailto:contact@weavecycle.com"
              id="cta-contact-us"
              className="w-full sm:w-auto px-8 py-3.5 border border-white/50 text-white hover:bg-white/10 font-bold rounded-full hover-scale"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-12 border-t border-slate-900 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Leaf className="text-[#43A047]" size={20} />
              <span className="text-md font-bold text-white tracking-tight">WeaveCycle</span>
            </div>
            <p className="leading-relaxed text-slate-500 font-medium">
              AI-Powered Textile Waste Intelligence. Divert landfill scrap, audit transactions, and train material classification algorithms.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-4">Solutions</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#about" className="hover:text-white transition-colors">Why WeaveCycle</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">AI Recognition</a></li>
              <li><a href="#benefits" className="hover:text-white transition-colors">Platform Benefits</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/login" className="hover:text-white transition-colors">Portal Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register Organization</Link></li>
              <li><a href="http://localhost:8000/api/v1/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation (Swagger)</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-4">Connect</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Repository</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn Portal</a></li>
              <li><span className="block mt-4 text-[10px] text-slate-650">&copy; {new Date().getFullYear()} WeaveCycle. All rights reserved.</span></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
