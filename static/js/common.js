// Shared utilities used across all pages.

const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("twip_token");
}

function getUser() {
  const raw = localStorage.getItem("twip_user");
  return raw ? JSON.parse(raw) : null;
}

function setSession(token, user) {
  localStorage.setItem("twip_token", token);
  localStorage.setItem("twip_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("twip_token");
  localStorage.removeItem("twip_user");
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "/";
    return false;
  }
  return true;
}

function logout() {
  clearSession();
  window.location.href = "/";
}

async function apiFetch(path, options = {}) {
  const headers = Object.assign(
    { "Content-Type": "application/json" },
    options.headers || {}
  );
  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(API_BASE + path, { ...options, headers });

  if (res.status === 401) {
    clearSession();
    window.location.href = "/";
    throw new Error("Session expired");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Request failed (" + res.status + ")");
  }
  return data;
}

function showToast(message, isError = false) {
  let toast = document.getElementById("global-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "global-toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = "toast show" + (isError ? " error" : "");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.className = "toast";
  }, 3200);
}

function initials(name) {
  if (!name) return "?";
  return name.slice(0, 2).toUpperCase();
}

function renderUserBadge(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  const user = getUser();
  if (!user) return;
  el.innerHTML = `
    <div class="avatar">${initials(user.username)}</div>
    <div>
      <div style="font-weight:600;">${user.username}</div>
    </div>
    <span class="role-pill">${user.role}</span>
  `;
}

function markActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.getAttribute("data-path") === path) {
      link.classList.add("active");
    }
  });
}

function applyRoleVisibility() {
  const user = getUser();
  if (!user) return;
  document.querySelectorAll("[data-roles]").forEach((el) => {
    const allowed = el.getAttribute("data-roles").split(",").map((r) => r.trim());
    if (!allowed.includes(user.role)) {
      el.style.display = "none";
    }
  });
}

// ---------- Milestone 4: Notification & Alert bell ----------

const SEVERITY_ICON = { danger: "🔴", warning: "🟠", success: "🟢", info: "🔵" };

function renderNotificationPanel(notifications) {
  const panel = document.getElementById("notif-panel");
  if (!panel) return;
  if (!notifications.length) {
    panel.innerHTML = '<div class="empty-state">No alerts right now</div>';
    return;
  }
  panel.innerHTML = notifications.map(n => `
    <div class="notif-item ${n.severity}">
      <div class="title">${SEVERITY_ICON[n.severity] || ""} ${n.title}</div>
      <div class="message">${n.message}</div>
    </div>
  `).join("");
}

async function injectNotificationBell() {
  if (!getToken()) return;
  const topbarControls = document.querySelector(".topbar > div:last-child");
  if (!topbarControls || document.getElementById("notif-bell")) return;

  const wrap = document.createElement("div");
  wrap.className = "notif-bell-wrap";
  wrap.innerHTML = `
    <div class="notif-bell" id="notif-bell">
      🔔<span class="notif-count" id="notif-count" style="display:none;">0</span>
    </div>
    <div class="notif-panel" id="notif-panel"></div>
  `;
  topbarControls.insertBefore(wrap, topbarControls.firstChild);

  document.getElementById("notif-bell").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("notif-panel").classList.toggle("show");
  });
  document.addEventListener("click", () => {
    const panel = document.getElementById("notif-panel");
    if (panel) panel.classList.remove("show");
  });

  try {
    const data = await apiFetch("/notifications/");
    const countEl = document.getElementById("notif-count");
    if (data.count > 0) {
      countEl.textContent = data.count;
      countEl.style.display = "flex";
    }
    renderNotificationPanel(data.notifications);
  } catch (err) {
    // Notifications are a non-critical enhancement; fail silently.
  }
}

document.addEventListener("DOMContentLoaded", () => {
  markActiveNav();
  applyRoleVisibility();
  injectNotificationBell();
});
