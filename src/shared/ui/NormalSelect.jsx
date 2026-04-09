import React from "react";

const NormalSelect = React.forwardRef(
  ({ label, options, error, ...rest }, ref) => (
    <div className="w-full flex flex-col mb-4">
      <label className="mb-1 text-gray-700 font-medium">{label}</label>
      <select
        ref={ref}
        {...rest}
        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  )
);

export default NormalSelect;
