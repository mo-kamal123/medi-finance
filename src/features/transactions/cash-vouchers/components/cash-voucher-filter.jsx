import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import DateInput from '../../../../shared/ui/date-input';
import FormInput from '../../../../shared/ui/input';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import { useDebounce } from '../../../../shared/lib/use-debounce';
import { countActiveCashVoucherFilters } from '../utils/cash-voucher-filters.utils';

const TYPE_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'true', label: 'سند قبض' },
  { value: 'false', label: 'سند صرف' },
];

const BOOLEAN_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'true', label: 'نعم' },
  { value: 'false', label: 'لا' },
];

const CashVoucherFilters = ({ filters, setFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(
    filters.searchTerm || ''
  );
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setFilters((prev) => ({
      ...prev,
      searchTerm: debouncedSearchTerm,
      pageNumber: 1,
    }));
  }, [debouncedSearchTerm, setFilters]);

  useEffect(() => {
    setLocalSearchTerm(filters.searchTerm || '');
  }, [filters.searchTerm]);

  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || '',
      pageNumber: 1,
    }));
  };

  const handleReset = () => {
    setFilters({
      searchTerm: '',
      isReceipt: '',
      isCleared: '',
      isVoid: '',
      fromDate: '',
      toDate: '',
      pageNumber: 1,
      pageSize: filters.pageSize || 10,
    });
    setShowAdvanced(false);
    setLocalSearchTerm('');
  };

  const activeFilterCount = useMemo(
    () => countActiveCashVoucherFilters(filters),
    [filters]
  );

  const advancedFilterCount = useMemo(
    () =>
      countActiveCashVoucherFilters(filters, {
        exclude: ['pageNumber', 'pageSize', 'searchTerm'],
      }),
    [filters]
  );

  return (
    <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 ">
        <FormInput
          label="بحث"
          value={localSearchTerm}
          onChange={(event) => setLocalSearchTerm(event.target.value)}
          placeholder="ابحث برقم السند أو الفاتورة أو الطرف"
          autoFocus
        />
        <SearchableSelect
            label="نوع السند"
            value={filters.isReceipt || ''}
            onChange={(event) => handleChange('isReceipt', event.target.value)}
            placeholder="الكل"
            options={TYPE_OPTIONS}
          />

      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          <SlidersHorizontal size={16} />
          <span>فلاتر إضافية</span>
          {advancedFilterCount > 0 ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {advancedFilterCount}
            </span>
          ) : null}
          <ChevronDown
            size={16}
            className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          />
        </button>

        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            <RotateCcw size={16} />
            مسح الفلاتر
          </button>
        ) : null}
      </div>

      {showAdvanced ? (
        <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 md:grid-cols-2 xl:grid-cols-4">
          
          <SearchableSelect
            label="مقبوض"
            value={filters.isCleared || ''}
            onChange={(event) => handleChange('isCleared', event.target.value)}
            placeholder="الكل"
            options={BOOLEAN_OPTIONS}
          />

          <SearchableSelect
            label="ملغي"
            value={filters.isVoid || ''}
            onChange={(event) => handleChange('isVoid', event.target.value)}
            placeholder="الكل"
            options={BOOLEAN_OPTIONS}
          />

          <DateInput
            label="من تاريخ"
            value={filters.fromDate || ''}
            onChange={(event) => handleChange('fromDate', event.target.value)}
          />

          <DateInput
            label="إلى تاريخ"
            value={filters.toDate || ''}
            onChange={(event) => handleChange('toDate', event.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
};

export default CashVoucherFilters;
