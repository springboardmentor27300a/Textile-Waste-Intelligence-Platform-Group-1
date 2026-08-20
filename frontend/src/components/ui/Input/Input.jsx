import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  required = false,
  disabled = false,
  error = "",
  icon: Icon,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <div className="w-full">

      {label && (
        <label className="mb-2 block text-sm font-semibold text-heading">
          {label}

          {required && (
            <span className="ml-1 text-danger">*</span>
          )}
        </label>
      )}

      <div className="relative">

        {Icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            <Icon size={18} />
          </div>
        )}

        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full
            rounded-xl
            border
            bg-white
            py-3
            ${Icon ? "pl-12" : "pl-4"}
            ${type === "password" ? "pr-12" : "pr-4"}
            text-body
            placeholder:text-muted
            outline-none
            transition-all
            duration-300

            ${
              error
                ? "border-danger focus:border-danger focus:ring-4 focus:ring-red-100"
                : "border-gray-300 focus:border-accent focus:ring-4 focus:ring-blue-100"
            }

            ${
              disabled
                ? "cursor-not-allowed bg-gray-100 opacity-70"
                : ""
            }
          `}
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-heading"
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        )}

      </div>

      {error && (
        <p className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}

    </div>
  );
}

export default Input;