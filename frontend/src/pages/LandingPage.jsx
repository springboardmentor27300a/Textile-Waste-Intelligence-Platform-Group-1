import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, ShieldCheck, Database, BarChart3, Settings2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: ShieldCheck,
      title: "Role-Based Access Control",
      description: "Secure, tailored dashboards for Operators, Sustainability Managers, Manufacturers, and Admins."
    },
    {
      icon: Database,
      title: "Inventory CRUD Tracking",
      description: "Manage textile waste batches, fiber composition, recyclability metrics, and warehouse allocations."
    },
    {
      icon: BarChart3,
      title: "Sustainability Analytics",
      description: "Visual dashboards (powered by Chart.js) tracking volume, status distributions, and recycling ratios."
    },
    {
      icon: Settings2,
      title: "FastAPI & SQLAlchemy Core",
      description: "High-performance REST API with automated Swagger documentation and secure JWT encryption."
    }
  ];

  const roles = [
    { name: "Administrator", desc: "System control, database oversight, and user management." },
    { name: "Recycling Facility Operator", desc: "Adds, edits, and deletes waste batches on the warehouse floor." },
    { name: "Sustainability Manager", desc: "Tracks ecological impacts, recycling rates, and stats." },
    { name: "Textile Manufacturer", desc: "Sells pre-consumer scraps and buys recycled circular materials." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md">
            <Leaf className="h-4.5 w-4.5" />
          </div>
          <span className="text-lg font-bold text-slate-800">TWIP</span>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Link to="/dashboard" className="flex items-center space-x-2 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl transition-all">
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all">
                Sign In
              </Link>
              <Link to="/register" className="text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-xl transition-all shadow-md shadow-primary-200">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-6xl mx-auto px-6 py-16 md:py-24 text-center space-y-8 flex flex-col items-center justify-center">
        <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-100 text-primary-800 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider">
          <Leaf className="h-3 w-3 text-primary-600" />
          <span>Platform Active</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl">
          Empowering Circular Textiles with <span className="bg-gradient-to-r from-primary-600 to-emerald-700 bg-clip-text text-transparent">Data Intelligence</span>
        </h1>
        <p className="text-base md:text-lg text-slate-500 max-w-2xl font-medium">
          The Textile Waste Intelligence Platform (TWIP) offers full-stack traceability and inventory control for recycling centers, managers, and manufacturers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to={isAuthenticated ? "/dashboard" : "/login"} className="w-full sm:w-auto flex items-center justify-center space-x-2 text-base font-bold text-white bg-primary-600 hover:bg-primary-700 px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-primary-200 hover:-translate-y-0.5">
            <span>Access Dashboard</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <a href="#features" className="w-full sm:w-auto flex items-center justify-center text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-8 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5">
            Explore Features
          </a>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-16 w-full text-left">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div key={index} className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-primary-200 hover:shadow-xl hover:shadow-slate-100/80 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{feat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Roles Details */}
        <div className="pt-20 w-full text-left bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Role-Based Intelligence</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Different views and operations dynamically assigned to each account type.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role, idx) => (
              <div key={idx} className="flex space-x-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{role.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{role.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white px-6 py-8 text-center text-xs text-slate-400 font-medium">
        <p>© 2026 Textile Waste Intelligence Platform. All rights reserved. Circular Economy Hub.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
