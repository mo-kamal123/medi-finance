import { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../../../shared/ui/input';
import PageLoader from '../../../shared/ui/page-loader';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import { matchesSearch, paginateItems } from '../../../shared/utils/list-utils';
import { useJournalEntries } from '../hooks/entries.queries';

const DailyEntriesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  const { data: entries = [], isLoading } = useJournalEntries({
    journalType: typeFilter !== 'all' ? typeFilter : undefined,
    pageNumber: 1,
    pageSize: 100,
  });

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) =>
      matchesSearch(
        entry,
        ['descriptionAr', 'journalEntryNumber', 'referenceNumber'],
        searchQuery
      )
    );
  }, [entries, searchQuery]);

  const pagination = useMemo(
    () => paginateItems(filteredEntries, pageNumber, pageSize),
    [filteredEntries, pageNumber, pageSize]
  );

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
        row.entryDate
          ? new Date(row.entryDate).toLocaleDateString('ar-EG')
          : '-',
    },
    {
      header: 'النوع',
      key: 'journalType',
    },
    {
      header: 'الوصف',
      key: 'descriptionAr',
    },
    {
      header: 'الفترة المالية',
      key: 'financialPeriodNameAr',
      type: 'custom',
      render: (row) =>
        row.financialPeriodNameAr || row.financialPeriodNameEn || '-',
    },
    {
      header: 'مدين',
      key: 'totalDebit',
      type: 'custom',
      render: (row) => (
        <span className="font-medium text-green-600">{row.totalDebit} ج.م</span>
      ),
    },
    {
      header: 'دائن',
      key: 'totalCredit',
      type: 'custom',
      render: (row) => (
        <span className="font-medium text-red-600">{row.totalCredit} ج.م</span>
      ),
    },
    {
      header: 'الحالة',
      key: 'status',
      type: 'custom',
      render: (row) => (
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            row.status === 'Posted'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {row.status || '-'}
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
            className="text-blue-600 transition-colors hover:text-blue-800"
            title="عرض"
          >
            <Eye size={18} />
          </Link>
          <button
            onClick={() => navigate(`/entries/${row.journalEntryID}`)}
            className="text-green-600 transition-colors hover:text-green-800"
            title="تعديل"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => console.log('Delete', row.journalEntryID)}
            className="text-red-600 transition-colors hover:text-red-800"
            title="حذف"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <PageLoader label="جاري تحميل القيود اليومية..." />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">القيود اليومية</h1>
          <p className="text-sm text-gray-600">
            إدارة جميع القيود اليومية بسهولة.
          </p>
        </div>

        <button
          onClick={() => navigate('/entries/new')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          إضافة قيد جديد
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-2">
        <FormInput
          label="بحث"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setPageNumber(1);
          }}
          placeholder="ابحث برقم القيد أو الوصف أو المرجع"
        />

        <FormInput
          as="select"
          label="النوع"
          value={typeFilter}
          onChange={(event) => {
            setTypeFilter(event.target.value);
            setPageNumber(1);
          }}
        >
          <option value="all">الكل</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </FormInput>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <Table columns={columns} data={pagination.items} loading={isLoading} />
      </div>

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        onPageChange={setPageNumber}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPageNumber(1);
        }}
      />
    </div>
  );
};

export default DailyEntriesPage;
