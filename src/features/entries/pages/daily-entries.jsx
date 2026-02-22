import { useState, useMemo } from "react";
import { Eye, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import Table from '../../../shared/ui/table';

const dailyEntriesData = [
  {
    journalEntryID: 12,
    journalEntryNumber: 'erwe',
    entryDate: '2022-01-01T00:00:00',
    journalType: '1',
    descriptionAr: 'sdf',
    descriptionEn: 'sdfs',
    referenceNumber: '23423',
    financialPeriodID: 1,
    totalDebit: 32,
    totalCredit: 232,
    isPosted: true,
    postedDate: '2002-01-01T00:00:00',
    isReversed: true,
    reversalEntryID: 1,
    status: '1',
    createdBy: 'msaad',
    createdAt: '2026-02-17T11:31:37.96',
    modifiedBy: null,
    modifiedAt: null,
    financialPeriodNameAr: null,
    financialPeriodNameEn: null,
    reversalEntryNumber: null,
    details: [],
  },
];

const DailyEntriesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();

  const filteredEntries = useMemo(() => {
    return dailyEntriesData.filter((entry) => {
      const matchesSearch =
        entry.descriptionAr?.includes(searchQuery) ||
        entry.journalEntryNumber?.includes(searchQuery);

      return matchesSearch;
    });
  }, [searchQuery]);

  const onAddEntry = () => {
    navigate('/entries/new');
  };

  // ✅ تعريف الأعمدة
  const columns = [
    {
      header: 'رقم القيد',
      key: 'journalEntryNumber',
    },
    {
      header: 'التاريخ',
      key: 'entryDate',
      type: 'custom',
      render: (row) => new Date(row.entryDate).toLocaleDateString('ar-EG'),
    },
    {
      header: 'النوع',
      key: 'journalType',
      type: 'custom',
      render: (row) => (
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
          {row.journalType === '1' ? 'قيد يومية' : 'نوع آخر'}
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
        <span className="text-green-600 font-medium">{row.totalDebit} ر.س</span>
      ),
    },
    {
      header: 'دائن',
      key: 'totalCredit',
      type: 'custom',
      render: (row) => (
        <span className="text-red-600 font-medium">{row.totalCredit} ر.س</span>
      ),
    },
    {
      header: 'الحالة',
      key: 'isPosted',
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
    
          {/* View */}
          <Link
            to={`/entries/${row.journalEntryID}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="عرض"
          >
            <Eye size={18} />
          </Link>
    
          {/* Delete */}
          <button
            onClick={() => console.log('Delete', row.journalEntryID)}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="حذف"
          >
            <Trash2 size={18} />
          </button>
    
        </div>
      ),
    }
    
  ];

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
          <option value="income">إيرادات</option>
          <option value="expense">مصروفات</option>
        </select>
      </div>

      {/* ✅ Reusable Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table columns={columns} data={filteredEntries} />
      </div>
    </div>
  );
};

export default DailyEntriesPage;
