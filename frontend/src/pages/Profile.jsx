import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="page-eyebrow">ACCOUNT</span>
          <h1>Profile</h1>
          <p>View your platform account information.</p>
        </div>
      </div>

      <section className="content-card">
        <div className="metric-grid">
          <div className="metric-card">
            <span>Name</span>
            <strong>{user?.full_name || "-"}</strong>
          </div>

          <div className="metric-card">
            <span>Email</span>
            <strong>{user?.email || "-"}</strong>
          </div>

          <div className="metric-card">
            <span>Role</span>
            <strong>{user?.role || "-"}</strong>
          </div>

          <div className="metric-card">
            <span>Account</span>
            <strong>
              {user?.is_active ? "Active" : "Inactive"}
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}
