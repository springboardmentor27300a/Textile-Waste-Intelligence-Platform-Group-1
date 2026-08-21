import { useState } from "react";
import { Link } from "react-router-dom";
import { api, setToken } from "../lib/api.js";
import { Leaf, Lock, Mail } from "../components/Icons.jsx";

const DEMO = [
  ["operator@twip.dev", "Recycling facility operator"],
  ["sustainability@twip.dev", "Sustainability manager"],
  ["manufacturer@twip.dev", "Textile manufacturer"],
  ["admin@twip.dev", "Administrator"],
];

const DEMO_PASSWORD = "textile2026";

export default function SignIn({ onSignedIn }) {
  const [email, setEmail] = useState("operator@twip.dev");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Normal Sign In button
  const submit = async (event) => {
    event.preventDefault();

    setBusy(true);
    setError("");

    try {
      const result = await api.login(email, password);

      setToken(result.access_token);
      onSignedIn(result.user);
    } catch (err) {
      setError(err.message || "Email or password doesn't match.");
    } finally {
      setBusy(false);
    }
  };

  // Demo account click → immediately login
  const loginWithDemo = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setBusy(true);
    setError("");

    try {
      const result = await api.login(demoEmail, DEMO_PASSWORD);

      setToken(result.access_token);
      onSignedIn(result.user);
    } catch (err) {
      setError(err.message || "Email or password doesn't match.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-[420px]">

        {/* Login Card */}
        <div className="card p-8 shadow-lift">

          {/* Logo / Heading */}
          <div className="flex flex-col items-center text-center">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-[#04140E]">
              <Leaf />
            </span>

            <h1 className="mt-4 font-display text-2xl font-bold">
              Welcome back
            </h1>

            <p className="mt-1 text-sm text-muted">
              Textile Waste Intelligence Platform
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={submit} className="mt-8 space-y-5">

            {/* Email */}
            <div>
              <label className="label" htmlFor="email">
                Email address
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                  <Mail />
                </span>

                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  className="field field-icon"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-baseline justify-between">
                <label className="label" htmlFor="password">
                  Password
                </label>

                <span className="text-xs text-muted">
                  Contact your administrator to reset
                </span>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                  <Lock />
                </span>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="field field-icon"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
                {error}
              </p>
            )}

            {/* Normal Sign In Button */}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={busy}
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-muted">
            New to TWIP?{" "}
            <Link
              to="/register"
              className="font-semibold text-brand hover:text-brand-dark"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Demo Accounts */}
        <div className="card mt-4 p-5">
          <p className="eyebrow">
            Demo accounts · password {DEMO_PASSWORD}
          </p>

          <ul className="mt-3 space-y-1.5">
            {DEMO.map(([demoEmail, role]) => (
              <li key={demoEmail}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => loginWithDemo(demoEmail)}
                  className="w-full rounded-lg px-2 py-2 text-left text-sm transition hover:bg-panel-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="font-mono text-xs">
                    {demoEmail}
                  </span>

                  <span className="text-muted">
                    {" "}— {role}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}