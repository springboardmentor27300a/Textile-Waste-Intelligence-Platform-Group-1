import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  ArrowRight, 
  Sparkles, 
  Camera, 
  Layers, 
  RefreshCw, 
  TrendingUp, 
  CheckCircle2, 
  FileText, 
  Download, 
  Users, 
  BarChart3, 
  Globe, 
  Droplet, 
  Scale, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Camera,
      title: "AI Textile Analysis",
      description: "Upload textile images and identify fabric characteristics, material types, textures, colors, damage, and contamination."
    },
    {
      icon: Layers,
      title: "Waste Classification",
      description: "Automatically categorize textile waste as recyclable, reusable, repairable, upcyclable, compostable, or hazardous."
    },
    {
      icon: RefreshCw,
      title: "Smart Recycling Recommendations",
      description: "Get intelligent recommendations for recycling, reuse, upcycling, donation, and material recovery."
    },
    {
      icon: TrendingUp,
      title: "Sustainability Intelligence",
      description: "Measure circularity, waste diversion, carbon savings, water savings, and overall environmental impact."
    }
  ];

  const workflowSteps = [
    { step: "01", title: "Upload", desc: "Upload an image or register a textile waste batch." },
    { step: "02", title: "Analyze", desc: "AI analyzes the textile's material, texture, color, condition, and contamination." },
    { step: "03", title: "Classify", desc: "The platform identifies the material and determines its waste category and recyclability." },
    { step: "04", title: "Recommend", desc: "Receive the most suitable recycling, reuse, or upcycling strategy." },
    { step: "05", title: "Measure", desc: "View circularity scores and estimated environmental benefits." }
  ];

  const roles = [
    { 
      title: "Administrator", 
      desc: "Manage users, monitor platform activity, and oversee system operations." 
    },
    { 
      title: "Recycling Facility Operator", 
      desc: "Track waste batches, manage inventory, and identify suitable recycling opportunities." 
    },
    { 
      title: "Sustainability Manager", 
      desc: "Monitor sustainability metrics, waste diversion, environmental impact, and circularity performance." 
    },
    { 
      title: "Textile Manufacturer", 
      desc: "Analyze production waste, identify recovery opportunities, and improve circular textile practices." 
    }
  ];

  const sustainabilityNumbers = [
    {
      badge: "♻️ Recyclability Score",
      title: "Recyclability Assessment",
      desc: "Evaluate the recovery potential of textile waste."
    },
    {
      badge: "🌱 Sustainability Score",
      title: "Ecological Value",
      desc: "Measure the overall environmental value of each waste batch."
    },
    {
      badge: "🔄 Circularity Score",
      title: "5-Factor Circular Index",
      desc: "Combine recyclability, condition, reuse potential, environmental benefit, and processing feasibility."
    },
    {
      badge: "📊 Waste Diversion",
      title: "Landfill Diversion",
      desc: "Track how much textile waste can be diverted from disposal."
    }
  ];

  const dashboardFeatures = [
    { label: "Waste Inventory", icon: Layers },
    { label: "Material Distribution", icon: BarChart3 },
    { label: "Recycling Opportunities", icon: RefreshCw },
    { label: "Recovery Statistics", icon: Activity },
    { label: "CO₂ Savings", icon: Globe },
    { label: "Water Savings", icon: Droplet },
    { label: "Circularity Score", icon: Scale }
  ];

  const reportTypes = [
    "Waste Classification Reports",
    "Recycling Reports",
    "Sustainability Reports",
    "Environmental Impact Reports",
    "Circular Economy Reports"
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/70 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-200">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">TWIP</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-sm font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-4 py-2 rounded-xl transition-all"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-all"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-primary-200 hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-20 space-y-24">
        
        {/* 2. Hero Section */}
        <section className="text-center space-y-8 flex flex-col items-center pt-4">
          
          {/* Small Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-200 text-primary-700 rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary-600 animate-pulse" />
            <span>AI-POWERED TEXTILE INTELLIGENCE</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 max-w-4xl leading-tight">
            Transforming Textile Waste into{' '}
            <span className="bg-gradient-to-r from-primary-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
              Circular Opportunities
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-500 max-w-3xl font-medium leading-relaxed">
            Textile Waste Intelligence Platform (TWIP) helps manufacturers, recycling facilities, and sustainability teams analyze textile waste, identify materials, assess recyclability, and discover smarter recycling and reuse opportunities.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full sm:w-auto">
            <Link 
              to={isAuthenticated ? "/dashboard" : "/login"} 
              className="w-full sm:w-auto flex items-center justify-center space-x-2 text-base font-extrabold text-white bg-primary-600 hover:bg-primary-700 px-8 py-4 rounded-2xl transition-all shadow-xl shadow-primary-200 hover:-translate-y-0.5"
            >
              <span>Access Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto flex items-center justify-center text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 px-8 py-4 rounded-2xl transition-all shadow-sm hover:-translate-y-0.5"
            >
              Explore Features
            </a>
          </div>

          {/* 3. Feature Cards (4 Cards) */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 w-full text-left">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={index} 
                  className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-primary-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-12 w-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800 mb-2">{feat.title}</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </section>

        {/* 4. How It Works Section */}
        <section className="space-y-10 pt-4">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              From Textile Waste to Intelligent Action
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              An end-to-end automated workflow powered by computer vision and LCA intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {workflowSteps.map((step, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <span className="text-xs font-black text-primary-600 bg-primary-50 px-2.5 py-1 rounded-xl block w-fit mb-3">
                    {step.step}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-800 mb-1">{step.title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                </div>
                {idx < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-slate-100 text-slate-400 p-1 rounded-full border border-slate-200">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 5. Role-Based Intelligence Section */}
        <section className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-primary-600 font-bold text-xs uppercase tracking-wider">
              <Users className="h-4 w-4" />
              <span>Tailored Access</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Role-Based Intelligence</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-2xl">
              Personalized controls and analytical views tailored for every stakeholder in the circular supply chain.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {roles.map((role, idx) => (
              <div 
                key={idx} 
                className="flex items-start space-x-4 p-5 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all"
              >
                <div className="h-8 w-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                  0{idx + 1}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">{role.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{role.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Sustainability Numbers Section */}
        <section className="space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Make Every Textile Count
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              Scientific metrics calculated for every scrap batch entering the system.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sustainabilityNumbers.map((num, idx) => (
              <div key={idx} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full inline-block">
                    {num.badge}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-800">{num.title}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{num.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Dashboard Preview Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-bold text-primary-400 uppercase tracking-wider block">Visual Telemetry</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Turn Textile Data into Actionable Insights
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Monitor waste, materials, recovery opportunities, sustainability performance, and environmental impact through intuitive dashboards and visual analytics.
            </p>
          </div>

          {/* Interactive Feature Pills */}
          <div className="flex flex-wrap gap-3 pt-2">
            {dashboardFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx} 
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2.5 rounded-2xl text-xs font-bold text-white transition-all cursor-default"
                >
                  <Icon className="h-4 w-4 text-primary-400" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. Reports Section */}
        <section className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Insights You Can Share</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                Generate comprehensive reports from your textile waste intelligence data.
              </p>
            </div>
            <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-2xl text-xs font-bold w-fit">
              <Download className="h-4 w-4 text-emerald-600" />
              <span>Export as PDF or Excel</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((rep, idx) => (
              <div 
                key={idx} 
                className="flex items-center space-x-3 p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all"
              >
                <FileText className="h-5 w-5 text-primary-600 flex-shrink-0" />
                <span className="text-xs font-extrabold text-slate-800">{rep}</span>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 9. Footer */}
      <footer className="border-t border-slate-200/70 bg-white px-6 py-8 text-center text-xs text-slate-400 font-semibold">
        <p>© 2026 Textile Waste Intelligence Platform (TWIP). All rights reserved. Circular Economy Hub.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
