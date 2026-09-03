import { useEffect, useMemo, useRef, useState } from 'react';
import DateInput from '../../../../shared/ui/date-input';
import FormInput from '../../../../shared/ui/input';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import FilterBar from '../../../../shared/ui/filter-bar';
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
    setLocalSearchTerm('');
  };

  const activeFilterCount = useMemo(
    () => countActiveCashVoucherFilters(filters),
    [filters]
  );

  const extraFilterCount = useMemo(
    () =>
      countActiveCashVoucherFilters(filters, {
        exclude: ['pageNumber', 'pageSize', 'searchTerm'],
      }),
    [filters]
  );

  const primaryFilters = [
    <FormInput
      key="search"
      label="بحث"
      value={localSearchTerm}
      onChange={(event) => setLocalSearchTerm(event.target.value)}
      placeholder="ابحث برقم السند أو الفاتورة أو الطرف"
      autoFocus
    />,
    <SearchableSelect
      key="type"
      label="نوع السند"
      value={filters.isReceipt || ''}
      onChange={(event) => handleChange('isReceipt', event.target.value)}
      placeholder="الكل"
      options={TYPE_OPTIONS}
    />,
    <SearchableSelect
      key="cleared"
      label="مقبوض"
      value={filters.isCleared || ''}
      onChange={(event) => handleChange('isCleared', event.target.value)}
      placeholder="الكل"
      options={BOOLEAN_OPTIONS}
    />,
    <SearchableSelect
      key="void"
      label="ملغي"
      value={filters.isVoid || ''}
      onChange={(event) => handleChange('isVoid', event.target.value)}
      placeholder="الكل"
      options={BOOLEAN_OPTIONS}
    />,
  ];

  const extraFilters = [
    <DateInput
      key="from"
      label="من تاريخ"
      value={filters.fromDate || ''}
      onChange={(event) => handleChange('fromDate', event.target.value)}
    />,
    <DateInput
      key="to"
      label="إلى تاريخ"
      value={filters.toDate || ''}
      onChange={(event) => handleChange('toDate', event.target.value)}
    />,
  ];

  return (
    <FilterBar
      primaryFilters={primaryFilters}
      extraFilters={extraFilters}
      onReset={handleReset}
      activeCount={activeFilterCount}
      extraCount={extraFilterCount}
    />
  );
};

export default CashVoucherFilters;
