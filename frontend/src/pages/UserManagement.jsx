import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

const ROLES = [
  "ADMIN",
  "OPERATOR",
  "MANUFACTURER",
  "SUSTAINABILITY_MANAGER",
  "WASTE_OPERATIONS",
  "ANALYTICS",
  "MANAGEMENT"
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await apiClient.get("/users");
      setUsers(response.data || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Administrator access is required."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateStatus(user) {
    try {
      await apiClient.patch(
        `/users/${user.id}/status`,
        { is_active: !user.is_active }
      );
      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to update user status."
      );
    }
  }

  async function updateRole(user, role) {
    try {
      await apiClient.patch(
        `/users/${user.id}/role`,
        { role_name: role }
      );
      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to update user role."
      );
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="page-eyebrow">MANAGEMENT</span>
          <h1>User Management</h1>
          <p>Manage platform users, roles and account access.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <section className="content-card">
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.full_name}</strong>
                      <br />
                      <small>{user.email}</small>
                    </td>

                    <td>
                      <select
                        value={user.role || ""}
                        onChange={(e) =>
                          updateRole(user, e.target.value)
                        }
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      {user.is_active ? "Active" : "Inactive"}
                    </td>

                    <td>
                      {user.is_verified ? "Verified" : "Pending"}
                    </td>

                    <td>
                      <button
                        onClick={() => updateStatus(user)}
                      >
                        {user.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
