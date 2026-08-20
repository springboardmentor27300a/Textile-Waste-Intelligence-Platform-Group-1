import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

function RoleBadge({ role }) {
  const normalized = String(role || "")
    .toLowerCase();

  const label =
    normalized === "administrator"
      ? "Administrator"
      : normalized === "manager"
      ? "Manager"
      : normalized === "manufacturer"
      ? "Manufacturer"
      : normalized === "recycler"
      ? "Recycler"
      : normalized === "operator"
      ? "Operator"
      : role || "Unknown";

  const styles = {
    administrator: "bg-red-100 text-red-700",
    manager: "bg-blue-100 text-blue-700",
    manufacturer: "bg-purple-100 text-purple-700",
    recycler: "bg-emerald-100 text-emerald-700",
    operator: "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[normalized] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {label}
    </span>
  );
}

function StatusBadge() {
  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      Active
    </span>
  );
}

function Avatar({ name }) {
  const initials = String(name || "U")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
      {initials}
    </div>
  );
}

function UsersTable({
  users,
  loading,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm font-semibold text-slate-600">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Organization</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-sm text-muted"
                >
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-sm text-muted"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t transition hover:bg-slate-50"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar name={user.full_name} />

                      <div>
                        <h3 className="font-semibold text-heading">
                          {user.full_name}
                        </h3>

                        <p className="text-sm text-muted">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <RoleBadge role={user.role} />
                  </td>

                  <td className="px-6 py-5 text-sm text-slate-700">
                    {user.organization_name || "—"}
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge />
                  </td>

                  <td className="px-6 py-5 text-sm text-slate-700">
                    {user.organization_contact || "—"}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg p-2 transition hover:bg-blue-100"
                        title="View User"
                        onClick={() =>
                          alert(
                            `${user.full_name}\n${user.email}\nRole: ${user.role}`
                          )
                        }
                      >
                        <Eye
                          size={18}
                          className="text-blue-600"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        className="rounded-lg p-2 transition hover:bg-amber-100"
                        title="Edit User"
                      >
                        <Pencil
                          size={18}
                          className="text-amber-600"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(user)}
                        className="rounded-lg p-2 transition hover:bg-red-100"
                        title="Delete User"
                      >
                        <Trash2
                          size={18}
                          className="text-red-600"
                        />
                      </button>

                      <button
                        type="button"
                        className="rounded-lg p-2 transition hover:bg-slate-100"
                        title="More"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersTable;