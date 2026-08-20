import {
  Users,
  UserCheck,
  ShieldCheck,
  Briefcase,
  TrendingUp,
} from "lucide-react";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  bg,
  color,
  trend,
  loading,
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted">
            {title}
          </p>

          <h3 className="mt-3 text-4xl font-bold text-heading">
            {loading ? "..." : value}
          </h3>

          <p className="mt-2 text-sm text-muted">
            {subtitle}
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            <TrendingUp size={14} />
            {trend}
          </div>
        </div>

        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${bg}`}
        >
          <Icon size={30} className={color} />
        </div>
      </div>
    </div>
  );
}

function UserStats({ stats, loading }) {
  const total = stats?.total_users || 0;
  const active = stats?.active_users || 0;
  const administrators = stats?.administrators || 0;
  const managers = stats?.managers || 0;

  const activePercentage =
    total > 0
      ? `${Math.round((active / total) * 100)}% Active`
      : "0% Active";

  const statCards = [
    {
      title: "Total Users",
      value: total,
      subtitle: "Registered system accounts",
      trend: "Live from database",
      icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Active Users",
      value: active,
      subtitle: "Currently available accounts",
      trend: activePercentage,
      icon: UserCheck,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Administrators",
      value: administrators,
      subtitle: "Users with full system access",
      trend: "System Control",
      icon: ShieldCheck,
      bg: "bg-purple-100",
      color: "text-purple-600",
    },
    {
      title: "Managers",
      value: managers,
      subtitle: "Manager accounts",
      trend: "Operational Roles",
      icon: Briefcase,
      bg: "bg-amber-100",
      color: "text-amber-600",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((stat) => (
        <StatCard
          key={stat.title}
          {...stat}
          loading={loading}
        />
      ))}
    </div>
  );
}

export default UserStats;