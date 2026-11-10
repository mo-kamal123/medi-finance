import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { cn } from '../lib/cn';
import { useDebounce } from '../lib/use-debounce';
import { getCustomers, getCustomerById } from '../../features/master-data/customers/api/customers.api';
import { getSuppliers, getSupplier } from '../../features/master-data/suppliers/api/suppliers.api';

const DROPDOWN_MAX_HEIGHT = 240;

// Supplier records use varying key names (supplierNameAr, providerNameAr,
// supplierName, providerName, ...) unlike customers (clientName) — resolve
// through every known variant so the name (not the id) is displayed.
const getEntityId = (entity, idKey) =>
  entity?.[idKey] ??
  entity?.providerId ??
  entity?.providerID ??
  entity?.id ??
  '';
const getEntityName = (entity) =>
  entity?.clientName ||
  entity?.supplierNameAr ||
  entity?.supplierNameEn ||
  entity?.supplierName ||
  entity?.providerNameAr ||
  entity?.providerNameEn ||
  entity?.providerName ||
  entity?.customerNameAr ||
  entity?.customerNameEn ||
  entity?.customerName ||
  entity?.nameAr ||
  entity?.nameEn ||
  entity?.name ||
  '';

const PartySearchSelect = ({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  type = 'customer',
  partyType = 'customer',
  placeholder,
  searchHint,
  selectedOption,
}) => {
  const isCombined = type === 'all';
  const selectedType = isCombined ? partyType : type;
  const isCustomer = selectedType === 'customer';
  const resultType = (entity) => entity.__partyType || selectedType;
  const resultId = (entity) => getEntityId(entity, resultType(entity) === 'customer' ? 'customerID' : 'supplierID');

  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [lastSelected, setLastSelected] = useState(null);
  const wrapperRef = useRef(null);
  const portalRef = useRef(null);
  const inputRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const debouncedSearch = useDebounce(searchText, 700);

  const searchFn = isCombined
    ? async (params) => {
        const [customers, suppliers] = await Promise.all([getCustomers(params), getSuppliers(params)]);
        return [
          ...customers.items.map((entity) => ({ ...entity, __partyType: 'customer' })),
          ...suppliers.items.map((entity) => ({ ...entity, __partyType: 'supplier' })),
        ];
      }
    : isCustomer
    ? (params) => getCustomers(params).then((r) => r.items)
    : (params) => getSuppliers(params).then((r) => r.items);
  const getByIdFn = isCustomer ? getCustomerById : getSupplier;
  const selectedQueryKey = isCustomer ? 'customers' : 'suppliers';
  const queryKey = isCombined ? 'parties' : selectedQueryKey;

  const idKey = isCustomer ? 'customerID' : 'supplierID';

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: [queryKey, 'search', debouncedSearch],
    queryFn: () => searchFn({ search: debouncedSearch, pageSize: 20 }),
    enabled: debouncedSearch.length > 0,
  });

  const selectedInResults = useMemo(
    () =>
      searchResults.find(
        (r) => (!isCombined || r.__partyType === selectedType) && String(getEntityId(r, idKey)) === String(value)
      ),
    [searchResults, value, idKey, isCombined, selectedType]
  );

  const suppliedName = String(selectedOption?.value) === String(value)
    ? selectedOption?.label?.trim() || ''
    : '';
  const lastSelectedName = lastSelected && String(lastSelected.id) === String(value) && lastSelected.type === selectedType
    ? lastSelected.name
    : '';

  const { data: selectedEntity } = useQuery({
    queryKey: [selectedQueryKey, value],
    queryFn: async () => {
      const res = await getByIdFn(value);
      return res?.data ?? res;
    },
    enabled: !!value && !selectedInResults && !suppliedName && !lastSelectedName,
  });

  // Priority: live search hit → the name the user just picked → server
  // by-id fetch (edit mode). A truthy-but-nameless by-id response must never
  // shadow the confirmed selection, otherwise the input falls back to the id.
  const selectedName =
    getEntityName(selectedInResults) ||
    lastSelectedName ||
    suppliedName ||
    getEntityName(selectedEntity);

  const displayLabel = selectedName || (value ? String(value) : '');
  const hasSelection = Boolean(value);

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
    const entityId = String(resultId(entity));
    const entityType = resultType(entity);
    const entityName = getEntityName(entity);
    onChange({
      target: {
        value: entityId,
        name: entityType === 'customer' ? 'customerID' : 'supplierID',
        partyType: entityType,
        entityName,
      },
    });
    setLastSelected({ id: entityId, name: entityName, type: entityType });
    setSearchText('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange({
      target: {
        value: '',
        name: selectedType === 'customer' ? 'customerID' : 'supplierID',
        partyType: selectedType,
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
          onBlur={(event) => {
            onBlur?.(event);
          }}
          placeholder={placeholder || (isCombined ? 'ابحث عن المتعامل' : isCustomer ? 'ابحث عن عميل' : 'ابحث عن مورد')}
          disabled={disabled}
          dir="rtl"
          className={cn(
            'w-full rounded-lg border py-2 pr-10 placeholder:text-sm outline-none transition-colors',
            hasSelection ? 'pl-8' : 'pl-3',
            error ? 'border-red-500' : 'border-gray-200',
            disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-white'
          )}
        />
        {hasSelection && !disabled ? (
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
              className="overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md"
            >
              {debouncedSearch.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">
                  {searchHint ||
                    (isCombined ? 'اكتب اسم العميل أو المورد للبحث' : isCustomer
                      ? 'اكتب اسم العميل للبحث'
                      : 'اكتب اسم المورد للبحث')}
                </div>
              ) : isSearching ? (
                <div className="p-3 text-sm text-gray-500">جاري التحميل...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">لا توجد نتائج</div>
              ) : (
                searchResults.map((entity) => {
                  const entityId = resultId(entity);
                  const entityType = resultType(entity);
                  const entityName = getEntityName(entity);
                  return (
                    <div
                      key={`${entityType}:${entityId}`}
                      onMouseDown={() => handleSelect(entity)}
                      className={cn(
                        'cursor-pointer border-b border-gray-100 p-3 last:border-b-0 hover:bg-gray-50',
                        entityType === selectedType && String(entityId) === String(value) && 'bg-primary/10'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 text-sm font-medium">
                        {entityName}
                        {isCombined && <span className="shrink-0 text-xs text-gray-500">{entityType === 'customer' ? 'عميل' : 'مورد'}</span>}
                      </div>
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
