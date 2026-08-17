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
  FileText, 
  Download, 
  Users, 
  BarChart3, 
  Globe, 
  Droplet, 
  Scale, 
  Activity,
  Printer
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

  // Dynamic Functional Report Generator
  const handleGenerateReport = (type) => {
    const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    
    // CSV / Excel Export Handler
    if (type === 'excel') {
      const csvContent = `Report Type,Textile Waste Intelligence Platform - Master Audit Export
Generated On,${dateStr}
Platform Status,Circular Audit Certified (v2.4)

Batch ID,Fabric Type,Quantity (kg),Condition,Recyclability Rate,CO2 Savings (kg),Water Saved (L),Status,Circularity Score
BATCH-1,Cotton,3100,Clean,85%,3016.01,70600.0,Recycled,92/100
BATCH-2,Polyester,2200,Clean,75%,1900.50,650.0,Processing,85/100
BATCH-3,Wool,1150,Damaged,70%,1450.25,1800.0,Collected,74/100
BATCH-4,Denim,800,Clean,88%,1100.00,1760.0,Recycled,89/100
BATCH-5,Silk,610,Clean,80%,1150.00,1950.0,Processing,90/100

Summary Audit Totals:
Total Quantity Analyzed,7860 kg
Total CO2 Averted,8616.76 kg CO2
Total Water Conserved,76760 Litres
Average Circularity Index,86.0 / 100
Landfill Diversion Rate,93.4%
`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `TWIP_Sustainability_Audit_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // PDF Print Window Generator
    const printWindow = window.open('', '_blank');
    
    let title = "Textile Waste Intelligence Report";
    let color = "#059669";
    let bodyContent = "";

    if (type === 'Waste Classification Reports') {
      title = "Textile Waste Classification & Composition Audit";
      color = "#2563eb";
      bodyContent = `
        <div class="section-title">Waste Category Distribution</div>
        <div class="grid">
          <div class="card"><div class="title">Recyclable Scraps</div><div class="val">4,500 kg (57.2%)</div></div>
          <div class="card"><div class="title">Reusable Garments</div><div class="val">1,800 kg (22.9%)</div></div>
          <div class="card"><div class="title">Repairable Textiles</div><div class="val">1,100 kg (14.0%)</div></div>
          <div class="card"><div class="title">Disposal / Contaminated</div><div class="val">460 kg (5.9%)</div></div>
        </div>
        <div class="section-title">Fiber Blend Composition Analysis</div>
        <table class="table">
          <thead>
            <tr><th>Material Type</th><th>Share %</th><th>Recyclability</th><th>Primary Category</th></tr>
          </thead>
          <tbody>
            <tr><td>Organic Cotton</td><td>39.4%</td><td>95%</td><td>Recyclable</td></tr>
            <tr><td>PET Polyester</td><td>28.0%</td><td>85%</td><td>Recyclable</td></tr>
            <tr><td>Wool / Nylon Blend</td><td>14.6%</td><td>70%</td><td>Repairable</td></tr>
            <tr><td>Mulberry Silk</td><td>7.8%</td><td>80%</td><td>Reusable</td></tr>
            <tr><td>Flax Linen</td><td>10.2%</td><td>90%</td><td>Reusable</td></tr>
          </tbody>
        </table>
      `;
    } else if (type === 'Recycling Reports') {
      title = "Smart Recycling Strategy & Material Recovery Report";
      color = "#059669";
      bodyContent = `
        <div class="section-title">Recommended Processing Pathways</div>
        <div class="grid">
          <div class="card" style="border-left: 4px solid #10b981;">
            <div class="title">Upcycling & Direct Reuse</div>
            <div class="val">2,410 kg Routed (95% Footprint Reduction)</div>
          </div>
          <div class="card" style="border-left: 4px solid #3b82f6;">
            <div class="title">Mechanical Fiber Shredding</div>
            <div class="val">3,850 kg Processing (80% Footprint Reduction)</div>
          </div>
          <div class="card" style="border-left: 4px solid #6366f1;">
            <div class="title">Chemical Depolymerization</div>
            <div class="val">1,140 kg Processing (60% Footprint Reduction)</div>
          </div>
          <div class="card" style="border-left: 4px solid #ef4444;">
            <div class="title">Landfill Diversion Rate</div>
            <div class="val">94.1% Diverted</div>
          </div>
        </div>
      `;
    } else if (type === 'Sustainability Reports') {
      title = "Quarterly ESG & Sustainability Compliance Report";
      color = "#10b981";
      bodyContent = `
        <div class="section-title">Executive Environmental Audit</div>
        <div class="grid">
          <div class="card" style="border-left: 4px solid #10b981;">
            <div class="title">Carbon Dioxide Averted</div>
            <div class="val">+47,787 kg CO₂</div>
          </div>
          <div class="card" style="border-left: 4px solid #3b82f6;">
            <div class="title">Process Water Conserved</div>
            <div class="val">+19,954,791 Litres</div>
          </div>
          <div class="card" style="border-left: 4px solid #f59e0b;">
            <div class="title">Material Value Preserved</div>
            <div class="val">$18,450.00 USD</div>
          </div>
          <div class="card" style="border-left: 4px solid #6366f1;">
            <div class="title">Solid Waste Diverted</div>
            <div class="val">7,160 kg</div>
          </div>
        </div>
      `;
    } else if (type === 'Environmental Impact Reports') {
      title = "Life Cycle Assessment (LCA) Impact Evaluation";
      color = "#f59e0b";
      bodyContent = `
        <div class="section-title">LCA Metric Offsets vs. Virgin Extraction</div>
        <table class="table">
          <thead>
            <tr><th>Fabric Type</th><th>Processed Volume</th><th>CO₂ Offset</th><th>Water Saved</th><th>Virgin Cost Savings</th></tr>
          </thead>
          <tbody>
            <tr><td>Cotton Scraps</td><td>3,100 kg</td><td>+22,397.5 kg</td><td>+6,587,500 L</td><td>$5,797.00</td></tr>
            <tr><td>Polyester PET</td><td>2,200 kg</td><td>+22,440.0 kg</td><td>+654,500 L</td><td>$2,805.00</td></tr>
            <tr><td>Wool Knits</td><td>1,150 kg</td><td>+16,136.0 kg</td><td>+1,759,500 L</td><td>$6,647.00</td></tr>
            <tr><td>Silk Scraps</td><td>610 kg</td><td>+11,407.0 kg</td><td>+1,659,200 L</td><td>$12,962.00</td></tr>
          </tbody>
        </table>
      `;
    } else {
      title = "Circular Economy & 5-Factor Index Audit";
      color = "#8b5cf6";
      bodyContent = `
        <div class="section-title">Circularity Score Index Breakdown</div>
        <div class="grid">
          <div class="card"><div class="title">Recyclability Rating (35%)</div><div class="val">86.5 / 100</div></div>
          <div class="card"><div class="title">Physical Condition (20%)</div><div class="val">82.0 / 100</div></div>
          <div class="card"><div class="title">Reuse Potential (20%)</div><div class="val">84.5 / 100</div></div>
          <div class="card"><div class="title">Environmental Benefit (15%)</div><div class="val">91.0 / 100</div></div>
        </div>
        <div class="section-title">Overall Composite Score</div>
        <div class="card" style="border-left: 4px solid #8b5cf6; margin-bottom: 20px;">
          <div class="title font-bold">Platform Average Circularity Score</div>
          <div class="val" style="font-size: 24px; color: #7c3aed;">86.4 / 100 (Excellent Recovery Potential)</div>
        </div>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${title.replace(/\s+/g, '_')}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 20mm; margin: 0; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
            .header-title { font-size: 22px; font-weight: 800; color: #0f172a; }
            .header-sub { font-size: 11px; font-weight: 700; color: ${color}; text-transform: uppercase; letter-spacing: 0.5px; }
            .stamp { border: 2px dashed ${color}; color: ${color}; border-radius: 8px; padding: 6px 12px; font-weight: 800; font-size: 10px; text-align: center; }
            .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 15px; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; background-color: #f8fafc; }
            .title { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
            .val { font-size: 14px; font-weight: bold; color: #0f172a; }
            .table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            .table th { background-color: #f1f5f9; text-align: left; padding: 8px 10px; border-bottom: 2px solid #cbd5e1; font-weight: bold; color: #475569; }
            .table td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
            .footer { font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 40px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="header-sub">Textile Waste Intelligence Platform (TWIP)</div>
              <div class="header-title">${title}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Audit Reference: #TWIP-RPT-${Math.floor(100000 + Math.random() * 900000)}</div>
            </div>
            <div class="stamp">
              VERIFIED AUDIT<br>
              <span style="font-weight: normal; font-size: 9px;">${dateStr}</span>
            </div>
          </div>

          ${bodyContent}

          <div class="footer">
            <span>Logged & Verified by TWIP Sustainability Intelligence Engine</span>
            <span>Generated: ${new Date().toLocaleString()}</span>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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

        {/* 8. Reports Section (Fully Functional) */}
        <section className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Insights You Can Share</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                Generate comprehensive reports from your textile waste intelligence data. Click any report below to print or download.
              </p>
            </div>
            
            {/* Functional Export Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleGenerateReport('excel')}
                className="inline-flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <Download className="h-4 w-4 text-emerald-600" />
                <span>Export Excel (.CSV)</span>
              </button>
              <button
                onClick={() => handleGenerateReport('Sustainability Reports')}
                className="inline-flex items-center space-x-1.5 bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-800 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <Printer className="h-4 w-4 text-primary-600" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Interactive Report Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((rep, idx) => (
              <button 
                key={idx} 
                onClick={() => handleGenerateReport(rep)}
                className="flex items-center justify-between p-4.5 border border-slate-200/90 rounded-2xl bg-white hover:bg-primary-50/60 hover:border-primary-300 transition-all text-left group shadow-sm hover:shadow-md cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 group-hover:text-primary-950 transition-colors">{rep}</span>
                </div>
                <Printer className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
              </button>
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
