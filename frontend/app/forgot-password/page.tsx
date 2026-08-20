"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/auth/forgot-password?email=${email}`);
    } catch {}
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                <Leaf className="w-7 h-7 text-white" />
              </div>
            </Link>
            <h1 className="text-3xl font-black text-white">Reset Password</h1>
            <p className="text-gray-400 mt-2">Enter your email to receive a reset link</p>
          </div>
          <div className="glass-card p-8">
            {sent ? (
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Email Sent!</h2>
                <p className="text-gray-400 text-sm mb-6">If an account with {email} exists, a reset link has been sent.</p>
                <Link href="/login" className="btn-primary inline-flex items-center gap-2">Back to Login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="input-field pl-11" placeholder="your@email.com" required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Send Reset Link"}
                </button>
              </form>
            )}
            <p className="text-center text-gray-500 text-sm mt-6">
              <Link href="/login" className="text-primary-400 hover:text-primary-300 inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
