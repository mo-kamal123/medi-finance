import { useMemo, useState } from 'react';
import { CheckCircle2, Eye, Plus, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageLoader from '../../../../shared/ui/page-loader';
import Pagination from '../../../../shared/ui/pagination';
import Table from '../../../../shared/ui/table';
import { toast } from '../../../../shared/lib/toast';
import { formatCurrency, formatDate } from '../../../../shared/utils/formatters';
import JournalEntryFilters from '../components/journal-entry-filters';
import {
  usePostJournalEntry,
  useReverseJournalEntry,
} from '../hooks/entries.mutations';
import { useJournalEntries } from '../hooks/entries.queries';
import { DEFAULT_JOURNAL_ENTRY_FILTERS } from '../utils/journal-entry-filters.utils';
import { buildJournalEntryQueryParams } from '../utils/journal-entry-filters.utils';
import {
  getJournalEntryDescription,
  getJournalEntryStatusMeta,
  getJournalTypeLabel,
  isJournalEntryPosted,
  isJournalEntryReversed,
} from '../utils/journal-entry.utils';

const DailyEntriesPage = () => {
  const [filters, setFilters] = useState(DEFAULT_JOURNAL_ENTRY_FILTERS);
  const navigate = useNavigate();
  const postMutation = usePostJournalEntry();
  const reverseMutation = useReverseJournalEntry();

  const queryParams = useMemo(
    () => buildJournalEntryQueryParams(filters),
    [filters]
  );

  const { data, isLoading } = useJournalEntries(queryParams);

  const entries = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handlePostEntry = (entry) => {
    if (isJournalEntryPosted(entry)) {
      toast.info('تم ترحيل هذا القيد بالفعل');
      return;
    }

    if (isJournalEntryReversed(entry)) {
      toast.info('لا يمكن ترحيل قيد تم عكسه');
      return;
    }

    postMutation.mutate({ id: entry.journalEntryID, postedBy: 'ms' });
  };

  const handleReverseEntry = (entry) => {
    if (isJournalEntryReversed(entry)) {
      toast.info('تم عكس هذا القيد بالفعل');
      return;
    }

    if (!isJournalEntryPosted(entry)) {
      toast.info('يجب ترحيل القيد أولاً قبل إجراء العكس');
      return;
    }

    reverseMutation.mutate({ id: entry.journalEntryID, reversedBy: 'ms' });
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
      render: (row) => formatDate(row.entryDate),
    },
    {
      header: 'النوع',
      key: 'journalType',
      type: 'custom',
      render: (row) => getJournalTypeLabel(row.journalType),
    },
    {
      header: 'مدين',
      key: 'totalDebit',
      type: 'custom',
      render: (row) => (
        <span className="font-medium text-green-600">
          {formatCurrency(row.totalDebit)}
        </span>
      ),
    },
    {
      header: 'دائن',
      key: 'totalCredit',
      type: 'custom',
      render: (row) => (
        <span className="font-medium text-red-600">
          {formatCurrency(row.totalCredit)}
        </span>
      ),
    },
    {
      header: 'الوصف',
      key: 'description',
      type: 'custom',
      render: (row) => getJournalEntryDescription(row),
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
      key: 'statusName',
      type: 'custom',
      render: (row) => {
        const statusMeta = getJournalEntryStatusMeta(row);

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
        const isPosted = isJournalEntryPosted(row);
        const isReversed = isJournalEntryReversed(row);

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
              onClick={() => handlePostEntry(row)}
              disabled={isPosting || isReversing || isPosted || isReversed}
              className="text-emerald-600 transition-colors hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
              title="ترحيل"
            >
              <CheckCircle2 size={18} />
            </button>

            <button
              type="button"
              onClick={() => handleReverseEntry(row)}
              disabled={isPosting || isReversing || !isPosted || isReversed}
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

  if (isLoading && !entries.length) {
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

      <JournalEntryFilters filters={filters} setFilters={setFilters} />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <Table columns={columns} data={entries} loading={isLoading} onRowClick={(row) => navigate(`/entries/${row.journalEntryID}`)} />
      </div>

      <Pagination
        currentPage={filters.pageNumber}
        totalPages={totalPages}
        pageSize={filters.pageSize}
        onPageChange={(page) =>
          setFilters((prev) => ({ ...prev, pageNumber: page }))
        }
        onPageSizeChange={(value) =>
          setFilters((prev) => ({
            ...prev,
            pageSize: value,
            pageNumber: 1,
          }))
        }
      />
    </div>
  );
};

export default DailyEntriesPage;
