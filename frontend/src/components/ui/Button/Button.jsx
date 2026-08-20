import clsx from "clsx";

function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  className = "",
  onClick,
}) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-accent text-white hover:bg-blue-700",
    secondary: "border border-accent text-accent hover:bg-blue-50",
    success: "bg-success text-white hover:bg-green-700",
    danger: "bg-danger text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        (disabled || loading) && "opacity-60",
        className
      )}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

export default Button;