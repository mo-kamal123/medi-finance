import { Search } from 'lucide-react';

const InvoiceFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* 🔍 Search */}
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="ابحث برقم الفاتورة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* 📌 Status Filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[180px]"
      >
        <option value="all">جميع الحالات</option>
        <option value="paid">مدفوعة</option>
        <option value="pending">قيد الانتظار</option>
        <option value="overdue">متأخرة</option>
      </select>
    </div>
  );
};

export default InvoiceFilters;
