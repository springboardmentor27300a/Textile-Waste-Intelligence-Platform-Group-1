import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    getNotifications,
    getNotificationStats,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
} from "../api/notificationsApi";


const POLL_INTERVAL = 5000;


export default function useNotifications() {

    const [notifications, setNotifications] =
        useState([]);

    const [stats, setStats] =
        useState({
            total: 0,
            unread: 0,
            today: 0,
            alerts: 0,
        });

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [category, setCategory] =
        useState("All");

    const [unreadOnly, setUnreadOnly] =
        useState(false);

    const mountedRef =
        useRef(true);


    // =====================================================
    // MOUNT / UNMOUNT
    // =====================================================

    useEffect(() => {

        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };

    }, []);


    // =====================================================
    // LOAD
    // =====================================================

    const load = useCallback(
        async ({ silent = false } = {}) => {

            try {

                if (silent) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const [
                    notificationData,
                    statsData,
                ] = await Promise.all([
                    getNotifications({
                        category,
                        unreadOnly,
                    }),
                    getNotificationStats(),
                ]);


                if (!mountedRef.current) {
                    return;
                }


                setNotifications(
                    Array.isArray(notificationData)
                        ? notificationData
                        : []
                );


                setStats({
                    total: Number(
                        statsData?.total ?? 0
                    ),

                    unread: Number(
                        statsData?.unread ?? 0
                    ),

                    today: Number(
                        statsData?.today ?? 0
                    ),

                    alerts: Number(
                        statsData?.alerts ?? 0
                    ),
                });

            } catch (err) {

                if (!mountedRef.current) {
                    return;
                }

                console.error(
                    "Notification loading failed:",
                    err
                );

                setError(
                    err?.response?.data?.detail ||
                    err?.message ||
                    "Unable to load notifications."
                );

            } finally {

                // IMPORTANT:
                // No return inside finally.
                if (mountedRef.current) {
                    setLoading(false);
                    setRefreshing(false);
                }

            }

        },
        [
            category,
            unreadOnly,
        ]
    );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        load();

    }, [load]);


    // =====================================================
    // AUTO REFRESH EVERY 5 SECONDS
    // =====================================================

    useEffect(() => {

        const intervalId =
            window.setInterval(() => {

                load({
                    silent: true,
                });

            }, POLL_INTERVAL);


        return () => {

            window.clearInterval(
                intervalId
            );

        };

    }, [load]);


    // =====================================================
    // MARK ONE READ
    // =====================================================

    const markRead = async (
        notificationId
    ) => {

        if (!notificationId) {
            return;
        }

        try {

            await markNotificationRead(
                notificationId
            );

            if (!mountedRef.current) {
                return;
            }

            setNotifications(
                previous =>
                    previous.map(item =>
                        item.id === notificationId
                            ? {
                                ...item,
                                is_read: true,
                            }
                            : item
                    )
            );

            setStats(
                previous => ({
                    ...previous,

                    unread: Math.max(
                        0,
                        Number(previous.unread) - 1
                    ),
                })
            );

        } catch (err) {

            console.error(
                "Failed to mark notification read:",
                err
            );

        }
    };


    // =====================================================
    // MARK ALL READ
    // =====================================================

    const markAllRead = async () => {

        try {

            await markAllNotificationsRead();

            if (!mountedRef.current) {
                return;
            }

            setNotifications(
                previous =>
                    previous.map(item => ({
                        ...item,
                        is_read: true,
                    }))
            );

            setStats(
                previous => ({
                    ...previous,
                    unread: 0,
                })
            );

        } catch (err) {

            console.error(
                "Failed to mark all notifications read:",
                err
            );

        }
    };


    // =====================================================
    // DELETE
    // =====================================================

    const remove = async (
        notificationId
    ) => {

        if (!notificationId) {
            return;
        }

        const existing =
            notifications.find(
                item =>
                    item.id === notificationId
            );

        try {

            await deleteNotification(
                notificationId
            );

            if (!mountedRef.current) {
                return;
            }

            setNotifications(
                previous =>
                    previous.filter(
                        item =>
                            item.id !== notificationId
                    )
            );

            setStats(
                previous => ({
                    ...previous,

                    total: Math.max(
                        0,
                        Number(previous.total) - 1
                    ),

                    unread:
                        existing &&
                        !existing.is_read
                            ? Math.max(
                                0,
                                Number(previous.unread) - 1
                            )
                            : previous.unread,
                })
            );

        } catch (err) {

            console.error(
                "Failed to delete notification:",
                err
            );

        }
    };


    // =====================================================
    // RETURN
    // =====================================================

    return {

        notifications,

        stats,

        loading,

        refreshing,

        error,

        category,
        setCategory,

        unreadOnly,
        setUnreadOnly,

        load,

        markRead,

        markAllRead,

        remove,
    };
}