import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '../lib/cn';

const normalizeOption = (option) => {
  if (
    option &&
    typeof option === 'object' &&
    Object.prototype.hasOwnProperty.call(option, 'value')
  ) {
    return {
      value: String(option.value ?? ''),
      label: String(option.label ?? option.value ?? ''),
      searchText: String(option.searchText ?? option.label ?? option.value ?? ''),
    };
  }

  return {
    value: String(option ?? ''),
    label: String(option ?? ''),
    searchText: String(option ?? ''),
  };
};

const SearchableSelect = forwardRef(
  (
    {
      label,
      options = [],
      children,
      placeholder = 'اختر',
      searchPlaceholder = 'ابحث...',
      emptyMessage = 'لا توجد نتائج',
      error,
      disabled = false,
      value,
      defaultValue,
      onChange,
      onBlur,
      name,
      dropdownPosition = 'bottom',
      className = '',
      inputClass = '',
      containerClass = '',
      ...props
    },
    forwardedRef
  ) => {
    const generatedId = useId();
    const fieldId = props.id || generatedId;
    const wrapperRef = useRef(null);
    const portalRef = useRef(null);
    const selectRef = useRef(null);
    const searchInputRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [dropdownStyle, setDropdownStyle] = useState({});
    const [internalValue, setInternalValue] = useState(
      String(value ?? defaultValue ?? '')
    );

    const parsedChildrenOptions = useMemo(
      () =>
        Children.toArray(children)
          .filter(isValidElement)
          .map((child) =>
            normalizeOption({
              value: child.props.value ?? '',
              label: child.props.children,
            })
          ),
      [children]
    );

    const normalizedOptions = useMemo(() => {
      const source = options.length ? options : parsedChildrenOptions;
      return source.map(normalizeOption);
    }, [options, parsedChildrenOptions]);

    const selectedValue =
      value !== undefined ? String(value ?? '') : String(internalValue ?? '');

    const selectedOption = normalizedOptions.find(
      (option) => option.value === selectedValue
    );

    const filteredOptions = useMemo(() => {
      const searchValue = query.trim().toLowerCase();
      if (!searchValue) return normalizedOptions;

      return normalizedOptions.filter((option) =>
        option.searchText.toLowerCase().includes(searchValue)
      );
    }, [normalizedOptions, query]);

    useEffect(() => {
      if (!isOpen) return undefined;

      const handlePointerDown = (event) => {
        const clickedInsideTrigger = wrapperRef.current?.contains(event.target);
        const clickedInsidePortal = portalRef.current?.contains(event.target);

        if (!clickedInsideTrigger && !clickedInsidePortal) {
          setIsOpen(false);
          setQuery('');

          if (selectRef.current) {
            onBlur?.({
              target: selectRef.current,
              currentTarget: selectRef.current,
            });
          }
        }
      };

      document.addEventListener('mousedown', handlePointerDown);
      return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [isOpen, onBlur]);

    useEffect(() => {
      if (!isOpen || !wrapperRef.current) return undefined;

      const updateDropdownPosition = () => {
        if (!wrapperRef.current) return;

        const rect = wrapperRef.current.getBoundingClientRect();
        const viewportPadding = 16;
        const availableWidth = Math.max(
          rect.width,
          window.innerWidth - rect.left - viewportPadding
        );

        setDropdownStyle({
          position: 'fixed',
          top:
            dropdownPosition === 'top'
              ? 'auto'
              : Math.min(rect.bottom + 8, window.innerHeight - viewportPadding),
          bottom:
            dropdownPosition === 'top'
              ? Math.max(window.innerHeight - rect.top + 8, viewportPadding)
              : 'auto',
          left: Math.max(rect.left, viewportPadding),
          minWidth: rect.width,
          width: 'max-content',
          maxWidth: availableWidth,
          zIndex: 9999,
        });
      };

      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);

      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });

      return () => {
        window.removeEventListener('scroll', updateDropdownPosition, true);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    }, [dropdownPosition, isOpen]);

    const setRefs = (node) => {
      selectRef.current = node;

      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    const emitChange = (normalizedValue) => {
      const event = {
        target: { name, value: normalizedValue },
        currentTarget: { name, value: normalizedValue },
      };

      onChange?.(event);
    };

    const handleOptionSelect = (nextValue) => {
      const normalizedValue = String(nextValue ?? '');

      if (value === undefined) {
        setInternalValue(normalizedValue);
      }

      if (selectRef.current) {
        selectRef.current.value = normalizedValue;
      }

      emitChange(normalizedValue);
      setIsOpen(false);
      setQuery('');

      if (selectRef.current) {
        onBlur?.({
          target: selectRef.current,
          currentTarget: selectRef.current,
        });
      }
    };

    const handleNativeChange = (event) => {
      if (value === undefined) {
        setInternalValue(String(event.target.value ?? ''));
      }

      onChange?.(event);
    };

    return (
      <div className={cn('w-full', containerClass)}>
        {label ? (
          <label htmlFor={fieldId} className="mb-1 block font-medium text-gray-700">
            {label}
          </label>
        ) : null}

        <div ref={wrapperRef} className="relative">
          <select
            {...props}
            id={fieldId}
            name={name}
            ref={setRefs}
            value={selectedValue}
            onChange={handleNativeChange}
            onBlur={onBlur}
            disabled={disabled}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          >
            <option value="">{placeholder}</option>
            {normalizedOptions.map((option) => (
              <option key={option.value || '__empty__'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setIsOpen((prev) => !prev);
              setQuery('');
            }}
            className={cn(
              'flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-2 text-right transition',
              error ? 'border-red-400' : 'border-gray-200 shadow-sm hover:border-primary/40',
              disabled && 'cursor-not-allowed bg-gray-100 text-gray-400',
              className,
              inputClass
            )}
          >
            <span
              className={cn(
                'truncate text-sm',
                selectedOption ? 'text-gray-900' : 'text-gray-400'
              )}
            >
              {selectedOption?.label || placeholder}
            </span>

            <ChevronDown
              size={18}
              className={cn('text-gray-400 transition-transform', isOpen && 'rotate-180')}
            />
          </button>
        </div>

        {isOpen
          ? createPortal(
              <div
                ref={portalRef}
                style={dropdownStyle}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.14)]"
              >
                <div className="border-b border-gray-100 p-3">
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                    <Search size={16} className="text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={searchPlaceholder}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto p-2">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => {
                      const isSelected = option.value === selectedValue;

                      return (
                        <button
                          key={option.value || `${option.label}-empty`}
                          type="button"
                          onClick={() => handleOptionSelect(option.value)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm',
                            isSelected
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-gray-50'
                          )}
                        >
                          <span className="text-right">{option.label}</span>
                          {isSelected ? <Check size={16} /> : null}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-400">
                      {emptyMessage}
                    </div>
                  )}
                </div>
              </div>,
              document.body
            )
          : null}

        {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
      </div>
    );
  }
);

SearchableSelect.displayName = 'SearchableSelect';

export default SearchableSelect;
