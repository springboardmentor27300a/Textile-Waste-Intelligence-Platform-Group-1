import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldAlert, Cpu, BarChart3, HelpCircle, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-emerald-600 animate-pulse" />
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-700 to-sky-700 bg-clip-text text-transparent">
                Textile Waste Intelligence
              </span>
            </div>
            <div className="hidden md:flex space-x-8 text-sm font-medium">
              <a href="#about" className="text-slate-600 hover:text-emerald-600 transition">About</a>
              <a href="#features" className="text-slate-600 hover:text-emerald-600 transition">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-emerald-600 transition">How It Works</a>
            </div>
            <div className="flex space-x-3 items-center">
              <Link
                to="/login"
                className="text-sm font-medium text-emerald-700 hover:text-emerald-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                User Login
              </Link>
              <Link
                to="/register"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition"
              >
                Register
              </Link>
              <span className="text-slate-300">|</span>
              <Link
                to="/admin/login"
                className="text-xs font-semibold text-sky-700 hover:text-sky-800 px-2.5 py-1.5 rounded bg-sky-50 border border-sky-200 hover:bg-sky-100 transition"
              >
                Admin Access
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-950 via-slate-900 to-sky-950 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-semibold tracking-wide uppercase">
            <span>Powered by AI Analysis</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Smart Textile Waste <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              Intelligence & Recycling
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
            Track, analyze, and optimize textile inventory waste. Empower your organization with instant AI material categorization, recycling recommendations, and transparent reporting.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-base font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-base font-semibold px-8 py-3 rounded-lg transition"
            >
              Manufacturer Portal
            </Link>
          </div>
        </div>
      </section>

      {/* About Project Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold text-slate-900">About the Platform</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our AI Textile Waste Intelligence Platform bridges the gap between textile producers and advanced recycling facilities.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-900">Closing the Loop in Fashion & Textiles</h3>
              <p className="text-slate-600 leading-relaxed">
                Millions of tons of fabrics end up in landfills each year due to poor tracking and manual identification difficulties. Our platform digitizes this flow, automatically scanning and registering waste batches.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Through simple forms and smart analytics, we ensure every piece of scrap is routed to the correct processing stream—be it mechanical shredding, chemical recycling, or direct reuse.
              </p>
            </div>
            <div className="bg-gradient-to-tr from-emerald-100 to-sky-100 p-8 rounded-2xl shadow-inner flex flex-col justify-center space-y-6 border border-emerald-200">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-600 rounded-lg text-white">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-lg">Traceability & Trust</h4>
                  <p className="text-slate-600 text-sm mt-1">
                    Every batch has a unique submission ID, contact person, and verified source organization.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-sky-600 rounded-lg text-white">
                  <Cpu className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-lg">AI Material Prediction</h4>
                  <p className="text-slate-600 text-sm mt-1">
                    Automatic material matching, recyclability scoring, and custom routing instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 border-t border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Key Features</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Equipped with necessary utilities for enterprise fabric classification and audit trails.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:border-emerald-500 hover:shadow-md transition">
              <div className="p-2 bg-emerald-50 text-emerald-700 w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="font-semibold text-slate-900 text-lg">Inventory Tracking</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Log batches with weight, fabric type, source, condition, and color. Keep a visual history of items with image attachments.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:border-emerald-500 hover:shadow-md transition">
              <div className="p-2 bg-emerald-50 text-emerald-700 w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="font-semibold text-slate-900 text-lg">AI Classifications</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Get quick estimation metrics regarding category, material composition confidence, and optimal recycling recommendations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:border-emerald-500 hover:shadow-md transition">
              <div className="p-2 bg-emerald-50 text-emerald-700 w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="font-semibold text-slate-900 text-lg">Admin Audits</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Control panel built for admins to search, edit, and delete registrations, coordinate manufacturer users, and oversee weights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Follow four easy steps to catalog waste and integrate classifications.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg mx-auto">
                1
              </div>
              <h4 className="font-semibold text-slate-900">User Register</h4>
              <p className="text-slate-600 text-xs">Create your personal profile linked to your organization details.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg mx-auto">
                2
              </div>
              <h4 className="font-semibold text-slate-900">Log Waste Batch</h4>
              <p className="text-slate-600 text-xs">Input fabric details, weight, source type, and upload a thumbnail.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg mx-auto">
                3
              </div>
              <h4 className="font-semibold text-slate-900">Run AI Analysis</h4>
              <p className="text-slate-600 text-xs">Receive classification recommendation reports and confidence ratings.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg mx-auto">
                4
              </div>
              <h4 className="font-semibold text-slate-900">Audit & Recycle</h4>
              <p className="text-slate-600 text-xs">Admins review aggregated weights, print reports, and resolve entries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-12 px-4 border-t border-slate-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-emerald-500" />
            <span className="font-bold text-white tracking-tight">
              Textile Waste Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} AI Textile Waste Intelligence Platform. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link to="/login" className="hover:text-white transition">User Login</Link>
            <Link to="/admin/login" className="hover:text-white transition text-sky-400">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
