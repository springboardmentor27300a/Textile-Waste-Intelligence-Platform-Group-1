import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import {
    getAdminUsers,
    updateUserRole,
    updateUserStatus
} from "../../services/dashboardService";

import "./UserManagement.css";


function UserManagement() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [savingRole, setSavingRole] = useState(false);
    const [roleMessage, setRoleMessage] = useState("");
    const [savingStatus, setSavingStatus] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");


    // ==========================================
    // Load Users From Backend
    // ==========================================

    useEffect(() => {

        const loadUsers = async () => {

            try {

                setLoading(true);

                const response = await getAdminUsers();

                setUsers(response.data);

                setError("");

            } catch (err) {

                console.error(
                    "Failed to load users:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                    "Unable to load users."
                );

            } finally {

                setLoading(false);

            }

        };

        loadUsers();

    }, []);


    // ==========================================
    // Role Counts
    // ==========================================

    const totalUsers = users.length;

    const manufacturerCount = users.filter(
        user => user.role === "manufacturer"
    ).length;

    const sustainabilityManagerCount = users.filter(
        user => user.role === "sustainability_manager"
    ).length;

    const recyclingOperatorCount = users.filter(
        user => user.role === "recycling_operator"
    ).length;
    const handleRoleUpdate = async () => {

        if (!selectedUser) {
            return;
        }

        try {

            setSavingRole(true);
            setRoleMessage("");

            const response = await updateUserRole(
                selectedUser.id,
                selectedRole
            );

            // Update user in the table
            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === selectedUser.id
                        ? {
                            ...user,
                            role: response.data.user.role
                        }
                        : user
                )
            );

            // Update selected user
            setSelectedUser((currentUser) => ({
                ...currentUser,
                role: response.data.user.role
            }));

            setRoleMessage(
                "User role updated successfully."
            );

        } catch (err) {

            console.error(
                "Failed to update role:",
                err
            );

            setRoleMessage(
                err.response?.data?.detail ||
                "Failed to update user role."
            );

        } finally {

            setSavingRole(false);

        }

    };
    // ==========================================
    // Update User Status
    // ==========================================

    const handleStatusUpdate = async () => {

        if (!selectedUser) {
            return;
        }

        try {

            setSavingStatus(true);
            setStatusMessage("");

            const newStatus = !selectedUser.is_active;

            const response = await updateUserStatus(
                selectedUser.id,
                newStatus
            );

            // Update table
            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === selectedUser.id
                        ? {
                            ...user,
                            is_active: response.data.user.is_active
                        }
                        : user
                )
            );

            // Update selected user
            setSelectedUser((currentUser) => ({
                ...currentUser,
                is_active: response.data.user.is_active
            }));

            setStatusMessage(
                response.data.message
            );

        } catch (err) {

            console.error(
                "Failed to update status:",
                err
            );

            setStatusMessage(
                err.response?.data?.detail ||
                "Failed to update user status."
            );

        } finally {

            setSavingStatus(false);

        }

    };

    return (

        <>

            <Navbar />


            <main className="user-management-page">


                {/* =====================================
                    HEADER
                ===================================== */}

                <section className="user-management-header">

                    <div>

                        <span className="section-label">
                            PLATFORM ADMINISTRATION
                        </span>

                        <h1>
                            User Management
                        </h1>

                        <p>
                            Manage registered users, roles and platform access.
                        </p>

                    </div>


                    <div className="header-icon">
                        👥
                    </div>

                </section>



                {/* =====================================
                    OVERVIEW CARDS
                ===================================== */}

                <section className="user-overview">


                    {/* Total Users */}

                    <div className="user-stat-card">

                        <span>
                            Total Users
                        </span>

                        <strong>
                            {totalUsers}
                        </strong>

                        <small>
                            Registered platform users
                        </small>

                    </div>



                    {/* Manufacturers */}

                    <div className="user-stat-card">

                        <span>
                            Manufacturers
                        </span>

                        <strong>
                            {manufacturerCount}
                        </strong>

                        <small>
                            Manufacturer accounts
                        </small>

                    </div>



                    {/* Sustainability Managers */}

                    <div className="user-stat-card">

                        <span>
                            Sustainability Managers
                        </span>

                        <strong>
                            {sustainabilityManagerCount}
                        </strong>

                        <small>
                            Sustainability accounts
                        </small>

                    </div>



                    {/* Recycling Operators */}

                    <div className="user-stat-card">

                        <span>
                            Recycling Operators
                        </span>

                        <strong>
                            {recyclingOperatorCount}
                        </strong>

                        <small>
                            Recycling facility accounts
                        </small>

                    </div>


                </section>



                {/* =====================================
                    USERS TABLE
                ===================================== */}

                <section className="users-section">


                    {/* Table Header */}

                    <div className="users-section-header">

                        <div>

                            <span className="section-label">
                                REGISTERED USERS
                            </span>

                            <h2>
                                Platform Users
                            </h2>

                            <p>
                                View and manage users registered on the platform.
                            </p>

                        </div>


                        <button className="add-user-btn">
                            + Add User
                        </button>

                    </div>



                    {/* Table */}

                    <div className="users-table-wrapper">

                        <table className="users-table">


                            <thead>

                                <tr>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>



                            <tbody>


                                {/* Loading */}

                                {loading && (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="table-message"
                                        >
                                            Loading users...
                                        </td>

                                    </tr>

                                )}



                                {/* Error */}

                                {!loading && error && (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="table-message error"
                                        >
                                            {error}
                                        </td>

                                    </tr>

                                )}



                                {/* No Users */}

                                {!loading &&
                                    !error &&
                                    users.length === 0 && (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="table-message"
                                            >
                                                No users found.
                                            </td>

                                        </tr>

                                    )}



                                {/* Real Users */}

                                {!loading &&
                                    !error &&
                                    users.length > 0 &&

                                    users.map((user) => (

                                        <tr key={user.id}>


                                            {/* Name */}

                                            <td>
                                                {user.full_name}
                                            </td>


                                            {/* Email */}

                                            <td>
                                                {user.email}
                                            </td>


                                            {/* Role */}

                                            <td>

                                                <span className="role-badge">

                                                    {user.role}

                                                </span>

                                            </td>


                                            {/* Status */}

                                            <td>

                                                <span
                                                    className={
                                                        user.is_active
                                                            ? "status-badge active"
                                                            : "status-badge inactive"
                                                    }
                                                >
                                                    {user.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>

                                            </td>


                                            {/* Action */}

                                            <td>

                                                <button
                                                    className="manage-btn"
                                                    onClick={() => {

                                                        setSelectedUser(user);
                                                        setSelectedRole(user.role);
                                                        setRoleMessage("");

                                                    }}
                                                >
                                                    Manage
                                                </button>

                                            </td>


                                        </tr>

                                    ))

                                }


                            </tbody>


                        </table>

                    </div>


                </section>
                {selectedUser && (
    <div className="user-modal-overlay">

        <div className="user-modal">

            <div className="user-modal-header">

                <div>
                    <span className="section-label">
                        USER MANAGEMENT
                    </span>

                    <h2>
                        Manage User
                    </h2>
                </div>

                <button
                    className="modal-close-btn"
                    onClick={() => setSelectedUser(null)}
                >
                    ×
                </button>

            </div>


            <div className="user-details">

                <div className="user-detail-row">
                    <span>Name</span>
                    <strong>
                        {selectedUser.full_name}
                    </strong>
                </div>


                <div className="user-detail-row">
                    <span>Email</span>
                    <strong>
                        {selectedUser.email}
                    </strong>
                </div>


                <div className="user-detail-row">

                    <span>
                        Role
                    </span>

                    <select
                        value={selectedRole}
                        onChange={(e) =>
                            setSelectedRole(e.target.value)
                        }
                        className="role-select"
                    >

                        <option value="manufacturer">
                            Manufacturer
                        </option>

                        <option value="sustainability_manager">
                            Sustainability Manager
                        </option>

                        <option value="recycling_operator">
                            Recycling Operator
                        </option>

                        <option value="admin">
                            Admin
                        </option>

                    </select>

                </div>


                <div className="user-detail-row">
                    <span>Organization</span>
                    <strong>
                        {selectedUser.organization || "Not specified"}
                    </strong>
                </div>


                <div className="user-detail-row">
                    <span>Authentication</span>
                    <strong>
                        {selectedUser.auth_provider}
                    </strong>
                </div>


                <div className="user-detail-row">

                    <span>Status</span>

                    <strong
                        className={
                            selectedUser.is_active
                                ? "active-text"
                                : "inactive-text"
                        }
                    >
                        {selectedUser.is_active
                            ? "Active"
                            : "Inactive"}
                    </strong>

                </div>
                        </div>

                        
                        <div className="user-modal-actions">

                            {roleMessage && (
                                <span className="role-message">
                                    {roleMessage}
                                </span>
                            )}

                            {statusMessage && (
                                <span className="status-message">
                                    {statusMessage}
                                </span>
                            )}

                            <button
                                className={
                                    selectedUser.is_active
                                        ? "deactivate-btn"
                                        : "activate-btn"
                                }
                                onClick={handleStatusUpdate}
                                disabled={savingStatus}
                            >
                                {savingStatus
                                    ? "Updating..."
                                    : selectedUser.is_active
                                        ? "Deactivate"
                                        : "Activate"}
                            </button>

                            <button
                                className="cancel-btn"
                                onClick={() => setSelectedUser(null)}
                            >
                                Close
                            </button>

                            <button
                                className="save-role-btn"
                                onClick={handleRoleUpdate}
                                disabled={savingRole}
                            >
                                {savingRole
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </div>

                </div>
            )}


            </main>


            <Footer />

        </>

    );

}


export default UserManagement;