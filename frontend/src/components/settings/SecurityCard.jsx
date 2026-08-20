import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";

function PasswordField({
  label,
  value,
  field,
  visible,
  setVisible,
  placeholder,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <Lock
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(field, e.target.value)}
          className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-12 outline-none transition focus:border-primary"
        />

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function SecurityCard({ data, onChange }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleInput = (field, value) => {
    onChange("security", field, value);
  };

  const calculateStrength = () => {
    const password = data.new_password || "";

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        text: "Weak",
        color: "bg-red-500",
        width: "33%",
      };
    }

    if (score <= 4) {
      return {
        text: "Medium",
        color: "bg-yellow-500",
        width: "66%",
      };
    }

    return {
      text: "Strong",
      color: "bg-green-500",
      width: "100%",
    };
  };

  const strength = calculateStrength();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}

      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
        <div className="rounded-xl bg-red-100 p-3 text-red-600">
          <ShieldCheck size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-heading">
            Security
          </h2>

          <p className="text-sm text-muted">
            Update your password and authentication preferences.
          </p>
        </div>
      </div>

      {/* Body */}

      <div className="space-y-6 p-6">
        <PasswordField
          label="Current Password"
          value={data.current_password}
          field="current_password"
          visible={showCurrent}
          setVisible={setShowCurrent}
          placeholder="Enter current password"
          onChange={handleInput}
        />

        <PasswordField
          label="New Password"
          value={data.new_password}
          field="new_password"
          visible={showNew}
          setVisible={setShowNew}
          placeholder="Enter new password"
          onChange={handleInput}
        />

        <PasswordField
          label="Confirm Password"
          value={data.confirm_password}
          field="confirm_password"
          visible={showConfirm}
          setVisible={setShowConfirm}
          placeholder="Confirm new password"
          onChange={handleInput}
        />

        {/* Password Strength */}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Password Strength
            </span>

            <span className="text-sm font-medium">
              {strength.text}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full ${strength.color} transition-all duration-300`}
              style={{
                width: strength.width,
              }}
            />
          </div>
        </div>

        {/* Two Factor */}

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
          <div className="flex items-center gap-3">
            <KeyRound
              size={20}
              className="text-indigo-600"
            />

            <div>
              <h3 className="font-medium text-heading">
                Two-Factor Authentication
              </h3>

              <p className="text-sm text-muted">
                Add an additional layer of account security.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              handleInput("two_factor", !data.two_factor)
            }
            className={`relative h-7 w-14 rounded-full transition ${
              data.two_factor
                ? "bg-primary"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                data.two_factor
                  ? "left-8"
                  : "left-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SecurityCard;