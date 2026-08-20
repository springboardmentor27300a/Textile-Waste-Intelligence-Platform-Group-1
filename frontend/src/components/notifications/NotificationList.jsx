import {
  Brain,
  ClipboardList,
  FileText,
  Leaf,
  Package,
  Recycle,
  Settings,
  Truck,
  Trash2,
  Check,
} from "lucide-react";


const ICONS = {

  Inventory: Package,

  Collections: Truck,

  Recycling: Recycle,

  AI: Brain,

  Sustainability: Leaf,

  Reports: FileText,

  System: Settings,

};


function formatDate(value) {

  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

}


function NotificationList({
  notifications,
  loading,
  error,
  onMarkRead,
  onDelete,
  onMarkAllRead,
}) {

  if (loading) {

    return (

      <div className="rounded-2xl bg-white p-8 shadow-card">

        <div className="animate-pulse space-y-5">

          {[1, 2, 3].map(item => (

            <div
              key={item}
              className="h-20 rounded-xl bg-gray-100"
            />

          ))}

        </div>

      </div>

    );

  }


  if (error) {

    return (

      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">

        {error}

      </div>

    );

  }


  return (

    <div className="rounded-2xl bg-white p-6 shadow-card">

      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-2xl font-bold text-heading">
          Notifications
        </h2>


        {notifications.length > 0 && (

          <button
            type="button"
            onClick={onMarkAllRead}
            className="rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-blue-50"
          >

            Mark all as read

          </button>

        )}

      </div>


      {notifications.length === 0 ? (

        <div className="flex flex-col items-center justify-center py-16 text-center">

          <div className="mb-4 rounded-full bg-gray-100 p-4">

            <ClipboardList
              size={28}
              className="text-gray-400"
            />

          </div>

          <h3 className="font-semibold text-heading">
            No notifications
          </h3>

          <p className="mt-1 text-sm text-muted">
            You're all caught up.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {notifications.map(item => {

            const Icon =
              ICONS[item.category] ||
              Settings;

            return (

              <div
                key={item.id}
                className={`flex items-start gap-4 rounded-xl border p-4 transition ${
                  item.is_read
                    ? "bg-white"
                    : "border-blue-200 bg-blue-50/40"
                }`}
              >

                <div className="rounded-lg bg-blue-100 p-3 text-blue-600">

                  <Icon size={22} />

                </div>


                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-start justify-between gap-2">

                    <div className="flex items-center gap-2">

                      <h3 className="font-semibold text-heading">
                        {item.title}
                      </h3>

                      {!item.is_read && (

                        <span className="h-2 w-2 rounded-full bg-blue-600" />

                      )}

                    </div>


                    <span className="text-xs text-muted">
                      {formatDate(item.created_at)}
                    </span>

                  </div>


                  <p className="mt-1 text-sm leading-6 text-muted">
                    {item.message}
                  </p>


                  <div className="mt-3 flex gap-2">

                    {!item.is_read && (

                      <button
                        type="button"
                        onClick={() =>
                          onMarkRead(item.id)
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                      >

                        <Check size={14} />

                        Mark read

                      </button>

                    )}


                    <button
                      type="button"
                      onClick={() =>
                        onDelete(item.id)
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                    >

                      <Trash2 size={14} />

                      Delete

                    </button>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      )}

    </div>

  );

}


export default NotificationList;