import { useEffect, useRef, useState } from "react";
import {
    getNotifications,
    getUnreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "../services/dashboardService";
import "./NotificationBell.css";

function NotificationBell() {

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showReadHint, setShowReadHint] = useState(
        localStorage.getItem("notificationReadHintShown") !== "true"
    );

    const panelRef = useRef(null);

    // ==========================================
    // Load Notifications
    // ==========================================

    const loadNotifications = async () => {

        try {

            setLoading(true);

            const [
                notificationsResponse,
                unreadResponse
            ] = await Promise.all([
                getNotifications(),
                getUnreadNotifications()
            ]);

            setNotifications(
                notificationsResponse.data || []
            );

            setUnreadCount(
                (unreadResponse.data || []).length
            );

        } catch (error) {

            console.error(
                "Failed to load notifications:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // Initial Load
    // ==========================================

    useEffect(() => {

        loadNotifications();

    }, []);


    // ==========================================
    // Close when clicking outside
    // ==========================================

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                panelRef.current &&
                !panelRef.current.contains(event.target)
            ) {

                setIsOpen(false);

            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);


    // ==========================================
    // Notification Icon
    // ==========================================

    const getNotificationIcon = (type) => {

        switch (type) {

            case "recycling_opportunity":
                return "♻️";

            case "waste_collection":
                return "🗑️";

            case "sustainability_milestone":
                return "🌱";

            case "inventory_warning":
                return "⚠️";

            case "platform_announcement":
                return "📢";

            default:
                return "🔔";
        }
    };


    // ==========================================
    // Mark Single Notification Read
    // ==========================================

    const handleMarkAsRead = async (notification) => {

        // Hide the first-time hint once the user
        // interacts with a notification
        if (showReadHint) {
            setShowReadHint(false);
            localStorage.setItem(
                "notificationReadHintShown",
                "true"
            );
        }

        // Already read → nothing else to do
        if (notification.is_read) {
            return;
        }

        try {

            await markNotificationAsRead(
                notification.id
            );

            setNotifications((previous) =>
                previous.map((item) =>
                    item.id === notification.id
                        ? {
                            ...item,
                            is_read: true
                        }
                        : item
                )
            );

            setUnreadCount((count) =>
                Math.max(0, count - 1)
            );

        } catch (error) {

            console.error(
                "Failed to mark notification as read:",
                error
            );

        }
    };


    // ==========================================
    // Mark All Read
    // ==========================================

    const handleMarkAllAsRead = async () => {

        if (unreadCount === 0) {
            return;
        }

        try {

            await markAllNotificationsAsRead();

            setNotifications((previous) =>
                previous.map((notification) => ({
                    ...notification,
                    is_read: true
                }))
            );

            setUnreadCount(0);

        } catch (error) {

            console.error(
                "Failed to mark notifications as read:",
                error
            );

        }
    };


    return (

        <div
            className="notification-wrapper"
            ref={panelRef}
        >

            {/* ==================================
                Bell
            ================================== */}

            <button
                type="button"
                className="notification-bell"
                onClick={() =>
                    setIsOpen((previous) => !previous)
                }
                aria-label="Notifications"
            >

                <span className="notification-bell-icon">
                    🔔
                </span>

                {unreadCount > 0 && (

                    <span className="notification-badge">
                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                    </span>

                )}

            </button>


            {/* ==================================
                Notification Panel
            ================================== */}

            {isOpen && (

                <div className="notification-panel">

                    <div className="notification-header">

                        <div>

                            <h3>
                                Notifications
                            </h3>

                            <span>
                                {unreadCount > 0
                                    ? `${unreadCount} unread`
                                    : "All caught up"}
                            </span>

                        </div>


                        {unreadCount > 0 && (

                            <button
                                type="button"
                                className="mark-all-button"
                                onClick={
                                    handleMarkAllAsRead
                                }
                            >
                                Mark all as read
                            </button>

                        )}

                    </div>

                    {/* ==================================
                        First-Time Read Hint
                    ================================== */}

                    {showReadHint && unreadCount > 0 && (
                        <div className="notification-read-hint">
                            <span className="notification-read-hint-icon">
                                💡
                            </span>

                            <div>
                                <strong>
                                    Tip
                                </strong>

                                <p>
                                    Click a notification to mark it as read.
                                </p>
                            </div>
                        </div>
                    )}


                    {/* ==================================
                        Notification List
                    ================================== */}

                    <div className="notification-list">

                        {loading ? (

                            <div className="notification-empty">
                                Loading notifications...
                            </div>

                        ) : notifications.length === 0 ? (

                            <div className="notification-empty">

                                <div className="empty-icon">
                                    🔔
                                </div>

                                <strong>
                                    No notifications
                                </strong>

                                <span>
                                    You're all caught up.
                                </span>

                            </div>

                        ) : (

                            notifications.map(
                                (notification) => (

                                    <div
                                        key={notification.id}
                                        className={
                                            `notification-item ${
                                                notification.is_read
                                                    ? "read"
                                                    : "unread"
                                            }`
                                        }
                                        onClick={() =>
                                            handleMarkAsRead(
                                                notification
                                            )
                                        }
                                    >

                                        <div className="notification-type-icon">

                                            {getNotificationIcon(
                                                notification.notification_type
                                            )}

                                        </div>


                                        <div className="notification-content">

                                            <div className="notification-title-row">

                                                <strong>
                                                    {
                                                        notification.title
                                                    }
                                                </strong>

                                                {!notification.is_read && (

                                                    <span className="unread-dot" />

                                                )}

                                            </div>


                                            <p>
                                                {
                                                    notification.message
                                                }
                                            </p>


                                            <div className="notification-meta">

                                                <span
                                                    className={
                                                        `notification-priority ${
                                                            notification.priority
                                                                ?.toLowerCase()
                                                        }`
                                                    }
                                                >
                                                    {
                                                        notification.priority
                                                    }
                                                </span>

                                                <span>
                                                    {
                                                        new Date(
                                                            notification.created_at
                                                        ).toLocaleString()
                                                    }
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>

            )}

        </div>

    );
}

export default NotificationBell;