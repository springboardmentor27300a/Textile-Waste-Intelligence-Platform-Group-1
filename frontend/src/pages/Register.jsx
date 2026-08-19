import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !/[A-Z]/.test(form.password) ||
      !/[a-z]/.test(form.password) ||
      !/[0-9]/.test(form.password) ||
      form.password.length < 8
    ) {
      setError(
        "Password must contain at least 8 characters, including uppercase, lowercase and a number."
      );
      return;
    }

    setSubmitting(true);

    try {
      await register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || null,
      });

      setSuccess(
        "Account created successfully. Redirecting to sign in..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item.msg)
            .join(" ")
        );
      } else {
        setError(
          detail ||
            "Unable to create your account."
        );
      }
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
            Sustainable Manufacturing
          </span>

          <h1>
            Build a smarter textile circularity
            workflow.
          </h1>

          <p>
            Register waste, manage facilities and prepare
            textile data for AI-powered material analysis,
            recovery recommendations and sustainability
            reporting.
          </p>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-brand">
            <Leaf />
            <strong>Textile Waste Intelligence</strong>
          </div>

          <span className="eyebrow">
            Get started
          </span>

          <h2>Create your account</h2>

          <p className="auth-subtitle">
            Create a manufacturer account to access the
            platform.
          </p>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <label>
              Full name

              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Your full name"
                minLength={2}
                required
              />
            </label>

            <label>
              Work email

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
              />
            </label>

            <label>
              Phone number

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Optional"
              />
            </label>

            <label>
              Password

              <div className="password-field">
                <input
                  type={
                    showPassword ? "text" : "password"
                  }
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </label>

            <p className="password-help">
              Use uppercase, lowercase and at least one
              number.
            </p>

            <button
              className="primary-button auth-submit"
              disabled={submitting}
              type="submit"
            >
              {submitting
                ? "Creating account..."
                : "Create account"}

              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}