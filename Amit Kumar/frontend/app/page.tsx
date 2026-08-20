"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Leaf, Brain, BarChart3, Recycle, Shield, Zap,
  ArrowRight, CheckCircle, ChevronRight, Globe, Users, TrendingUp,
  Mail, Phone, MapPin, ExternalLink
} from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    desc: "Advanced computer vision detects fabric type, quality, and damage with 94%+ accuracy using deep learning.",
    color: "from-primary-500 to-primary-700",
    glow: "glow-green"
  },
  {
    icon: Recycle,
    title: "Smart Recycling Engine",
    desc: "Generate personalized recycling recommendations from 7+ proven pathways tailored to each waste batch.",
    color: "from-secondary-500 to-secondary-700",
    glow: "glow-blue"
  },
  {
    icon: BarChart3,
    title: "Sustainability Analytics",
    desc: "Track CO₂ reduction, water savings, energy recovery and circular economy scores in real-time.",
    color: "from-purple-500 to-purple-700",
    glow: ""
  },
  {
    icon: Shield,
    title: "Compliance & Reporting",
    desc: "Generate PDF/Excel reports for regulatory compliance, ESG reporting, and sustainability audits.",
    color: "from-orange-500 to-orange-700",
    glow: ""
  },
  {
    icon: Globe,
    title: "Environmental Impact",
    desc: "Visualize your environmental contribution with detailed CO₂ reduction and landfill diversion metrics.",
    color: "from-teal-500 to-teal-700",
    glow: ""
  },
  {
    icon: Users,
    title: "Multi-Role Platform",
    desc: "Purpose-built workflows for Admins, Sustainability Managers, Manufacturers, and Recycling Operators.",
    color: "from-pink-500 to-pink-700",
    glow: ""
  }
];

const steps = [
  { step: "01", title: "Upload Textile Images", desc: "Drag and drop or upload images of your textile waste. Our AI instantly processes the visual data." },
  { step: "02", title: "AI Classification", desc: "Our ML models identify fabric type, condition, damage level, and color with precision." },
  { step: "03", title: "Get Recommendations", desc: "Receive tailored recycling, reuse, and upcycling recommendations with cost and impact data." },
  { step: "04", title: "Track & Report", desc: "Monitor sustainability metrics, generate compliance reports, and export data for audits." }
];

const benefits = [
  "Reduce textile landfill by up to 78%",
  "Save 150+ liters of water per kg processed",
  "Cut CO₂ emissions by 2.3 kg per kg recycled",
  "Generate ESG-compliant sustainability reports",
  "Real-time inventory and batch tracking",
  "7 recycling pathways for every waste type",
  "Dummy AI predictions ready for ML swap-in",
  "Role-based access for entire teams"
];

const stats = [
  { value: "94.2%", label: "AI Detection Accuracy" },
  { value: "78%", label: "Landfill Reduction" },
  { value: "7+", label: "Recycling Pathways" },
  { value: "4", label: "User Roles Supported" }
];

export default function LandingPage() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5 border-x-0 border-t-0 rounded-none">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg gradient-text">TWIP</span>
              <p className="text-xs text-gray-500 -mt-0.5">Textile Waste Intelligence</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            {["Features", "How It Works", "Benefits", "Contact"].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="hover:text-white transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">Login</Link>
            <Link href="/register" className="btn-primary text-sm py-2">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-bg min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 rounded-full px-4 py-2 text-sm text-primary-400 mb-6">
                <Zap className="w-4 h-4" />
                <span>AI-Powered Textile Waste Management</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                Transform Textile Waste into{" "}
                <span className="gradient-text">Sustainable Value</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                The most advanced AI platform for textile waste classification, recycling optimization,
                and sustainability analytics. Built for manufacturers, recyclers, and sustainability leaders.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register" className="btn-primary flex items-center gap-2">
                  Start Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/login" className="btn-outline flex items-center gap-2">
                  Live Demo <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8">
                {stats.map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl font-black gradient-text">{s.value}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="relative">
              {/* Hero visual card */}
              <div className="gradient-border">
                <div className="glass-card p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-xs text-gray-500 ml-2">AI Analysis Result</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                        <span className="text-sm text-gray-300">Material Detected</span>
                        <span className="badge-green">Cotton — 94.2%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                        <span className="text-sm text-gray-300">Waste Category</span>
                        <span className="badge-blue">Recyclable — 89.5%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                        <span className="text-sm text-gray-300">Quality Score</span>
                        <span className="badge-yellow">Good — 76/100</span>
                      </div>
                      <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                        <p className="text-xs text-primary-400 font-semibold mb-1">Top Recommendation</p>
                        <p className="text-sm text-white">Fiber Recycling — 87.3% recovery rate</p>
                        <div className="progress-bar mt-2">
                          <div className="progress-fill bg-gradient-to-r from-primary-500 to-secondary-500" style={{width: "87%"}} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-white/5 rounded-lg text-center">
                          <p className="text-lg font-bold text-primary-400">2.3t</p>
                          <p className="text-xs text-gray-500">CO₂ Saved</p>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg text-center">
                          <p className="text-lg font-bold text-secondary-400">150L</p>
                          <p className="text-xs text-gray-500">Water</p>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg text-center">
                          <p className="text-lg font-bold text-purple-400">92%</p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <motion.div animate={{ float: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Brain className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-dark-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="badge-green mb-4 inline-block">Platform Features</span>
            <h2 className="text-4xl font-black mb-4">Everything You Need for <span className="gradient-text">Textile Sustainability</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">A complete ecosystem for managing textile waste from collection to recovery.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-8 hover:border-primary-500/30 transition-all duration-300 group">
                <div className={`w-14 h-14 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24" style={{background: "linear-gradient(180deg, #0f172a 0%, #0d1f1a 50%, #0f172a 100%)"}}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="badge-blue mb-4 inline-block">Simple Process</span>
            <h2 className="text-4xl font-black mb-4">How It <span className="gradient-text">Works</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.step} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent" />
                )}
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-black relative z-10">
                  {step.step}
                </div>
                <h3 className="font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-24 bg-dark-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="badge-green mb-4 inline-block">Why Choose TWIP</span>
              <h2 className="text-4xl font-black mb-6">Real Impact, <span className="gradient-text">Measurable Results</span></h2>
              <p className="text-gray-400 text-lg mb-8">Every kilogram of textile waste managed through our platform contributes to a measurable environmental impact.</p>
              <div className="grid grid-cols-2 gap-3">
                {benefits.map((b) => (
                  <div key={b} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{b}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/register" className="btn-primary inline-flex items-center gap-2">
                  Start Now <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: TrendingUp, label: "Sustainability Score", value: "94/100", color: "primary" },
                  { icon: Globe, label: "CO₂ Saved", value: "2.3 Tonnes", color: "secondary" },
                  { icon: Leaf, label: "Water Saved", value: "150,000L", color: "primary" },
                  { icon: Recycle, label: "Recovery Rate", value: "87.3%", color: "secondary" }
                ].map(item => (
                  <div key={item.label} className={`glass-card p-6 border-${item.color === 'primary' ? 'primary' : 'secondary'}-500/20`}>
                    <item.icon className={`w-8 h-8 text-${item.color === 'primary' ? 'primary' : 'secondary'}-400 mb-3`} />
                    <p className={`text-2xl font-black ${item.color === 'primary' ? 'text-primary-400' : 'text-secondary-400'}`}>{item.value}</p>
                    <p className="text-gray-400 text-sm">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24" style={{background: "linear-gradient(180deg, #0f172a 0%, #0d1f1a 100%)"}}>
        <div className="max-w-4xl mx-auto px-6">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black mb-4">Get In <span className="gradient-text">Touch</span></h2>
            <p className="text-gray-400">Have questions? We'd love to hear from you.</p>
          </motion.div>
          <div className="glass-card p-10">
            {submitted ? (
              <div className="text-center py-10">
                <CheckCircle className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                <p className="text-gray-400">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                    <input className="input-field" placeholder="Your name" required
                      value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                    <input className="input-field" type="email" placeholder="your@email.com" required
                      value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Message</label>
                  <textarea className="input-field" rows={4} placeholder="Tell us about your needs..."
                    value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary w-full">Send Message</button>
              </form>
            )}
          </div>
          <div className="grid grid-cols-3 gap-6 mt-10">
            {[
              { icon: Mail, label: "Email", value: "hello@twip.ai" },
              { icon: Phone, label: "Phone", value: "+91 98765 43210" },
              { icon: MapPin, label: "Office", value: "Mumbai, India" }
            ].map(c => (
              <div key={c.label} className="text-center">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <c.icon className="w-5 h-5 text-primary-400" />
                </div>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className="text-sm text-white font-medium">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold gradient-text">TWIP</p>
                <p className="text-xs text-gray-500">Textile Waste Intelligence Platform</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">© 2026 TWIP. Built for a sustainable future.</p>
            <div className="flex items-center gap-4">
              {["X", "LinkedIn", "GitHub"].map((name, i) => (
                <div key={i} className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
