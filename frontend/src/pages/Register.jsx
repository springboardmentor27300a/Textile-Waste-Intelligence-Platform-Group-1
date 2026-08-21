import { useState } from "react";
import { Link } from "react-router-dom";
import { api, ROLE_LABEL, setToken } from "../lib/api.js";
import { Leaf, Lock, Mail, User } from "../components/Icons.jsx";

const ROLES = Object.keys(ROLE_LABEL);

export default function Register({ onSignedIn }) {
  const [form, setForm] = useState({
    full_name: "", email: "", organisation: "",
    role: "recycling_facility_operator", password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    if (form.password.length < 8) {
      setError("Use at least 8 characters for the password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api.register(form);
      setToken(result.access_token);
      onSignedIn(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-[460px]">
        <div className="card p-8 shadow-lift">
          <div className="flex flex-col items-center text-center">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-[#04140E]">
              <Leaf />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-muted">Textile Waste Intelligence Platform</p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                  <User />
                </span>
                <input id="name" className="field field-icon" required
                       value={form.full_name} onChange={set("full_name")} />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="reg-email">Email address</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                  <Mail />
                </span>
                <input id="reg-email" type="email" className="field field-icon" required
                       autoComplete="username" value={form.email} onChange={set("email")} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="org">Organisation</label>
                <input id="org" className="field" value={form.organisation}
                       onChange={set("organisation")} placeholder="Optional" />
              </div>
              <div>
                <label className="label" htmlFor="role">Role</label>
                <select id="role" className="field" value={form.role} onChange={set("role")}>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{ROLE_LABEL[role]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                  <Lock />
                </span>
                <input id="reg-password" type="password" className="field field-icon" required
                       autoComplete="new-password" minLength={8}
                       value={form.password} onChange={set("password")} />
              </div>
              <p className="mt-1.5 text-xs text-muted">At least 8 characters.</p>
            </div>

            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand hover:text-brand-dark">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
