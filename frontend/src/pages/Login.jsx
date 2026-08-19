import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(
        form.email.trim(),
        form.password
      );

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to sign in. Please check your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="brand-icon">
            <Leaf size={28} />
          </div>

          <div>
            <strong>Textile Waste</strong>
            <span>Intelligence Platform</span>
          </div>
        </div>

        <div className="auth-brand-content">
          <span className="eyebrow">
            Circular Intelligence Platform
          </span>

          <h1>
            Turn textile waste into measurable
            circular value.
          </h1>

          <p>
            Manage waste inventory, analyse materials,
            measure environmental impact and discover
            sustainable recovery opportunities from one
            intelligent platform.
          </p>

          <div className="auth-feature-grid">
            <div>
              <strong>Inventory</strong>
              <span>Track textile waste batches</span>
            </div>

            <div>
              <strong>AI Analysis</strong>
              <span>Classify materials intelligently</span>
            </div>

            <div>
              <strong>Impact</strong>
              <span>Measure sustainability outcomes</span>
            </div>

            <div>
              <strong>Recovery</strong>
              <span>Generate circular recommendations</span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-brand">
            <Leaf />
            <strong>Textile Waste Intelligence</strong>
          </div>

          <span className="eyebrow">Welcome back</span>

          <h2>Sign in to your account</h2>

          <p className="auth-subtitle">
            Access your textile waste intelligence workspace.
          </p>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <label>
              Email address

              <div className="input-with-icon">
                <Mail size={18} />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </label>

            <label>
              Password

              <div className="input-with-icon">
                <LockKeyhole size={18} />

                <input
                  type={
                    showPassword ? "text" : "password"
                  }
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </label>

            <button
              className="primary-button auth-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Signing in..."
                : "Sign in"}

              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            New to the platform?{" "}
            <Link to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}