import { Search } from 'lucide-react';

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
      pageNumber: 1, // reset pagination
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-white rounded-xl p-6 shadow-sm borderborder-gray-100">
      {/* 🔍 Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="ابحث برقم الفاتورة..."
          value={filters.invoiceNumber || ''}
          onChange={(e) => handleChange('invoiceNumber', e.target.value)}
          className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Status */}
      <select
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2"
      >
        <option value="">كل الحالات</option>
        <option value="paid">مدفوعة</option>
        <option value="pending">قيد الانتظار</option>
        <option value="overdue">متأخرة</option>
      </select>

      {/* Invoice Type */}
      <select
        value={filters.invoiceTypeId || ''}
        onChange={(e) => handleChange('invoiceTypeId', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2"
      >
        <option value="">كل الأنواع</option>
        {invoiceTypes?.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>

      {/* Customer */}
      <select
        value={filters.customerId || ''}
        onChange={(e) => handleChange('customerId', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2"
      >
        <option value="">كل العملاء</option>
        {customers?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Supplier */}
      <select
        value={filters.supplierId || ''}
        onChange={(e) => handleChange('supplierId', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2"
      >
        <option value="">كل الموردين</option>
        {suppliers?.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* Date From */}
      <input
        type="date"
        value={filters.fromDate || ''}
        onChange={(e) => handleChange('fromDate', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2"
      />

      {/* Date To */}
      <input
        type="date"
        value={filters.toDate || ''}
        onChange={(e) => handleChange('toDate', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2"
      />
    </div>
  );
};

export default InvoiceFilters;
