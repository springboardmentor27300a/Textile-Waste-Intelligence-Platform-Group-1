/**
 * auth.js — Handles login, logout, token storage, and UI auth state
 */

function saveAuth(token, user) {
  localStorage.setItem("twi_token", token);
  localStorage.setItem("twi_user", JSON.stringify(user));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("twi_user"));
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem("twi_token");
  localStorage.removeItem("twi_user");
  window.location.href = "index.html";
}

function requireAuth() {
  const token = localStorage.getItem("twi_token");
  if (!token) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

function initSidebarUser() {
  const user = getUser();
  if (!user) return;
  const nameEl   = document.getElementById("sidebar-user-name");
  const roleEl   = document.getElementById("sidebar-user-role");
  const avatarEl = document.getElementById("sidebar-avatar");
  if (nameEl) nameEl.textContent = user.full_name || user.email;
  if (roleEl) roleEl.textContent = '';
  if (avatarEl) avatarEl.textContent = (user.full_name || user.email)[0].toUpperCase();
}

function showToast(message, type = "success") {
  let toast = document.getElementById("global-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "global-toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  const icon = type === "success" ? "✅" : "❌";
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => toast.classList.remove("show"), 3500);
}

// Attach logout button
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  initSidebarUser();
});

window.saveAuth = saveAuth;
window.getUser = getUser;
window.logout = logout;
window.requireAuth = requireAuth;
window.showToast = showToast;
window.initSidebarUser = initSidebarUser;
