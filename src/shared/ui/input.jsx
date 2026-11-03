import { Children, isValidElement, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import SearchableSelect from './searchable-select';

const FormInput = ({
  label,
  error,
  icon: Icon,
  type = 'text',
  as = 'input',
  children,
  containerClass = '',
  inputClass = '',
  className = '',
  placeholder = 'ادخل قيمة',
  required,
  passwordToggle = false,
  ref,
  name,
  onBlur,
  onChange,
  ...props
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const canTogglePassword =
    as === 'input' && type === 'password' && passwordToggle;
  const PasswordIcon = passwordVisible ? EyeOff : Eye;
  const baseClasses = `
    w-full
    ${Icon || canTogglePassword ? 'pr-10' : 'pr-4'}
    pl-4
    py-2
    border
    rounded-lg
    focus:outline-none
    transition
    hover:border-primary/40
    placeholder:text-sm
    ${error ? 'border-red-400 ' : 'border-gray-200 focus:border-primary/40'}
    ${inputClass}
    ${className}
  `;

  return (
    <div className={`w-full ${containerClass}`}>
      {label && (
        <label
          htmlFor={props.id}
          className="block mb-1 font-medium text-gray-700 text-[15px]"
        >
          {label}
          {required ? <span className="text-red-500 mr-1"> *</span> : null}
        </label>
      )}

      <div className="relative">
        {Icon && as !== 'textarea' && (
          <Icon
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}

        {as === 'textarea' ? (
          <textarea
            ref={ref}
            name={name}
            onBlur={onBlur}
            onChange={onChange}
            {...props}
            className={baseClasses + ' min-h-25'}
          />
        ) : as === 'select' ? (
          <SearchableSelect
            {...props}
            ref={ref}
            name={name}
            onBlur={onBlur}
            onChange={onChange}
            label={null}
            error={error}
            placeholder={placeholder || 'اختر'}
            className={baseClasses}
            options={Children.toArray(children)
              .filter(isValidElement)
              .map((child) => ({
                value: child.props.value ?? '',
                label: child.props.children,
              }))}
          />
        ) : (
          <input
            ref={ref}
            name={name}
            onBlur={onBlur}
            onChange={onChange}
            {...props}
            type={canTogglePassword && passwordVisible ? 'text' : type}
            className={baseClasses}
            placeholder={placeholder}
          />
        )}
        {canTogglePassword && (
          <button
            type="button"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-primary"
            aria-label={
              passwordVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
            }
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            <PasswordIcon size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      {error && as !== 'select' && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FormInput;
