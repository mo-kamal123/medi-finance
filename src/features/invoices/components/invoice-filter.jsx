import { Search } from 'lucide-react';
import SearchableSelect from '../../../shared/ui/searchable-select';

const InvoiceFilters = ({
  filters,
  setFilters,
  invoiceTypes,
  customers,
  suppliers,
}) => {
  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      pageNumber: 1,
    }));
  };

  return (
    <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:grid-cols-3">
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="ابحث برقم الفاتورة..."
          value={filters.invoiceNumber || ''}
          onChange={(event) => handleChange('invoiceNumber', event.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2 pr-10 pl-4"
        />
      </div>

      <SearchableSelect
        value={filters.status || ''}
        onChange={(event) => handleChange('status', event.target.value)}
        placeholder="كل الحالات"
        options={[
          { value: 'paid', label: 'مدفوعة' },
          { value: 'pending', label: 'قيد الانتظار' },
          { value: 'overdue', label: 'متأخرة' },
        ]}
      />

      <SearchableSelect
        value={filters.invoiceTypeId || ''}
        onChange={(event) => handleChange('invoiceTypeId', event.target.value)}
        placeholder="كل الأنواع"
        options={
          invoiceTypes?.map((type) => ({
            value: type.id ?? type.invoiceTypeID,
            label: type.nameAr,
          })) || []
        }
      />

      <SearchableSelect
        value={filters.customerId || ''}
        onChange={(event) => handleChange('customerId', event.target.value)}
        placeholder="كل العملاء"
        options={
          customers?.map((customer) => ({
            value: customer.id ?? customer.customerID,
            label: customer.customerNameAr,
          })) || []
        }
      />

      <SearchableSelect
        value={filters.supplierId || ''}
        onChange={(event) => handleChange('supplierId', event.target.value)}
        placeholder="كل الموردين"
        options={
          suppliers?.map((supplier) => ({
            value: supplier.id ?? supplier.supplierID,
            label: supplier.supplierNameAr,
          })) || []
        }
      />

      <input
        type="date"
        value={filters.fromDate || ''}
        onChange={(event) => handleChange('fromDate', event.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2"
      />

      <input
        type="date"
        value={filters.toDate || ''}
        onChange={(event) => handleChange('toDate', event.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2"
      />
    </div>
  );
};

export default InvoiceFilters;
