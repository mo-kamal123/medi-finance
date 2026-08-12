import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { cn } from '../../../shared/lib/cn';
import { useDebounce } from '../../../shared/lib/use-debounce';
import { getAccountById, searchAccounts } from '../../tree/accouts-tree/api/accounts-tree';

const getAccountId = (account) => account.id ?? account.accountID;

const AccountSearchSelect = ({ value, onChange, disabled, error }) => {
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const portalRef = useRef(null);
  const inputRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const debouncedSearch = useDebounce(searchText, 700);

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['accounts', 'search', debouncedSearch],
    queryFn: () => searchAccounts({ code: debouncedSearch }),
    enabled: debouncedSearch.length > 0,
  });

  const selectedInResults = useMemo(
    () => searchResults.find((r) => String(getAccountId(r)) === String(value)),
    [searchResults, value],
  );

  const { data: selectedAccount } = useQuery({
    queryKey: ['account', value],
    queryFn: () => getAccountById(value),
    enabled: !!value && !selectedInResults,
  });

  const displayAccount = selectedInResults || selectedAccount;

  const displayLabel = displayAccount
    ? `${displayAccount.accountCode} - ${displayAccount.nameAr}`
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

  const handleSelect = (account) => {
    if (account.lockedInJournal) return;
    onChange({ target: { value: String(getAccountId(account)), name: 'accountID' } });
    setSearchText(account.accountCode || '');
    setIsOpen(false);
  };

  const lockedError = displayAccount?.lockedInJournal
    ? 'لا يمكن استخدام هذا الحساب لأنه مقفل'
    : null;

  return (
    <div ref={wrapperRef} className="w-full">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
          placeholder="ابحث بكود الحساب"
          disabled={disabled}
          dir="rtl"
          className={cn(
            'w-full rounded-lg border py-2 pr-10 text-sm outline-none transition-colors',
            error || lockedError ? 'border-red-500' : 'border-gray-300',
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
                <div className="p-3 text-sm text-gray-500">ابدأ بكتابة كود الحساب للبحث</div>
              ) : isSearching ? (
                <div className="p-3 text-sm text-gray-500">جاري التحميل...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">لا توجد نتائج</div>
              ) : (
                searchResults.map((account) => {
                  const isLocked = !!account.lockedInJournal;
                  return (
                    <div
                      key={getAccountId(account)}
                      onMouseDown={() => handleSelect(account)}
                      className={cn(
                        'border-b border-gray-100 p-3 last:border-b-0',
                        isLocked
                          ? 'cursor-not-allowed hover:bg-white'
                          : 'cursor-pointer hover:bg-gray-50',
                        String(getAccountId(account)) === String(value) &&
                          'bg-primary/10',
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium">
                          {account.accountCode}
                        </div>
                        {isLocked ? (
                          <span className="shrink-0 rounded bg-red-200 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                            مقفل
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-gray-600">
                        {account.nameAr || account.nameEn}
                      </div>
                    </div>
                  );
                })
              )}
            </div>,
            document.body,
          )
        : null}

      {lockedError ? (
        <p className="mt-1 text-xs text-red-500">{lockedError}</p>
      ) : error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : null}
    </div>
  );
};

export default AccountSearchSelect;
