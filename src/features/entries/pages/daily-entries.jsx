import { useMemo, useState } from 'react';
import { CheckCircle2, Eye, Plus, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../../../shared/ui/input';
import PageLoader from '../../../shared/ui/page-loader';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import { toast } from '../../../shared/lib/toast';
import { matchesSearch, paginateItems } from '../../../shared/utils/list-utils';
import {
  usePostJournalEntry,
  useReverseJournalEntry,
} from '../hooks/entries.mutations';
import { useJournalEntries } from '../hooks/entries.queries';

const getStatusMeta = (status) => {
  if (status === 'Posted') {
    return { badgeClass: 'bg-green-100 text-green-700', label: status };
  }

  if (String(status).toLowerCase().includes('reverse')) {
    return { badgeClass: 'bg-red-100 text-red-700', label: status };
  }

  return { badgeClass: 'bg-yellow-100 text-yellow-700', label: status || '-' };
};

const DailyEntriesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const postMutation = usePostJournalEntry();
  const reverseMutation = useReverseJournalEntry();

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

  const handlePostEntry = (entryId, status) => {
    if (status === 'Posted') {
      toast.info('تم ترحيل هذا القيد بالفعل');
      return;
    }

    if (String(status).toLowerCase().includes('reverse')) {
      toast.info('لا يمكن ترحيل قيد تم عكسه');
      return;
    }

    postMutation.mutate({ id: entryId, postedBy: 'ms' });
  };

  const handleReverseEntry = (entryId, status) => {
    if (String(status).toLowerCase().includes('reverse')) {
      toast.info('تم عكس هذا القيد بالفعل');
      return;
    }

    if (status !== 'Posted') {
      toast.info('يجب ترحيل القيد أولاً قبل إجراء العكس');
      return;
    }

    reverseMutation.mutate({ id: entryId, reversedBy: 'ms' });
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
        row.entryDate
          ? new Date(row.entryDate).toLocaleDateString('ar-EG')
          : '-',
    },
    {
      header: 'النوع',
      key: 'journalType',
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
      header: 'الحالة',
      key: 'status',
      type: 'custom',
      render: (row) => {
        const statusMeta = getStatusMeta(row.status);

        return (
          <span
            className={`rounded-full px-2 py-1 text-xs ${statusMeta.badgeClass}`}
          >
            {statusMeta.label}
          </span>
        );
      },
    },
    {
      header: 'الإجراءات',
      key: 'actions',
      type: 'custom',
      render: (row) => {
        const isPosting =
          postMutation.isPending &&
          postMutation.variables?.id === row.journalEntryID;
        const isReversing =
          reverseMutation.isPending &&
          reverseMutation.variables?.id === row.journalEntryID;
        const isReversed = String(row.status).toLowerCase().includes('reverse');

        return (
          <div className="flex items-center justify-center gap-3">
            <Link
              to={`/entries/${row.journalEntryID}`}
              className="text-blue-600 transition-colors hover:text-blue-800"
              title="عرض"
            >
              <Eye size={18} />
            </Link>

            <button
              type="button"
              onClick={() => handlePostEntry(row.journalEntryID, row.status)}
              disabled={
                isPosting ||
                isReversing ||
                row.status === 'Posted' ||
                isReversed
              }
              className="text-emerald-600 transition-colors hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
              title="ترحيل"
            >
              <CheckCircle2 size={18} />
            </button>

            <button
              type="button"
              onClick={() => handleReverseEntry(row.journalEntryID, row.status)}
              disabled={
                isPosting ||
                isReversing ||
                row.status !== 'Posted' ||
                isReversed
              }
              className="text-amber-600 transition-colors hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-40"
              title="عكس القيد"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        );
      },
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
