import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    organization: "",
    password: "",
    role: "recycling_facility_operator",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.register(formData);
      await api.login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-400">Join the Textile Waste Intelligence Platform</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl border border-slate-800 p-6 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Asha Rao"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="asha@textile.com"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Organization / Facility</label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              placeholder="Bengaluru Sorting Unit"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="recycling_facility_operator">Recycling Facility Operator</option>
              <option value="sustainability_manager">Sustainability Manager</option>
              <option value="textile_manufacturer">Textile Manufacturer</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 8 characters"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold text-white transition shadow-lg shadow-emerald-500/20 text-sm disabled:opacity-50 mt-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-xs text-center text-slate-400 pt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-400 hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
