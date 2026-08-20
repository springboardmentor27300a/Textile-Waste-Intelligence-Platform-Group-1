"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Leaf, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@textile.com");
  const [password, setPassword] = useState("admin123");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: "Admin", email: "admin@textile.com", pass: "admin123", color: "badge-red" },
    { role: "Sustainability Mgr", email: "priya@textile.com", pass: "demo123", color: "badge-green" },
    { role: "Manufacturer", email: "rahul@textile.com", pass: "demo123", color: "badge-blue" },
    { role: "Recycling Operator", email: "anita@textile.com", pass: "demo123", color: "badge-purple" },
  ];

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <p className="font-black text-xl gradient-text">TWIP</p>
                <p className="text-xs text-gray-500">Textile Waste Intelligence</p>
              </div>
            </Link>
            <h1 className="text-3xl font-black text-white">Welcome Back</h1>
            <p className="text-gray-400 mt-2">Sign in to your dashboard</p>
          </div>

          {/* Demo accounts */}
          <div className="glass-card p-4 mb-6">
            <p className="text-xs text-gray-400 mb-3 font-semibold">🎯 Quick Login (Demo Accounts)</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <button key={acc.role} onClick={() => { setEmail(acc.email); setPassword(acc.pass); }}
                  className="text-left p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  <span className={`${acc.color} text-xs`}>{acc.role}</span>
                  <p className="text-xs text-gray-400 truncate">{acc.email}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="input-field pl-11" placeholder="your@email.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    className="input-field pl-11 pr-11" placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300">Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><span>Sign In</span><ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
            <p className="text-center text-gray-500 text-sm mt-6">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary-400 hover:text-primary-300 font-semibold">Register</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
