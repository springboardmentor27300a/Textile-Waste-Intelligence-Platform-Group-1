import api from "./axios";


// =========================================================
// GET NOTIFICATIONS
// =========================================================

export async function getNotifications({
    category = null,
    unreadOnly = false,
} = {}) {

    const params = {};

    if (
        category &&
        category !== "All"
    ) {
        params.category = category;
    }

    if (unreadOnly) {
        params.unread_only = true;
    }

    const response = await api.get(
        "/notifications/",
        {
            params,
        }
    );

    return Array.isArray(response.data)
        ? response.data
        : [];
}


// =========================================================
// GET STATS
// =========================================================

export async function getNotificationStats() {

    const response = await api.get(
        "/notifications/stats"
    );

    return response.data || {
        total: 0,
        unread: 0,
        today: 0,
        alerts: 0,
    };
}


// =========================================================
// MARK ONE READ
// =========================================================

export async function markNotificationRead(
    notificationId
) {

    const response = await api.patch(
        `/notifications/${notificationId}/read`
    );

    return response.data;
}


// =========================================================
// MARK ALL READ
// =========================================================

export async function markAllNotificationsRead() {

    const response = await api.patch(
        "/notifications/read-all"
    );

    return response.data;
}


// =========================================================
// DELETE
// =========================================================

export async function deleteNotification(
    notificationId
) {

    const response = await api.delete(
        `/notifications/${notificationId}`
    );

    return response.data;
}