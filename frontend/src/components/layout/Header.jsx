import {
  Bell,
  Search,
  CalendarDays,
  ChevronDown,
} from "lucide-react";

import { useState } from "react";

import useNotifications from "../../hooks/useNotifications";

function Header() {
  // =========================================================
  // NOTIFICATION STATE
  // =========================================================

  const {
    stats,
    notifications,
    markRead,
  } = useNotifications();

  const [showNotifications, setShowNotifications] =
    useState(false);

  // =========================================================
  // DATE
  // =========================================================

  const today = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }
  );

  // =========================================================
  // DYNAMIC GREETING - INDIAN STANDARD TIME
  // =========================================================

  const indianHour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date())
  );

  const greeting =
    indianHour < 12
      ? "Good Morning"
      : indianHour < 17
        ? "Good Afternoon"
        : "Good Evening";

  // =========================================================
  // USER
  // =========================================================

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const firstName =
    user.full_name?.split(" ")[0] ||
    "User";

  const initials = user.full_name
    ? user.full_name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  const role = user.role
    ? user.role.charAt(0).toUpperCase() +
      user.role.slice(1)
    : "User";

  // =========================================================
  // UNREAD COUNT
  // =========================================================

  const unreadCount =
    Number(stats?.unread || 0);

  // =========================================================
  // RECENT NOTIFICATIONS
  // =========================================================

  const recentNotifications =
    Array.isArray(notifications)
      ? notifications.slice(0, 5)
      : [];

  // =========================================================
  // NOTIFICATION CLICK
  // =========================================================

  const handleNotificationClick =
    async (notification) => {
      if (
        notification &&
        !notification.is_read
      ) {
        await markRead(notification.id);
      }
    };

  return (
    <header
      className="
        relative
        flex
        h-20
        items-center
        justify-between
        border-b
        border-gray-200
        bg-white
        px-8
      "
    >
      {/* ===================================================
          LEFT
      =================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-heading">
          {greeting}, {firstName} 👋
        </h1>

        <div
          className="
            mt-1
            flex
            items-center
            gap-2
            text-sm
            text-muted
          "
        >
          <CalendarDays size={16} />

          {today}
        </div>
      </div>

      {/* ===================================================
          RIGHT
      =================================================== */}

      <div className="flex items-center gap-6">

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="relative hidden lg:block">

          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-muted
            "
          />

          <input
            placeholder="Search..."
            className="
              w-80
              rounded-xl
              border
              border-gray-300
              bg-background
              py-3
              pl-11
              pr-4
              outline-none
              transition
              focus:border-accent
              focus:ring-4
              focus:ring-blue-100
            "
          />

        </div>

        {/* =================================================
            NOTIFICATION
        ================================================= */}

        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setShowNotifications(
                (previous) => !previous
              )
            }
            className="
              relative
              rounded-xl
              border
              border-gray-200
              p-3
              transition
              hover:bg-gray-50
            "
            aria-label="Notifications"
          >

            <Bell size={20} />

            {/* =============================================
                REAL UNREAD BADGE
            ============================================= */}

            {unreadCount > 0 && (

              <span
                className="
                  absolute
                  -right-2
                  -top-2
                  flex
                  min-h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500
                  px-1
                  text-[10px]
                  font-bold
                  leading-none
                  text-white
                  ring-2
                  ring-white
                "
              >
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>

            )}

          </button>

          {/* =================================================
              NOTIFICATION DROPDOWN
          ================================================= */}

          {showNotifications && (

            <div
              className="
                absolute
                right-0
                top-14
                z-50
                w-[380px]
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-white
                shadow-xl
              "
            >

              {/* HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-gray-100
                  px-5
                  py-4
                "
              >

                <div>

                  <h3
                    className="
                      text-base
                      font-bold
                      text-heading
                    "
                  >
                    Notifications
                  </h3>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-muted
                    "
                  >
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "You're all caught up"}
                  </p>

                </div>

                {unreadCount > 0 && (

                  <span
                    className="
                      rounded-full
                      bg-red-50
                      px-2.5
                      py-1
                      text-xs
                      font-semibold
                      text-red-600
                    "
                  >
                    {unreadCount} new
                  </span>

                )}

              </div>

              {/* BODY */}

              <div className="max-h-[420px] overflow-y-auto">

                {recentNotifications.length === 0 ? (

                  <div
                    className="
                      px-6
                      py-12
                      text-center
                    "
                  >

                    <Bell
                      size={28}
                      className="
                        mx-auto
                        mb-3
                        text-gray-300
                      "
                    />

                    <p
                      className="
                        text-sm
                        font-medium
                        text-gray-600
                      "
                    >
                      No notifications
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-gray-400
                      "
                    >
                      New activity will appear here.
                    </p>

                  </div>

                ) : (

                  recentNotifications.map(
                    (notification) => (

                      <button
                        key={notification.id}
                        type="button"
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                        className={`
                          w-full
                          border-b
                          border-gray-100
                          px-5
                          py-4
                          text-left
                          transition
                          hover:bg-gray-50
                          ${
                            !notification.is_read
                              ? "bg-blue-50/40"
                              : "bg-white"
                          }
                        `}
                      >

                        <div
                          className="
                            flex
                            items-start
                            gap-3
                          "
                        >

                          {/* STATUS DOT */}

                          <span
                            className={`
                              mt-1.5
                              h-2
                              w-2
                              flex-shrink-0
                              rounded-full
                              ${
                                !notification.is_read
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                              }
                            `}
                          />

                          {/* CONTENT */}

                          <div className="min-w-0 flex-1">

                            <p
                              className="
                                text-sm
                                font-semibold
                                text-heading
                              "
                            >
                              {notification.title}
                            </p>

                            <p
                              className="
                                mt-1
                                line-clamp-2
                                text-xs
                                leading-5
                                text-gray-600
                              "
                            >
                              {notification.message}
                            </p>

                            <div
                              className="
                                mt-2
                                flex
                                items-center
                                gap-2
                              "
                            >

                              {notification.category && (

                                <span
                                  className="
                                    rounded-md
                                    bg-gray-100
                                    px-2
                                    py-0.5
                                    text-[10px]
                                    font-medium
                                    text-gray-600
                                  "
                                >
                                  {notification.category}
                                </span>

                              )}

                              {notification.created_at && (

                                <span
                                  className="
                                    text-[10px]
                                    text-gray-400
                                  "
                                >
                                  {new Date(
                                    notification.created_at
                                  ).toLocaleString()}
                                </span>

                              )}

                            </div>

                          </div>

                        </div>

                      </button>

                    )
                  )

                )}

              </div>

              {/* FOOTER */}

              <div
                className="
                  border-t
                  border-gray-100
                  bg-gray-50
                  px-5
                  py-3
                "
              >

                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);

                    window.location.href =
                      "/notifications";
                  }}
                  className="
                    w-full
                    text-center
                    text-sm
                    font-semibold
                    text-accent
                    transition
                    hover:underline
                  "
                >
                  View all notifications
                </button>

              </div>

            </div>

          )}

        </div>

        {/* =================================================
            PROFILE
        ================================================= */}

        <button
          type="button"
          className="
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-gray-200
            px-3
            py-2
            transition
            hover:bg-gray-50
          "
        >

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-primary
              font-semibold
              text-white
            "
          >
            {initials}
          </div>

          <div className="text-left">

            <p
              className="
                text-sm
                font-semibold
                text-heading
              "
            >
              {user.full_name || "Guest"}
            </p>

            <p
              className="
                text-xs
                text-muted
                capitalize
              "
            >
              {role}
            </p>

          </div>

          <ChevronDown
            size={18}
            className="text-muted"
          />

        </button>

      </div>

    </header>
  );
}

export default Header;