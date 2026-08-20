import {
  MonitorSmartphone,
  Globe,
  CalendarDays,
  Clock3,
} from "lucide-react";

function PreferenceCard({ data, onChange }) {
  const handleInput = (field, value) => {
    onChange("preferences", field, value);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* Header */}

      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">

        <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
          <MonitorSmartphone size={22} />
        </div>

        <div>

          <h2 className="text-lg font-semibold text-heading">
            Application Preferences
          </h2>

          <p className="text-sm text-muted">
            Customize your application experience.
          </p>

        </div>

      </div>

      {/* Body */}

      <div className="grid gap-6 p-6 md:grid-cols-2">

        {/* Theme */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Theme
          </label>

          <select
            value={data.theme}
            onChange={(e) =>
              handleInput("theme", e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </select>

        </div>

        {/* Language */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Language
          </label>

          <div className="relative">

            <Globe
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={data.language}
              onChange={(e) =>
                handleInput("language", e.target.value)
              }
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 focus:border-primary focus:outline-none"
            >
              <option value="English">English</option>
              <option value="Tamil">Tamil</option>
              <option value="Sinhala">Sinhala</option>
            </select>

          </div>

        </div>

        {/* Date Format */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Date Format
          </label>

          <div className="relative">

            <CalendarDays
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={data.date_format}
              onChange={(e) =>
                handleInput("date_format", e.target.value)
              }
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 focus:border-primary focus:outline-none"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>

          </div>

        </div>

        {/* Time Zone */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Time Zone
          </label>

          <div className="relative">

            <Clock3
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={data.timezone}
              onChange={(e) =>
                handleInput("timezone", e.target.value)
              }
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 focus:border-primary focus:outline-none"
            >
              <option value="Asia/Colombo">
                Asia/Colombo
              </option>

              <option value="Asia/Kolkata">
                Asia/Kolkata
              </option>

              <option value="UTC">
                UTC
              </option>

            </select>

          </div>

        </div>

        {/* Session Timeout */}

        <div className="md:col-span-2">

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Session Timeout
          </label>

          <select
            value={data.session_timeout}
            onChange={(e) =>
              handleInput(
                "session_timeout",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none"
          >
            <option value="15">
              15 Minutes
            </option>

            <option value="30">
              30 Minutes
            </option>

            <option value="60">
              1 Hour
            </option>

            <option value="120">
              2 Hours
            </option>

          </select>

        </div>

      </div>

    </div>
  );
}

export default PreferenceCard;