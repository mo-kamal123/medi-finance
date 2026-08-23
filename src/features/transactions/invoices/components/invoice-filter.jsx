import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import DateInput from '../../../../shared/ui/date-input';
import FormInput from '../../../../shared/ui/input';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import { useDebounce } from '../../../../shared/lib/use-debounce';
import { useInvoiceStatuses } from '../hooks/invoices.queries';
import { INVOICE_STATUS_OPTIONS } from '../utils/mapInvoiceToFormValues';

const DEFAULT_INVOICE_FILTERS = {
  invoiceNumber: '',
  statusId: '',
  invoiceTypeId: '',
  customerId: '',
  supplierId: '',
  fromDate: '',
  toDate: '',
  pageNumber: 1,
  pageSize: 10,
};

const countActiveFilters = (filters, { exclude = ['pageNumber', 'pageSize'] } = {}) => {
  return Object.entries(filters).filter(([key, value]) => {
    if (exclude.includes(key)) return false;
    return value !== '' && value !== null && value !== undefined;
  }).length;
};

const InvoiceFilters = ({
  filters,
  setFilters,
  invoiceTypes,
  customers,
  suppliers,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localInvoiceNumber, setLocalInvoiceNumber] = useState(
    filters.invoiceNumber || ''
  );
  const debouncedInvoiceNumber = useDebounce(localInvoiceNumber, 500);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setFilters((prev) => ({
      ...prev,
      invoiceNumber: debouncedInvoiceNumber,
      pageNumber: 1,
    }));
  }, [debouncedInvoiceNumber]);

  useEffect(() => {
    setLocalInvoiceNumber(filters.invoiceNumber || '');
  }, [filters.invoiceNumber]);

  const { data: invoiceStatuses = [] } = useInvoiceStatuses();

  const statusOptions = useMemo(
    () =>
      invoiceStatuses.length > 0
        ? invoiceStatuses.map((status) => ({
            value: String(status.id ?? status.statusId),
            label: status.nameAr ?? status.name ?? status.nameEn,
          }))
        : INVOICE_STATUS_OPTIONS,
    [invoiceStatuses]
  );

  const invoiceTypeOptions = useMemo(
    () =>
      invoiceTypes?.map((type) => ({
        value: type.id ?? type.invoiceTypeID,
        label: type.nameAr,
      })) || [],
    [invoiceTypes]
  );

  const customerOptions = useMemo(
    () =>
      customers?.map((customer) => ({
        value: customer.id ?? customer.customerID,
        label: customer.customerNameAr,
      })) || [],
    [customers]
  );

  const supplierOptions = useMemo(
    () =>
      suppliers?.map((supplier) => ({
        value: supplier.id ?? supplier.supplierID,
        label: supplier.supplierNameAr,
      })) || [],
    [suppliers]
  );

  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      pageNumber: 1,
    }));
  };

  const handleReset = () => {
    setFilters((prev) => ({
      ...DEFAULT_INVOICE_FILTERS,
      pageSize: prev.pageSize,
    }));
    setShowAdvanced(false);
    setLocalInvoiceNumber('');
  };

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters]
  );

  const advancedFilterCount = useMemo(
    () =>
      countActiveFilters(filters, {
        exclude: ['pageNumber', 'pageSize', 'invoiceNumber'],
      }),
    [filters]
  );

  return (
    <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FormInput
          label="رقم الفاتورة"
          value={localInvoiceNumber}
          onChange={(event) => setLocalInvoiceNumber(event.target.value)}
          placeholder="ابحث برقم الفاتورة"
          autoFocus
        />
                  <SearchableSelect
            label="الحالة"
            value={filters.statusId || ''}
            onChange={(event) => handleChange('statusId', event.target.value)}
            placeholder="كل الحالات"
            options={statusOptions}
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
            label="نوع الفاتورة"
            value={filters.invoiceTypeId || ''}
            onChange={(event) => handleChange('invoiceTypeId', event.target.value)}
            placeholder="كل الأنواع"
            options={invoiceTypeOptions}
          />

          <SearchableSelect
            label="العميل"
            value={filters.customerId || ''}
            onChange={(event) => handleChange('customerId', event.target.value)}
            placeholder="كل العملاء"
            options={customerOptions}
          />

          <SearchableSelect
            label="المورد"
            value={filters.supplierId || ''}
            onChange={(event) => handleChange('supplierId', event.target.value)}
            placeholder="كل الموردين"
            options={supplierOptions}
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

export default InvoiceFilters;
