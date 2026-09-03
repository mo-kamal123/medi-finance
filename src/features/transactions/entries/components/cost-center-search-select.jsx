import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { cn } from '../../../../shared/lib/cn';
import { useDebounce } from '../../../../shared/lib/use-debounce';
import {
  searchCostCenters,
  getCostById,
} from '../../../accounting/tree/cost-tree/api/cost-tree';

const CostCenterSearchSelect = ({
  value,
  onChange,
  disabled,
  error,
  placeholder = 'ابحث عن مركز تكلفة',
  searchHint = 'ابدأ بكتابة اسم أو كود مركز التكلفة للبحث',
}) => {
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const portalRef = useRef(null);
  const inputRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const debouncedSearch = useDebounce(searchText, 700);

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['costCenters', 'search', debouncedSearch],
    queryFn: () => searchCostCenters({ searchText: debouncedSearch }),
    enabled: debouncedSearch.length > 0,
  });

  const selectedInResults = useMemo(
    () =>
      searchResults.find(
        (r) =>
          String(r.costCenterID ?? r.id) === String(value)
      ),
    [searchResults, value]
  );

  const { data: selectedCenter } = useQuery({
    queryKey: ['costCenter', value],
    queryFn: () => getCostById(value),
    enabled: !!value && !selectedInResults,
  });

  const displayCenter = selectedInResults || selectedCenter;

  const displayLabel = displayCenter
    ? `${displayCenter.costCenterCode || displayCenter.code || ''} - ${displayCenter.nameAr || displayCenter.nameEn || ''}`
    : value || '';

  useLayoutEffect(() => {
    if (!isOpen || !wrapperRef.current) return;

    const updatePosition = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: Math.min(rect.bottom + 4, window.innerHeight - 16),
        left: Math.max(rect.left, 8),
        width: rect.width,
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

  const handleSelect = (center) => {
    const centerId = String(center.costCenterID ?? center.id);
    onChange({
      target: { value: centerId, name: 'costCenterID' },
    });
    setSearchText('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange({
      target: { value: '', name: 'costCenterID' },
    });
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
          placeholder={placeholder}
          disabled={disabled}
          dir="rtl"
          className={cn(
            'w-full rounded-lg border py-2 pr-10 outline-none transition-colors',
            displayCenter ? 'pl-8' : 'pl-3',
            error ? 'border-red-500' : 'border-gray-200',
            disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-white'
          )}
        />
        {displayCenter && !disabled ? (
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
              className="z-9999 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
            >
              {debouncedSearch.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">{searchHint}</div>
              ) : isSearching ? (
                <div className="p-3 text-sm text-gray-500">جاري التحميل...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">لا توجد نتائج</div>
              ) : (
                searchResults.map((center) => {
                  const centerId = center.costCenterID ?? center.id;
                  return (
                    <div
                      key={centerId}
                      onMouseDown={() => handleSelect(center)}
                      className={cn(
                        'cursor-pointer border-b border-gray-100 p-3 last:border-b-0 hover:bg-gray-50',
                        String(centerId) === String(value) && 'bg-primary/10'
                      )}
                    >
                      <div className="text-sm font-medium">
                        {center.costCenterCode || center.code || ''}
                      </div>
                      <div className="text-xs text-gray-600">
                        {center.nameAr || center.nameEn || ''}
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

export default CostCenterSearchSelect;
