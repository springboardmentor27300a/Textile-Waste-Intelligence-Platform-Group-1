import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const response = await apiClient.get("/notifications");
      setItems(response.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id) {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to update notification.");
    }
  }

  async function markAllRead() {
    try {
      await apiClient.patch("/notifications/read-all");
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to update notifications.");
    }
  }

  const unread = items.filter((x) => !x.is_read).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="page-eyebrow">PLATFORM</span>
          <h1>Notifications</h1>
          <p>Operational alerts and workflow notifications.</p>
        </div>

        {unread > 0 && (
          <button className="primary-action" onClick={markAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <section className="content-card">
        {loading ? (
          <p>Loading notifications...</p>
        ) : items.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <h2>No notifications</h2>
            <p>You are all caught up.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                padding: 20,
                borderBottom: "1px solid #e5e7eb",
                background: item.is_read ? "#fff" : "#f0fdf4"
              }}
            >
              <strong>{item.title}</strong>

              <p>{item.message}</p>

              <small>
                {item.notification_type}{" "}
                {item.created_at
                  ? new Date(item.created_at).toLocaleString()
                  : ""}
              </small>

              {!item.is_read && (
                <button
                  style={{ marginLeft: 20 }}
                  onClick={() => markRead(item.id)}
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
