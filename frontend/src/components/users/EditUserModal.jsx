import { useEffect, useState } from "react";
import { X } from "lucide-react";

function EditUserModal({
  open,
  user,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        email: user.email || "",
        role: user.role || "operator",
        organization_name: user.organization_name || "",
        organization_type: user.organization_type || "",
        business_category: user.business_category || "",
        organization_contact:
          user.organization_contact || "",
        password: "",
      });
    }
  }, [user]);

  if (!open || !user) return null;

  const change = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSaving(true);

      const payload = { ...form };

      if (!payload.password) {
        delete payload.password;
      }

      await onSubmit(payload);
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
              Edit User
            </h2>
            <p className="mt-1 text-sm text-muted">
              Update user information.
            </p>
          </div>

          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
            <input
              value={form.full_name || ""}
              onChange={(e) =>
                change("full_name", e.target.value)
              }
              placeholder="Full name"
              className="rounded-xl border px-4 py-3"
            />

            <input
              value={form.email || ""}
              onChange={(e) =>
                change("email", e.target.value)
              }
              type="email"
              placeholder="Email"
              className="rounded-xl border px-4 py-3"
            />

            <select
              value={form.role || "operator"}
              onChange={(e) =>
                change("role", e.target.value)
              }
              className="rounded-xl border px-4 py-3"
            >
              <option value="operator">Operator</option>
              <option value="manager">Manager</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="recycler">Recycler</option>
              <option value="administrator">Administrator</option>
            </select>

            <input
              value={form.organization_name || ""}
              onChange={(e) =>
                change(
                  "organization_name",
                  e.target.value
                )
              }
              placeholder="Organization"
              className="rounded-xl border px-4 py-3"
            />

            <input
              value={form.organization_type || ""}
              onChange={(e) =>
                change(
                  "organization_type",
                  e.target.value
                )
              }
              placeholder="Organization type"
              className="rounded-xl border px-4 py-3"
            />

            <input
              value={form.business_category || ""}
              onChange={(e) =>
                change(
                  "business_category",
                  e.target.value
                )
              }
              placeholder="Business category"
              className="rounded-xl border px-4 py-3"
            />

            <input
              value={form.organization_contact || ""}
              onChange={(e) =>
                change(
                  "organization_contact",
                  e.target.value
                )
              }
              placeholder="Organization contact"
              className="rounded-xl border px-4 py-3"
            />

            <input
              value={form.password || ""}
              onChange={(e) =>
                change("password", e.target.value)
              }
              type="password"
              placeholder="New password (optional)"
              className="rounded-xl border px-4 py-3"
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
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;