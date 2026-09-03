import { useEffect, useMemo, useRef, useState } from 'react';
import DateInput from '../../../../shared/ui/date-input';
import FormInput from '../../../../shared/ui/input';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import FilterBar from '../../../../shared/ui/filter-bar';
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
    setLocalInvoiceNumber('');
  };

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters]
  );

  const extraFilterCount = useMemo(
    () =>
      countActiveFilters(filters, {
        exclude: ['pageNumber', 'pageSize', 'invoiceNumber', 'statusId'],
      }),
    [filters]
  );

  const primaryFilters = [
    <FormInput
      key="invoiceNumber"
      label="رقم الفاتورة"
      value={localInvoiceNumber}
      onChange={(event) => setLocalInvoiceNumber(event.target.value)}
      placeholder="ابحث برقم الفاتورة"
      autoFocus
    />,
    <SearchableSelect
      key="status"
      label="الحالة"
      value={filters.statusId || ''}
      onChange={(event) => handleChange('statusId', event.target.value)}
      placeholder="كل الحالات"
      options={statusOptions}
    />,
    <SearchableSelect
      key="type"
      label="نوع الفاتورة"
      value={filters.invoiceTypeId || ''}
      onChange={(event) => handleChange('invoiceTypeId', event.target.value)}
      placeholder="كل الأنواع"
      options={invoiceTypeOptions}
    />,
    <SearchableSelect
      key="customer"
      label="العميل"
      value={filters.customerId || ''}
      onChange={(event) => handleChange('customerId', event.target.value)}
      placeholder="كل العملاء"
      options={customerOptions}
    />,
  ];

  const extraFilters = [
    <SearchableSelect
      key="supplier"
      label="المورد"
      value={filters.supplierId || ''}
      onChange={(event) => handleChange('supplierId', event.target.value)}
      placeholder="كل الموردين"
      options={supplierOptions}
    />,
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

export default InvoiceFilters;
