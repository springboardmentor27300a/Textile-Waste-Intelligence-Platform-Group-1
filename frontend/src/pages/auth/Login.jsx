import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Brain,
  Boxes,
  Leaf,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { Button, Input } from "../../components/ui";
import { loginUser } from "../../api/authApi";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(formData);

      localStorage.setItem(
        "access_token",
        response.data.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">

      <div className="w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-card">

        <div className="grid min-h-[600px] lg:grid-cols-2">

          {/* LEFT PANEL */}

          <section className="relative hidden overflow-hidden bg-sidebar text-white lg:flex">

            <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl"></div>

            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-secondary/15 blur-3xl"></div>

            <div className="relative flex h-full w-full flex-col justify-between p-8">

              <div>

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 font-bold">
                    TW
                  </div>

                  <div>

                    <h2 className="text-xl font-bold">
                      TWIP
                    </h2>

                    <p className="text-[11px] text-gray-300">
                      Textile Waste Intelligence Platform
                    </p>

                  </div>

                </div>

                <h1 className="mt-8 text-4xl font-bold leading-tight">
                  AI-Powered
                  <br />
                  Textile Waste Intelligence
                </h1>

                <p className="mt-6 max-w-sm text-sm leading-7 text-gray-300">
                  Empowering organizations with AI-driven textile classification,
                  inventory management and sustainability analytics.
                </p>

              </div>

              <div className="space-y-3">

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">

                  <div className="flex gap-3">

                    <div className="rounded-lg bg-blue-500/20 p-2">
                      <Brain className="h-4 w-4 text-blue-400" />
                    </div>

                    <div>

                      <h3 className="font-semibold text-sm">
                        AI Material Classification
                      </h3>

                      <p className="text-xs text-gray-300">
                        Automatically identify textile materials.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">

                  <div className="flex gap-3">

                    <div className="rounded-lg bg-green-500/20 p-2">
                      <Boxes className="h-4 w-4 text-green-400" />
                    </div>

                    <div>

                      <h3 className="font-semibold text-sm">
                        Smart Inventory
                      </h3>

                      <p className="text-xs text-gray-300">
                        Track inventory efficiently.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">

                  <div className="flex gap-3">

                    <div className="rounded-lg bg-secondary/20 p-2">
                      <Leaf className="h-4 w-4 text-green-400" />
                    </div>

                    <div>

                      <h3 className="font-semibold text-sm">
                        Sustainability Analytics
                      </h3>

                      <p className="text-xs text-gray-300">
                        Measure environmental impact.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* RIGHT PANEL */}

          <section className="flex items-center justify-center p-8 lg:p-12">

            <div className="w-full max-w-lg">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-accent">

                <ShieldCheck size={16} />

                Secure Enterprise Login

              </div>

              <h1 className="text-4xl font-bold text-heading">
                Welcome Back
              </h1>

              <p className="mt-3 text-muted">
                Sign in to continue.
              </p>

              <div className="mt-8 space-y-5">

                <Input
                  label="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  icon={Mail}
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  icon={Lock}
                />

                {error && (
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-between">

                  <label className="flex items-center gap-2 text-sm">

                    <input type="checkbox" />

                    Remember me

                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm text-accent hover:underline"
                  >
                    Forgot Password?
                  </Link>

                </div>

                <Button
                  fullWidth
                  loading={loading}
                  onClick={handleLogin}
                >

                  <div className="flex items-center gap-2">

                    Sign In

                    <ArrowRight size={18} />

                  </div>

                </Button>

              </div>

              <p className="mt-8 text-center">

                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="font-semibold text-accent"
                >
                  Create Account
                </Link>

              </p>

            </div>

          </section>

        </div>

      </div>

    </div>
  );
}

export default Login;