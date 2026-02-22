const FormInput = ({
    label,
    error,
    icon: Icon,
    containerClass = "",
    inputClass = "",
    className = "",
    ...props
  }) => {
    return (
      <div className={`w-full ${containerClass}`}>
        {label && (
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
  
        <div className="relative">
          {Icon && (
            <Icon
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          )}
  
          <input
            {...props}
            className={`
              w-full
              ${Icon ? "pr-10" : "pr-4"}
              pl-4
              py-2
              border
              rounded-lg
              focus:outline-none
              focus:ring-2
              transition
              ${
                error
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-200 focus:ring-primary/20 focus:border-primary"
              }
              ${inputClass}
              ${className}
            `}
          />
        </div>
  
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  };
  
  export default FormInput;
  