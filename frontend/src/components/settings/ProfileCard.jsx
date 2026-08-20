import { User, Mail, Shield } from "lucide-react";

function ProfileCard({ data, onChange }) {
  const handleInput = (field, value) => {
    onChange("profile", field, value);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}

      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
        <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
          <User size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-heading">
            Profile Information
          </h2>

          <p className="text-sm text-muted">
            Manage your personal account information.
          </p>
        </div>
      </div>

      {/* Body */}

      <div className="grid gap-6 p-6 md:grid-cols-2">
        {/* Full Name */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Full Name
          </label>

          <div className="relative">
            <User
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={data.full_name}
              onChange={(e) =>
                handleInput("full_name", e.target.value)
              }
              className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-primary"
            />
          </div>
        </div>

        {/* Email */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email Address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="email"
              value={data.email}
              readOnly
              className="w-full cursor-not-allowed rounded-xl border border-gray-300 bg-gray-100 py-3 pl-10 pr-4 text-gray-500"
            />
          </div>
        </div>

        {/* Role */}

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Role
          </label>

          <div className="flex h-[50px] items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4">
            <Shield
              size={18}
              className="text-indigo-500"
            />

            <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold capitalize text-indigo-700">
              {data.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;