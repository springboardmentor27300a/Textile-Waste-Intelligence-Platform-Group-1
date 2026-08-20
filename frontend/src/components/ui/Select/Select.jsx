function Select({
  label,
  options = [],
  value,
  onChange,
  name,
  required = false,
  disabled = false,
}) {
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

      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="
          w-full
          rounded-xl
          border
          border-gray-300
          bg-white
          px-4
          py-3
          text-body
          outline-none
          transition-all
          duration-300
          focus:border-accent
          focus:ring-4
          focus:ring-blue-100
          disabled:cursor-not-allowed
          disabled:bg-gray-100
        "
      >
        <option value="">
          Select an option
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}

      </select>

    </div>
  );
}

export default Select;