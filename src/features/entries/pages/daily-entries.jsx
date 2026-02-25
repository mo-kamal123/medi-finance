import { useState, useMemo } from 'react';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Table from '../../../shared/ui/table';
import { useInvoices } from '../hooks/invoices.queries';

const DailyEntriesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();

  // Fetch journal entries via your hook
  const { data: entries = [], isLoading } = useInvoices({
    journalType: typeFilter !== 'all' ? typeFilter : undefined,
  });

  // Filter entries based on search input
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        entry.descriptionAr?.includes(searchQuery) ||
        entry.journalEntryNumber?.includes(searchQuery);
      return matchesSearch;
    });
  }, [entries, searchQuery]);

  const onAddEntry = () => {
    navigate('/entries/new');
  };

  const columns = [
    {
      header: 'رقم القيد',
      key: 'journalEntryNumber',
    },
    {
      header: 'التاريخ',
      key: 'entryDate',
      type: 'custom',
      render: (row) =>
        new Date(row.entryDate).toLocaleDateString('ar-EG'),
    },
    {
      header: 'النوع',
      key: 'journalType',
      type: 'custom',
      render: (row) => (
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
          {row.journalType === 'Sales'
            ? 'مبيعات'
            : row.journalType === 'Purchase'
            ? 'مشتريات'
            : row.journalType}
        </span>
      ),
    },
    {
      header: 'الوصف',
      key: 'descriptionAr',
    },
    {
      header: 'الفترة المالية',
      key: 'financialPeriodNameAr',
      type: 'custom',
      render: (row) => row.financialPeriodNameAr || '-',
    },
    {
      header: 'مدين',
      key: 'totalDebit',
      type: 'custom',
      render: (row) => (
        <span className="text-green-600 font-medium">{row.totalDebit} ج.م</span>
      ),
    },
    {
      header: 'دائن',
      key: 'totalCredit',
      type: 'custom',
      render: (row) => (
        <span className="text-red-600 font-medium">{row.totalCredit} ج.م</span>
      ),
    },
    {
      header: 'الحالة',
      key: 'status',
      type: 'custom',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.isPosted
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {row.isPosted ? 'مرحّل' : 'غير مرحّل'}
        </span>
      ),
    },
    {
      header: 'الإجراءات',
      key: 'actions',
      type: 'custom',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Link
            to={`/entries/${row.journalEntryID}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="عرض"
          >
            <Eye size={18} />
          </Link>
          <button
            onClick={() => console.log('Delete', row.journalEntryID)}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="حذف"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div>جاري تحميل البيانات...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">القيود اليومية</h1>
          <p className="text-gray-600 text-sm">
            إدارة جميع المصروفات والإيرادات اليومية بسهولة.
          </p>
        </div>

        <button
          onClick={onAddEntry}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={16} />
          إضافة إدخال جديد
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="بحث..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="all">الكل</option>
          <option value="Sales">مبيعات</option>
          <option value="Purchase">مشتريات</option>
          <option value="Invoice">فاتورة</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table columns={columns} data={filteredEntries} />
      </div>
    </div>
  );
};

export default DailyEntriesPage;