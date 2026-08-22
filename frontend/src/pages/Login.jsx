import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-emerald-500/20">
            R
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reloom Textile Platform</h1>
          <p className="text-xs text-slate-400">Sign in to access AI textile classification & dashboards</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold text-white transition shadow-lg shadow-emerald-500/20 text-sm disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-xs text-center text-slate-400 pt-2">
            Don't have an account?{" "}
            <Link to="/register" className="text-emerald-400 hover:underline font-semibold">
              Register here
            </Link>
          </p>
        </form>

        {/* Demo Accounts Quick-Select */}
        <div className="glass-card rounded-2xl border border-slate-800 p-4 space-y-2.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Quick 1-Click Role Login
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin("admin@textilewaste.io", "Admin@12345")}
              className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 text-left font-medium"
            >
              <div className="font-bold">Administrator</div>
              <div className="text-[10px] text-slate-400">admin@textilewaste.io</div>
            </button>

            <button
              onClick={() => handleQuickLogin("operator@textilewaste.io", "Operator@12345")}
              className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 text-left font-medium"
            >
              <div className="font-bold">Recycling Operator</div>
              <div className="text-[10px] text-slate-400">operator@textilewaste.io</div>
            </button>

            <button
              onClick={() => handleQuickLogin("sustainability@textilewaste.io", "Sustain@12345")}
              className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 text-left font-medium"
            >
              <div className="font-bold">Sustainability Manager</div>
              <div className="text-[10px] text-slate-400">sustainability@textilewaste.io</div>
            </button>

            <button
              onClick={() => handleQuickLogin("manufacturer@textilewaste.io", "Manuf@12345")}
              className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 text-left font-medium"
            >
              <div className="font-bold">Manufacturer</div>
              <div className="text-[10px] text-slate-400">manufacturer@textilewaste.io</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
