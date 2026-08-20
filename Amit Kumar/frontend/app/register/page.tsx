"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Leaf, Eye, EyeOff, Mail, Lock, User, ChevronDown, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const ROLES = [
  { value: "textile_manufacturer", label: "Textile Manufacturer" },
  { value: "sustainability_manager", label: "Sustainability Manager" },
  { value: "recycling_facility_operator", label: "Recycling Facility Operator" },
  { value: "admin", label: "Admin" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "textile_manufacturer",
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  // Password strength
  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : form.password.match(/[A-Z]/) && form.password.match(/[0-9]/) ? 4
    : 3;

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Email address is required");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirm_password) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Logo + Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <p className="font-black text-xl gradient-text">TWIP</p>
                <p className="text-xs text-gray-500">Textile Waste Intelligence</p>
              </div>
            </Link>
            <h1 className="text-3xl font-black text-white">Create Account</h1>
            <p className="text-gray-400 mt-2 text-sm">Join the sustainability revolution today</p>
          </div>

          {/* Form Card */}
          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Full Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    value={form.full_name}
                    onChange={e => set("full_name", e.target.value)}
                    className="input-field pl-11"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                    className="input-field pl-11"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Your Role *</label>
                <div className="relative">
                  <select
                    value={form.role}
                    onChange={e => set("role", e.target.value)}
                    className="input-field appearance-none pr-10"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "white" }}
                  >
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value} style={{ background: "#1e293b", color: "white" }}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={e => set("password", e.target.value)}
                    className="input-field pl-11 pr-11"
                    placeholder="Minimum 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Password Strength */}
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength ? strengthColor[strength] : "rgba(255,255,255,0.1)" }}
                        />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: strengthColor[strength] }}>
                      Password strength: {strengthLabel[strength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm_password}
                    onChange={e => set("confirm_password", e.target.value)}
                    className="input-field pl-11 pr-11"
                    placeholder="Re-enter your password"
                    required
                    style={{
                      borderColor: form.confirm_password && form.confirm_password !== form.password
                        ? "rgba(239,68,68,0.6)"
                        : form.confirm_password && form.confirm_password === form.password
                          ? "rgba(16,185,129,0.6)"
                          : undefined
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Match indicator */}
                {form.confirm_password.length > 0 && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${form.password === form.confirm_password ? "text-primary-400" : "text-red-400"}`}>
                    {form.password === form.confirm_password
                      ? <><CheckCircle className="w-3 h-3" /> Passwords match!</>
                      : "⚠️ Passwords do not match"
                    }
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                style={{ padding: "0.875rem 1.5rem", fontSize: "1rem" }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account →"
                )}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary-400 hover:text-primary-300 font-semibold">
                Sign In
              </Link>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
