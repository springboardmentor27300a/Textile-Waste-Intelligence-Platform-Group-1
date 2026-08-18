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

// ── Role-Based Access Helpers ─────────────────────────────────────────────────

/**
 * Checks that the current user has one of the allowed roles.
 * Redirects to dashboard.html if the role does not match.
 * Call at the top of any role-specific page.
 */
function requireRole(allowedRoles) {
  if (!requireAuth()) return false;
  const user = getUser();
  if (!user) { window.location.href = 'index.html'; return false; }
  if (!allowedRoles.includes(user.role)) {
    window.location.href = 'dashboard.html';
    return false;
  }
  return true;
}

/** Maps a JWT role value to its dedicated dashboard URL. */
function getRoleDashboard(role) {
  const map = {
    admin:    'admin.html',
    analyst:  'sustainability-manager.html',
    supplier: 'manufacturer.html',
    auditor:  'recycling-facility.html',
  };
  return map[role] || 'dashboard.html';
}

/** Returns [icon, label] for the role-specific dashboard nav link. */
function getRoleNavLabel(role) {
  const labels = {
    admin:    ['🔐', 'Admin Dashboard'],
    analyst:  ['🌱', 'Sustainability Mgr'],
    supplier: ['🏭', 'Manufacturer Panel'],
    auditor:  ['♻️',  'Recycling Facility'],
  };
  return labels[role] || ['🎯', 'My Dashboard'];
}

/**
 * Dynamically injects a "My Dashboard" nav link into the sidebar.
 * Skips if the link already exists (i.e., manually placed on role pages).
 * Safe to call on every page — only acts when a sidebar is present.
 */
function injectRoleDashboardNav() {
  if (document.getElementById('role-dashboard-nav')) return;
  const user = getUser();
  if (!user || !user.role) return;
  const nav = document.querySelector('.sidebar-nav');
  if (!nav) return;
  const url   = getRoleDashboard(user.role);
  const [icon, label] = getRoleNavLabel(user.role);
  const current = window.location.pathname.split('/').pop() || '';
  const link = document.createElement('a');
  link.id        = 'role-dashboard-nav';
  link.href      = url;
  link.className = 'nav-item' + (current === url ? ' active' : '');
  link.innerHTML = `<span class="nav-icon">${icon}</span> ${label}`;
  link.style.cssText = 'background:rgba(52,211,153,0.07);border:1px solid rgba(52,211,153,0.18);margin:4px 0 8px;';
  const title = nav.querySelector('.nav-section-title');
  if (title) title.insertAdjacentElement('afterend', link);
  else nav.prepend(link);
}

// Attach logout button
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  initSidebarUser();
  injectRoleDashboardNav();
});

window.saveAuth = saveAuth;
window.getUser = getUser;
window.logout = logout;
window.requireAuth = requireAuth;
window.showToast = showToast;
window.initSidebarUser = initSidebarUser;
window.requireRole = requireRole;
window.getRoleDashboard = getRoleDashboard;
window.injectRoleDashboardNav = injectRoleDashboardNav;
// --- Notification Bell UI ---
function initNotificationBell() {
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (!sidebarNav || !getUser()) return;

  // Insert Bell
  const bellHtml = `
    <div class="nav-section-title" style="margin-top:0.75rem;">Alerts</div>
    <div class="nav-item" id="notif-bell-btn" style="position:relative; cursor:pointer;" onclick="toggleNotifications()">
      <span class="nav-icon">&#x1F514;</span> Notifications
      <span id="unread-badge" style="display:none; position:absolute; right:15px; background:var(--color-primary); color:white; border-radius:10px; padding:2px 6px; font-size:10px; font-weight:bold;">0</span>
    </div>
    <div id="notif-dropdown" style="display:none; flex-direction:column; background: rgba(0,0,0,0.2); border-radius:8px; margin: 0 10px; margin-bottom: 10px; max-height:300px; overflow-y:auto; overflow-x:hidden;">
      <div style="display:flex; justify-content:space-between; padding: 10px; padding-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <span style="font-size:11px; font-weight:bold; color:var(--color-text-muted); text-transform:uppercase;">Recent Alerts</span>
        <span style="font-size:11px; color:var(--color-primary); cursor:pointer;" onclick="fetchNotifications(event)">Refresh</span>
      </div>
      <div id="notif-list" style="display:flex; flex-direction:column;"></div>
    </div>
  `;
  
  const accountSection = Array.from(sidebarNav.querySelectorAll('.nav-section-title')).find(el => el.textContent.includes('Account'));
  if (accountSection) {
    accountSection.insertAdjacentHTML('beforebegin', bellHtml);
  } else {
    sidebarNav.insertAdjacentHTML('beforeend', bellHtml);
  }
  
  fetchUnreadCount();
}

window.toggleNotifications = function() {
  const dropdown = document.getElementById('notif-dropdown');
  if (dropdown.style.display === 'none') {
    dropdown.style.display = 'flex';
    fetchNotifications();
  } else {
    dropdown.style.display = 'none';
  }
}

window.fetchUnreadCount = async function() {
  try {
    const res = await apiFetch('/api/notifications/unread-count');
    const badge = document.getElementById('unread-badge');
    if (res.unread_count > 0) {
      badge.textContent = res.unread_count;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  } catch (err) {
    console.error("Failed to fetch unread count", err);
  }
}

window.fetchNotifications = async function(event) {
  let target = null;
  if (event && event.target) {
    target = event.target;
    target.innerText = 'Refreshing...';
    target.style.opacity = '0.5';
  }
  
  const list = document.getElementById('notif-list');
  list.innerHTML = '<div style="padding:10px; font-size:12px; color:var(--color-text-muted); text-align:center;">Loading...</div>';
  try {
    const res = await apiFetch('/api/notifications?limit=10&_t=' + Date.now());
    list.innerHTML = '';
    
    if (res.length === 0) {
      list.innerHTML = '<div style="padding:10px; font-size:12px; color:var(--color-text-muted); text-align:center;">No notifications</div>';
      return;
    }
    
    res.forEach(notif => {
      const isReadStyle = notif.is_read ? 'opacity: 0.6;' : 'font-weight: bold; background: rgba(255,255,255,0.05);';
      const icon = notif.type === 'alert' ? '&#x1F6A8;' : (notif.type === 'success' ? '&#x2705;' : (notif.type === 'warning' ? '&#x26A0;&#xFE0F;' : '&#x2139;&#xFE0F;'));
      const time = new Date(notif.created_at).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});
      
      const item = document.createElement('div');
      item.style.cssText = `padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size:12px; ${isReadStyle}`;
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:4px;">
          <div style="display:flex; gap:6px; align-items:center;">
            <span>${icon}</span>
            <span>${notif.title}</span>
          </div>
        </div>
        <div style="color:var(--color-text-muted); margin-left: 20px; line-height: 1.4;">${notif.message}</div>
        <div style="display:flex; justify-content:space-between; margin-left: 20px; margin-top: 6px;">
          <span style="font-size:10px; color:var(--color-text-muted);">${time}</span>
          ${!notif.is_read ? `<span style="font-size:10px; color:var(--color-primary); cursor:pointer;" onclick="markNotifRead(${notif.id}, this.parentElement.parentElement)">Mark read</span>` : ''}
        </div>
      `;
      list.appendChild(item);
    });
    fetchUnreadCount();
  } catch (err) {
    console.error("Failed to fetch notifications", err);
    list.innerHTML = '<div style="padding:10px; font-size:12px; color:var(--color-danger); text-align:center;">Failed to load</div>';
  } finally {
    if (target) {
      target.innerText = 'Refresh';
      target.style.opacity = '1';
    }
  }
}

window.markNotifRead = async function(id, element) {
  try {
    await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    element.style.opacity = '0.6';
    element.style.fontWeight = 'normal';
    element.style.background = 'none';
    const markBtn = element.querySelector('span[onclick^="markNotifRead"]');
    if (markBtn) markBtn.remove();
    fetchUnreadCount();
  } catch (err) {
    console.error("Failed to mark read", err);
  }
}

// Attach notification bell on load
document.addEventListener("DOMContentLoaded", () => {
  initNotificationBell();
});
