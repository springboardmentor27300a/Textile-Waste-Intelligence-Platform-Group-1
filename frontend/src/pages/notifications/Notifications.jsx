import NotificationOverview
  from "../../components/notifications/NotificationOverview";

import NotificationFilter
  from "../../components/notifications/NotificationFilter";

import NotificationList
  from "../../components/notifications/NotificationList";

import NotificationSettings
  from "../../components/notifications/NotificationSettings";

import useNotifications
  from "../../hooks/useNotifications";


function Notifications() {

  const {

    notifications,

    stats,

    loading,

    error,

    category,
    setCategory,

    unreadOnly,
    setUnreadOnly,

    markRead,

    markAllRead,

    remove,

  } = useNotifications();


  return (

    <div className="space-y-8">

      <div>

        <h1 className="text-3xl font-bold text-heading">
          Notifications
        </h1>

        <p className="mt-2 text-muted">
          Stay informed about inventory, collections,
          recycling, AI analysis, sustainability,
          reports and important system activity.
        </p>

      </div>


      <NotificationOverview
        stats={stats}
      />


      <NotificationFilter

        category={category}

        setCategory={setCategory}

        unreadOnly={unreadOnly}

        setUnreadOnly={setUnreadOnly}

      />


      <div className="grid gap-8 xl:grid-cols-3">

        <div className="xl:col-span-2">

          <NotificationList

            notifications={notifications}

            loading={loading}

            error={error}

            onMarkRead={markRead}

            onDelete={remove}

            onMarkAllRead={markAllRead}

          />

        </div>


        <div>

          <NotificationSettings />

        </div>

      </div>

    </div>

  );

}


export default Notifications;