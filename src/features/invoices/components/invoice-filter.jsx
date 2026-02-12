import { Search } from 'lucide-react';

const InvoiceFilters = ({ searchQuery, setSearchQuery, statusFilter, setStatusFilter }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="relative flex-1">
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث عن فاتورة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="all">جميع الحالات</option>
        <option value="مدفوعة">مدفوعة</option>
        <option value="معلقة">معلقة</option>
      </select>
    </div>
  );
};

export default InvoiceFilters;
