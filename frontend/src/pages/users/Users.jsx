import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import UserStats from "../../components/users/UserStats";
import UserToolbar from "../../components/users/UserToolbar";
import UsersTable from "../../components/users/UsersTable";
import AddUserModal from "../../components/users/AddUserModal";
import EditUserModal from "../../components/users/EditUserModal";
import DeleteUserModal from "../../components/users/DeleteUserModal";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
}

function Users() {
  const [users, setUsers] = useState([]);

  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    administrators: 0,
    managers: 0,
  });

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All Roles");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  // ============================================================
  // AXIOS CONFIG
  // ============================================================

  const getConfig = () => {
    const token = getToken();

    return token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {};
  };

  // ============================================================
  // LOAD USERS + STATS
  // ============================================================

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (role !== "All Roles") {
        params.role = role;
      }

      const [usersResponse, statsResponse] =
        await Promise.all([
          axios.get(`${API_URL}/users/`, {
            ...getConfig(),
            params,
          }),

          axios.get(
            `${API_URL}/users/stats`,
            getConfig()
          ),
        ]);

      setUsers(usersResponse.data || []);

      setStats(
        statsResponse.data || {
          total_users: 0,
          active_users: 0,
          administrators: 0,
          managers: 0,
        }
      );
    } catch (err) {
      console.error("Load users error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load users. Please check the backend and login session."
      );
    } finally {
      setLoading(false);
    }
  }, [search, role]);

  // ============================================================
  // INITIAL LOAD + SEARCH/FILTER
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadUsers]);

  // ============================================================
  // ADD USER
  // ============================================================

  const handleAddUser = async (formData) => {
    try {
      await axios.post(
        `${API_URL}/users/`,
        formData,
        getConfig()
      );

      setShowAddModal(false);

      await loadUsers();
    } catch (err) {
      throw new Error(
        err.response?.data?.detail ||
          "Unable to create user.",
        {
          cause: err,
        }
      );
    }
  };

  // ============================================================
  // EDIT USER
  // ============================================================

  const handleEditUser = async (formData) => {
    if (!selectedUser) return;

    try {
      await axios.put(
        `${API_URL}/users/${selectedUser.id}`,
        formData,
        getConfig()
      );

      setShowEditModal(false);
      setSelectedUser(null);

      await loadUsers();
    } catch (err) {
      throw new Error(
        err.response?.data?.detail ||
          "Unable to update user.",
        {
          cause: err,
        }
      );
    }
  };

  // ============================================================
  // DELETE USER
  // ============================================================

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await axios.delete(
        `${API_URL}/users/${selectedUser.id}`,
        getConfig()
      );

      setShowDeleteModal(false);
      setSelectedUser(null);

      await loadUsers();
    } catch (err) {
      throw new Error(
        err.response?.data?.detail ||
          "Unable to delete user.",
        {
          cause: err,
        }
      );
    }
  };

  // ============================================================
  // OPEN EDIT
  // ============================================================

  const openEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  // ============================================================
  // OPEN DELETE
  // ============================================================

  const openDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // ============================================================
  // CLEAR ERROR
  // ============================================================

  const clearError = () => {
    setError("");
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <>
      <div className="space-y-8">

        {/* PAGE HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-heading">
            User Management
          </h1>

          <p className="mt-2 text-muted">
            Manage system users, assign roles, monitor
            account status, and control access permissions
            across the Textile Waste Intelligence Platform.
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={clearError}
              className="font-semibold"
            >
              ×
            </button>
          </div>
        )}

        {/* USER STATS */}
        <section>
          <h2 className="mb-5 text-xl font-semibold text-heading">
            User Overview
          </h2>

          <UserStats
            stats={stats}
            loading={loading}
          />
        </section>

        {/* TOOLBAR */}
        <UserToolbar
          search={search}
          role={role}
          onSearchChange={setSearch}
          onRoleChange={setRole}
          onAddUser={() => setShowAddModal(true)}
          onRefresh={loadUsers}
          loading={loading}
        />

        {/* USERS TABLE */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-heading">
              System Users
            </h2>

            <p className="mt-1 text-sm text-muted">
              View, manage and administer all registered
              users.
            </p>
          </div>

          <UsersTable
            users={users}
            loading={loading}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        </section>
      </div>

      {/* ADD USER MODAL */}
      <AddUserModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
      />

      {/* EDIT USER MODAL */}
      <EditUserModal
        open={showEditModal}
        user={selectedUser}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSubmit={handleEditUser}
      />

      {/* DELETE USER MODAL */}
      <DeleteUserModal
        open={showDeleteModal}
        user={selectedUser}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
      />
    </>
  );
}

export default Users;