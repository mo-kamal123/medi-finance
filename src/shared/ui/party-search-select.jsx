import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { cn } from '../lib/cn';
import { useDebounce } from '../lib/use-debounce';
import { getCustomers, getCustomerById } from '../../features/master-data/customers/api/customers.api';
import { getSuppliers, getSupplier } from '../../features/master-data/suppliers/api/suppliers.api';

const DROPDOWN_MAX_HEIGHT = 240;

const PartySearchSelect = ({
  value,
  onChange,
  disabled,
  error,
  type = 'customer',
  placeholder,
  searchHint,
}) => {
  const isCustomer = type === 'customer';

  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [lastSelected, setLastSelected] = useState(null);
  const wrapperRef = useRef(null);
  const portalRef = useRef(null);
  const inputRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const debouncedSearch = useDebounce(searchText, 700);

  const searchFn = isCustomer
    ? (params) => getCustomers(params).then((r) => r.items)
    : (params) => getSuppliers(params).then((r) => r.items);
  const getByIdFn = isCustomer ? getCustomerById : getSupplier;
  const queryKey = isCustomer ? 'customers' : 'suppliers';

  const idKey = isCustomer ? 'customerID' : 'supplierID';
  const nameKey = 'clientName';

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: [queryKey, 'search', debouncedSearch],
    queryFn: () => searchFn({ search: debouncedSearch, pageSize: 20 }),
    enabled: debouncedSearch.length > 0,
  });

  const selectedInResults = useMemo(
    () =>
      searchResults.find(
        (r) => String(r[idKey] ?? r.id) === String(value)
      ),
    [searchResults, value, idKey]
  );

  const { data: selectedEntity } = useQuery({
    queryKey: [queryKey, value],
    queryFn: async () => {
      const res = await getByIdFn(value);
      return res?.data ?? res;
    },
    enabled: !!value && !selectedInResults,
  });

  const displayEntity =
    selectedInResults ||
    selectedEntity ||
    (lastSelected && String(lastSelected.id) === String(value)
      ? lastSelected
      : null);

  const displayLabel = displayEntity
    ? displayEntity[nameKey] ||
      displayEntity.nameAr ||
      displayEntity.providerNameAr ||
      displayEntity.customerNameAr ||
      displayEntity.supplierNameAr ||
      displayEntity.name ||
      String(value)
    : value || '';

  useLayoutEffect(() => {
    if (!isOpen || !wrapperRef.current) return;

    const updatePosition = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < DROPDOWN_MAX_HEIGHT + 8;

      setDropdownStyle({
        position: 'fixed',
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
        left: Math.max(rect.left, 16),
        width: rect.width,
        maxHeight: DROPDOWN_MAX_HEIGHT,
        zIndex: 9999,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    const timer = setTimeout(() => inputRef.current?.focus(), 0);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e) => {
      const insideWrapper = wrapperRef.current?.contains(e.target);
      const insidePortal = portalRef.current?.contains(e.target);
      if (!insideWrapper && !insidePortal) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  const handleSelect = (entity) => {
    const entityId = String(entity[idKey] ?? entity.id);
    const entityName =
      entity[nameKey] ||
      entity.nameAr ||
      entity.providerNameAr ||
      entity.customerNameAr ||
      entity.supplierNameAr ||
      entity.name ||
      '';
    onChange({
      target: {
        value: entityId,
        name: type === 'customer' ? 'customerID' : 'supplierID',
        entityName,
      },
    });
    setLastSelected({ id: entityId, name: entityName });
    setSearchText('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange({
      target: {
        value: '',
        name: type === 'customer' ? 'customerID' : 'supplierID',
        entityName: '',
      },
    });
    setLastSelected(null);
    setSearchText('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="w-full">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchText : displayLabel}
          onChange={(e) => {
            setSearchText(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (value && !displayLabel) setSearchText(String(value));
          }}
          placeholder={placeholder || (isCustomer ? 'ابحث عن عميل' : 'ابحث عن مورد')}
          disabled={disabled}
          dir="rtl"
          className={cn(
            'w-full rounded-lg border py-2 pr-10 outline-none transition-colors',
            displayEntity ? 'pl-8' : 'pl-3',
            error ? 'border-red-500' : 'border-gray-200',
            disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-white'
          )}
        />
        {displayEntity && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {isOpen && !disabled && dropdownStyle
        ? createPortal(
            <div
              ref={portalRef}
              style={dropdownStyle}
              className="overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
            >
              {debouncedSearch.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">
                  {searchHint ||
                    (isCustomer
                      ? 'اكتب اسم العميل للبحث'
                      : 'اكتب اسم المورد للبحث')}
                </div>
              ) : isSearching ? (
                <div className="p-3 text-sm text-gray-500">جاري التحميل...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">لا توجد نتائج</div>
              ) : (
                searchResults.map((entity) => {
                  const entityId = entity[idKey] ?? entity.id;
                  const entityName =
                    entity[nameKey] ||
                    entity.nameAr ||
                    entity.providerNameAr ||
                    entity.customerNameAr ||
                    entity.supplierNameAr ||
                    entity.name ||
                    '';
                  return (
                    <div
                      key={entityId}
                      onMouseDown={() => handleSelect(entity)}
                      className={cn(
                        'cursor-pointer border-b border-gray-100 p-3 last:border-b-0 hover:bg-gray-50',
                        String(entityId) === String(value) && 'bg-primary/10'
                      )}
                    >
                      <div className="text-sm font-medium">{entityName}</div>
                    </div>
                  );
                })
              )}
            </div>,
            document.body
          )
        : null}

      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : null}
    </div>
  );
};

export default PartySearchSelect;
