import {
  AlertCircle,
  Bell,
  Clock3,
  MailOpen,
} from "lucide-react";


function Card({
  title,
  value,
  icon: Icon,
  color,
}) {

  return (

    <div className="rounded-2xl bg-white p-6 shadow-card">

      <div className="flex items-center gap-4">

        <div
          className={`rounded-xl p-3 ${color}`}
        >

          <Icon size={24} />

        </div>

        <div>

          <p className="text-sm text-muted">
            {title}
          </p>

          <h3 className="mt-1 text-2xl font-bold text-heading">
            {value}
          </h3>

        </div>

      </div>

    </div>

  );

}


function NotificationOverview({
  stats,
}) {

  const safeStats = stats || {};

  const items = [

    {
      title: "Total",
      value: safeStats.total ?? 0,
      icon: Bell,
      color: "bg-blue-100 text-blue-600",
    },

    {
      title: "Unread",
      value: safeStats.unread ?? 0,
      icon: MailOpen,
      color: "bg-red-100 text-red-600",
    },

    {
      title: "Today",
      value: safeStats.today ?? 0,
      icon: Clock3,
      color: "bg-green-100 text-green-600",
    },

    {
      title: "Alerts",
      value: safeStats.alerts ?? 0,
      icon: AlertCircle,
      color: "bg-yellow-100 text-yellow-600",
    },

  ];


  return (

    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {items.map(item => (

        <Card
          key={item.title}
          {...item}
        />

      ))}

    </div>

  );

}


export default NotificationOverview;