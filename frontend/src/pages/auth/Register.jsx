import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Building2,
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import {
  Button,
  Input,
  Select,
} from "../../components/ui";

import { registerUser } from "../../api/authApi";

const organizationTypes = [
  { value: "Private", label: "Private" },
  { value: "Public", label: "Public" },
  { value: "Government", label: "Government" },
  { value: "NGO", label: "NGO" },
];

const businessCategories = [
  { value: "apparel", label: "Apparel Manufacturing" },
  { value: "garments", label: "Garment Production" },
  { value: "recycling", label: "Textile Recycling" },
  { value: "fashion", label: "Fashion & Retail" },
  { value: "research", label: "Research & Innovation" },
];

const roles = [
  { value: "manufacturer", label: "Textile Manufacturer" },
  { value: "recycler", label: "Recycling Facility Operator" },
  { value: "manager", label: "Sustainability Manager" },
];

function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    organization: "",
    organizationType: "",
    businessCategory: "",
    contact: "",
    full_name: "",
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async () => {
    setError("");

    if (
      !formData.full_name ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,

        organization_name: formData.organization,
        organization_type: formData.organizationType,
        business_category: formData.businessCategory,
        organization_contact: formData.contact,
      });

      alert("Registration successful!");

      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">

      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-card">

        {/* Header */}

        <div className="border-b border-gray-200 px-8 py-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
              TW
            </div>

            <div>

              <h1 className="text-2xl font-bold text-heading">
                Create Your Workspace
              </h1>

              <p className="mt-1 text-sm text-muted">
                Create a secure workspace to manage textile waste,
                sustainability and recycling operations.
              </p>

            </div>

          </div>

        </div>

        {/* Body */}

        <div className="grid gap-8 p-8 lg:grid-cols-2">

          {/* Organization */}

          <div>

            <div className="mb-6 flex items-center gap-3">

              <Building2
                size={22}
                className="text-accent"
              />

              <h2 className="text-xl font-semibold text-heading">
                Organization Details
              </h2>

            </div>

            <div className="space-y-5">

              <Input
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                label="Organization Name"
                placeholder="Enter organization name"
              />

              <Select
                name="organizationType"
                value={formData.organizationType}
                onChange={handleChange}
                label="Organization Type"
                options={organizationTypes}
              />

              <Select
                name="businessCategory"
                value={formData.businessCategory}
                onChange={handleChange}
                label="Business Category"
                options={businessCategories}
              />

              <Input
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                label="Organization Contact"
                placeholder="Enter organization contact number"
              />

            </div>

          </div>

          {/* Account */}

          <div>

            <div className="mb-6 flex items-center gap-3">

              <ShieldCheck
                size={22}
                className="text-accent"
              />

              <h2 className="text-xl font-semibold text-heading">
                Account Details
              </h2>

            </div>

            <div className="space-y-5">

              <Input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                label="Full Name"
                placeholder="Enter full name"
                icon={User}
                required
              />

              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                label="Work Email"
                placeholder="Enter work email"
                icon={Mail}
                required
              />

              <Input
                name="password"
                value={formData.password}
                onChange={handleChange}
                label="Password"
                type="password"
                placeholder="Create password"
                icon={Lock}
                required
              />

              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="User Role"
                options={roles}
                required
              />

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="border-t border-gray-200 px-8 py-6">

          {error && (
            <p className="mb-4 text-center text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-center">

            <div className="w-full max-w-md">

              <Button
                fullWidth
                loading={loading}
                onClick={handleRegister}
              >

                <div className="flex items-center justify-center gap-2">

                  Create Workspace

                  <ArrowRight size={18} />

                </div>

              </Button>

            </div>

          </div>

          <p className="mt-6 text-center text-body">

            Already have a workspace?{" "}

            <Link
              to="/login"
              className="font-semibold text-accent hover:underline"
            >
              Sign In
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;