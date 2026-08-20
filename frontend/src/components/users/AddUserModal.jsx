import { useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  full_name: "",
  email: "",
  role: "operator",
  organization_name: "",
  organization_type: "",
  business_category: "",
  organization_contact: "",
  password: "",
};

function AddUserModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const change = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.full_name || !form.email || !form.password) {
      setError("Name, email and password are required.");
      return;
    }

    try {
      setSaving(true);
      await onSubmit(form);
      setForm(initialForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-heading">
              Add New User
            </h2>

            <p className="mt-1 text-sm text-muted">
              Create a new system account.
            </p>
          </div>

          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
            <input
              value={form.full_name}
              onChange={(e) => change("full_name", e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              value={form.email}
              onChange={(e) => change("email", e.target.value)}
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            <select
              value={form.role}
              onChange={(e) => change("role", e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="operator">Operator</option>
              <option value="manager">Manager</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="recycler">Recycler</option>
              <option value="administrator">Administrator</option>
            </select>

            <input
              value={form.organization_name}
              onChange={(e) =>
                change("organization_name", e.target.value)
              }
              placeholder="Organization"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              value={form.organization_type}
              onChange={(e) =>
                change("organization_type", e.target.value)
              }
              placeholder="Organization type"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              value={form.business_category}
              onChange={(e) =>
                change("business_category", e.target.value)
              }
              placeholder="Business category"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              value={form.organization_contact}
              onChange={(e) =>
                change("organization_contact", e.target.value)
              }
              placeholder="Organization contact"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              value={form.password}
              onChange={(e) => change("password", e.target.value)}
              type="password"
              placeholder="Temporary password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          {error && (
            <p className="px-6 pb-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t px-6 py-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-6 py-2.5"
            >
              Cancel
            </button>

            <button
              disabled={saving}
              className="rounded-xl bg-primary px-6 py-2.5 font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Creating..." : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserModal;