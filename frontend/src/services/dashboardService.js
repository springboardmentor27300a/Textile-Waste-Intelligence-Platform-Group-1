import API from "./api";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`
    };
};

// ============================
// Inventory Dashboard
// ============================
export const getDashboardStats = () => {
    return API.get("/dashboard/stats", {
        headers: getAuthHeaders()
    });
};

// ============================
// AI Dashboard Summary
// ============================
export const getAISummary = () => {
    return API.get("/dashboard/summary", {
        headers: getAuthHeaders()
    });
};

// ============================
// Analysis History
// ============================
export const getAnalysisHistory = () => {
    return API.get("/dashboard/history", {
        headers: getAuthHeaders()
    });
};

// ============================
// Material Distribution
// ============================
export const getMaterialDistribution = () => {
    return API.get("/dashboard/materials", {
        headers: getAuthHeaders()
    });
};

// ============================
// Damage Distribution
// ============================
export const getDamageDistribution = () => {
    return API.get("/dashboard/damage", {
        headers: getAuthHeaders()
    });
};

// ============================
// Quality Distribution
// ============================
export const getQualityDistribution = () => {
    return API.get("/dashboard/quality", {
        headers: getAuthHeaders()
    });
};

// ============================
// Recommendation Distribution
// ============================
export const getRecommendationDistribution = () => {
    return API.get("/dashboard/recommendations", {
        headers: getAuthHeaders()
    });
};

export const getSustainabilitySummary = () => {
    return API.get("/dashboard/sustainability-summary", {
        headers: getAuthHeaders()
    });
};

// ============================
// Admin - User Management
// ============================
export const getAdminUsers = () => {
    return API.get("/admin/users", {
        headers: getAuthHeaders()
    });
};

// ============================
// Admin - Update User Role
// ============================

export const updateUserRole = (userId, role) => {

    return API.put(
        `/admin/users/${userId}/role`,
        {
            role: role
        },
        {
            headers: getAuthHeaders()
        }
    );

};

// ============================
// Admin - Update User Status
// ============================

export const updateUserStatus = (userId, isActive) => {

    return API.put(
        `/admin/users/${userId}/status`,
        {
            is_active: isActive
        },
        {
            headers: getAuthHeaders()
        }
    );

};
// ============================
// Admin - Platform Analytics
// ============================

export const getPlatformAnalytics = () => {

    return API.get("/admin/analytics", {
        headers: getAuthHeaders()
    });

};

// ============================
// Admin - System Monitoring
// ============================

export const getSystemMonitoring = () => {
    return API.get("/admin/system-monitoring", {
        headers: getAuthHeaders()
    });
};

// ============================
// Admin - Report Management
// ============================

export const getAdminReportData = () => {
    return API.get("/admin/reports", {
        headers: getAuthHeaders()
    });
};

export const getInventorySustainabilitySummary = async () => {

    const token = localStorage.getItem("token");

    return API.get(
        "/inventory-analysis/summary",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};


// ============================
// Notifications
// ============================

export const getNotifications = () => {
    return API.get("/notifications/", {
        headers: getAuthHeaders()
    });
};

// ============================
// Unread Notifications
// ============================

export const getUnreadNotifications = () => {
    return API.get("/notifications/unread", {
        headers: getAuthHeaders()
    });
};

// ============================
// Mark Notification as Read
// ============================

export const markNotificationAsRead = (notificationId) => {
    return API.put(
        `/notifications/${notificationId}/read`,
        {},
        {
            headers: getAuthHeaders()
        }
    );
};

// ============================
// Mark All Notifications as Read
// ============================

export const markAllNotificationsAsRead = () => {
    return API.put(
        "/notifications/read-all",
        {},
        {
            headers: getAuthHeaders()
        }
    );
};

// ==========================================
// Admin - Create Platform Announcement
// ==========================================

export const createPlatformAnnouncement = (
    title,
    message,
    priority = "medium"
) => {

    return API.post(
        "/notifications/announcement",
        null,
        {
            headers: getAuthHeaders(),

            params: {
                title: title,
                message: message,
                priority: priority
            }
        }
    );
};