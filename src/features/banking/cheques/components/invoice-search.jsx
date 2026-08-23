import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { cn } from '../../../../shared/lib/cn';
import { useDebounce } from '../../../../shared/lib/use-debounce';
import { getInvoiceByNumber } from '../api/cheques.api';

const unwrapInvoice = (data) => {
  if (!data || typeof data !== 'object') return null;
  return data.data || data.result || data.item || data;
};

const InvoiceSearch = ({ value, onChange, onInvoiceSelect, disabled, error, displayValue }) => {
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState('');
  const wrapperRef = useRef(null);
  const portalRef = useRef(null);
  const inputRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const debouncedSearch = useDebounce(searchText, 700);

  const { data: invoice, isLoading: isSearching } = useQuery({
    queryKey: ['invoice', 'lookup', debouncedSearch],
    queryFn: () => getInvoiceByNumber(debouncedSearch),
    enabled: debouncedSearch.length > 0,
    retry: false,
  });

  const invoiceResult = unwrapInvoice(invoice);
  const invoiceID = invoiceResult?.invoiceID ?? invoiceResult?.invoiceId ?? invoiceResult?.id;
  const foundInvoice =
    invoiceResult &&
    !invoiceResult?.status?.toLowerCase?.().includes('not found') &&
    invoiceID
      ? { ...invoiceResult, invoiceID }
      : null;

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

  const handleSelect = () => {
    if (!foundInvoice) return;
    onChange({
      target: {
        value: String(foundInvoice.invoiceID),
        name: 'invoiceID',
      },
    });
    setSelectedNumber(foundInvoice.invoiceNumber);
    setSearchText(foundInvoice.invoiceNumber);
    setIsOpen(false);
    onInvoiceSelect?.(foundInvoice);
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
          value={isOpen ? searchText : displayValue || selectedNumber || value || ''}
          onChange={(e) => {
            setSearchText(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          placeholder="INV-2026-0001"
          disabled={disabled}
          dir="rtl"
          className={cn(
            'w-full rounded-lg border py-2 pr-10 text-sm outline-none transition-colors',
            error ? 'border-red-500' : 'border-gray-300',
            disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-white',
          )}
        />
      </div>

      {isOpen && !disabled && dropdownStyle
        ? createPortal(
            <div
              ref={portalRef}
              style={dropdownStyle}
              className="z-[9999] max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
            >
              {debouncedSearch.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">ابدأ بكتابة رقم الفاتورة</div>
              ) : isSearching ? (
                <div className="p-3 text-sm text-gray-500">جاري التحميل...</div>
              ) : !foundInvoice ? (
                <div className="p-3 text-sm text-gray-500">لا توجد فاتورة بهذا الرقم</div>
              ) : (
                <div
                  onMouseDown={handleSelect}
                  className={cn(
                    'cursor-pointer border-b border-gray-100 p-3 last:border-b-0 hover:bg-gray-50',
                  )}
                >
                  <div className="text-sm font-medium">
                    {foundInvoice.invoiceNumber}
                  </div>
                  <div className="text-xs text-gray-600">
                    {foundInvoice.customerNameAr ||
                      foundInvoice.supplierNameAr ||
                      ''}{' '}
                    - صافي: {foundInvoice.netAmount}
                  </div>
                </div>
              )}
            </div>,
            document.body,
          )
        : null}

      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
};

export default InvoiceSearch;
