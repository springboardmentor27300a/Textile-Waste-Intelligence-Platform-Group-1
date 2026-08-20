import {
  Server,
  Database,
  HardDrive,
  BadgeInfo,
  CheckCircle2,
} from "lucide-react";

function StatusBadge({ online }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        online
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      <CheckCircle2 size={14} />
      {online ? "Connected" : "Offline"}
    </span>
  );
}

function InfoCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

      <div className="mb-3 flex items-center gap-3">

        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon size={20} />
        </div>

        <h3 className="font-medium text-heading">
          {title}
        </h3>

      </div>

      <div>{value}</div>

    </div>
  );
}

function SystemInfoCard({ data }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* Header */}

      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">

        <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
          <BadgeInfo size={22} />
        </div>

        <div>

          <h2 className="text-lg font-semibold text-heading">
            System Information
          </h2>

          <p className="text-sm text-muted">
            Current application and infrastructure status.
          </p>

        </div>

      </div>

      {/* Body */}

      <div className="grid gap-6 p-6 md:grid-cols-2">

        <InfoCard
          icon={Server}
          title="Backend API"
          value={
            <StatusBadge online={data.backend_online} />
          }
        />

        <InfoCard
          icon={Database}
          title="Database"
          value={
            <StatusBadge online={data.database_online} />
          }
        />

        <InfoCard
          icon={HardDrive}
          title="Storage Usage"
          value={
            <div>

              <div className="mb-2 flex justify-between text-sm">

                <span>{data.storage}% Used</span>

                <span>
                  {100 - data.storage}% Free
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-200">

                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${data.storage}%`,
                  }}
                />

              </div>

            </div>
          }
        />

        <InfoCard
          icon={BadgeInfo}
          title="Application Version"
          value={
            <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {data.version}
            </span>
          }
        />

      </div>

    </div>
  );
}

export default SystemInfoCard;