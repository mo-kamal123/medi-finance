import { useId } from 'react';

const Toggle = ({ label, disabled, className = '', ...props }) => {
  const generatedId = useId();

  return (
    <label
      htmlFor={generatedId}
      className={`flex w-fit cursor-pointer select-none items-center gap-3 ${
        disabled ? 'cursor-not-allowed opacity-60' : ''
      } ${className}`}
    >
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          id={generatedId}
          type="checkbox"
          disabled={disabled}
          {...props}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-gray-200 transition-colors peer-checked:bg-main peer-disabled:cursor-not-allowed" />
        <span className="absolute right-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
      </span>
      {label ? (
        <span className="text-sm font-medium text-gray-800">{label}</span>
      ) : null}
    </label>
  );
};

export default Toggle;