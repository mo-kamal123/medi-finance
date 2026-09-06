import { Children, isValidElement } from 'react';
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
  ...props
}) => {
  const baseClasses = `
    w-full
    ${Icon ? 'pr-10' : 'pr-4'}
    pl-4
    py-2
    border
    rounded-lg
    focus:outline-none
    transition
    hover:border-primary/40
    placeholder:text-sm
    ${
      error
        ? 'border-red-400 '
        : 'border-gray-200 focus:border-primary/40'
    }
    ${inputClass}
    ${className}
  `;

  return (
    <div className={`w-full ${containerClass}`}>
      {label && (
        <label className="block mb-1 font-medium text-gray-700 text-[15px]">
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
          <textarea {...props} className={baseClasses + ' min-h-25'} />
        ) : as === 'select' ? (
          <SearchableSelect
            {...props}
            label={null}
            error={error}
            placeholder={props.placeholder || 'اختر'}
            className={baseClasses}
            options={Children.toArray(children)
              .filter(isValidElement)
              .map((child) => ({
                value: child.props.value ?? '',
                label: child.props.children,
              }))}
          />
        ) : (
          <input {...props} type={type} className={baseClasses} placeholder={placeholder}/>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>

    </div>
  );
};

export default FormInput;
