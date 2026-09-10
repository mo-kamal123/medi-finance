import { useMemo, useState } from 'react';
import {
  Download,
  FileText,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import DateInput from '../../../../../shared/ui/date-input';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import Pagination from '../../../../../shared/ui/pagination';
import Table from '../../../../../shared/ui/table';
import PageLoader from '../../../../../shared/ui/page-loader';
import { formatCurrency, formatDate } from '../../../../../shared/utils/formatters';
import { useAllBankAccounts } from '../../../../banking/banks/hooks/banks.queries';
import { useBankTransactionsReport } from '../hooks/bank-transactions.queries';
import { useBankTransactionsReportExport } from '../hooks/use-bank-transactions-report-export';

const DEFAULT_FILTERS = {
  bankAccountId: '',
  status: '',
  direction: '',
  fromDate: '',
  toDate: '',
  pageNumber: 1,
  pageSize: 20,
};

const STATUS_STYLES = {
  Draft: 'bg-gray-100 text-gray-700',
  Posted: 'bg-emerald-100 text-emerald-700',
  Reconciled: 'bg-sky-100 text-sky-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  Draft: 'مسودة',
  Posted: 'معتمدة',
  Reconciled: 'مطابقة',
  Cancelled: 'ملغاة',
};

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'مسودة' },
  { value: 'Posted', label: 'معتمدة' },
  { value: 'Reconciled', label: 'مطابقة' },
  { value: 'Cancelled', label: 'ملغاة' },
];

const DIRECTION_OPTIONS = [
  { value: 'In', label: 'وارد' },
  { value: 'Out', label: 'صادر' },
];

const normalizeCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const getDirectionBadge = (direction, directionName) => {
  const label =
    directionName ||
    (direction === 'In' ? 'وارد' : direction === 'Out' ? 'صادر' : '-');
  const isIn = direction === 'In' || directionName === 'وارد';
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        isIn ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {label}
    </span>
  );
};

const getStatusBadge = (status, statusName) => (
  <span
    className={`rounded-full px-3 py-1 text-xs font-medium ${
      STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'
    }`}
  >
    {STATUS_LABELS[status] || statusName || status || '-'}
  </span>
);

const BankTransactionsReportPage = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { handleExport, isExporting } = useBankTransactionsReportExport();

  const { data: accountsResponse = [] } = useAllBankAccounts();

  const bankAccountOptions = useMemo(() => {
    const list = normalizeCollection(accountsResponse);
    return list.map((account) => ({
      value: String(account.bankAccountID || account.id),
      label:
        [
          account.bankNameAr || account.bankName,
          account.accountNumber,
          account.accountNameAr || account.accountNameEn,
        ]
          .filter(Boolean)
          .join(' - ') || String(account.bankAccountID || account.id),
    }));
  }, [accountsResponse]);

  const queryParams = useMemo(
    () => ({
      bankAccountId: filters.bankAccountId,
      status: filters.status,
      direction: filters.direction,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    }),
    [filters]
  );

  const { data: response, isLoading, isFetching } = useBankTransactionsReport(
    queryParams
  );

  const transactions = useMemo(() => response?.data ?? [], [response?.data]);
  const totalCount = Number(response?.totalCount) || transactions.length;
  const totalPages = Number(response?.totalPages) || Math.max(
    Math.ceil(totalCount / Math.max(Number(filters.pageSize) || 20, 1)),
    1
  );

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, pageNumber: 1 }));
  };

  const handleReset = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  const handlePageSizeChange = (value) => {
    setFilters((prev) => ({ ...prev, pageSize: value, pageNumber: 1 }));
  };

  const columns = useMemo(
    () => [
      { header: 'رقم المعاملة', key: 'transactionNumber' },
      { header: 'الحساب البنكي', key: 'bankAccountName' },
      {
        header: 'التاريخ',
        key: 'transactionDate',
        type: 'custom',
        render: (row) => formatDate(row.transactionDate),
      },
      {
        header: 'النوع',
        key: 'transactionTypeName',
        type: 'custom',
        render: (row) => row.transactionTypeName || row.transactionType || '-',
      },
      {
        header: 'الاتجاه',
        key: 'directionName',
        type: 'custom',
        render: (row) => getDirectionBadge(row.direction, row.directionName),
      },
      {
        header: 'المبلغ',
        key: 'localAmount',
        type: 'custom',
        render: (row) => {
          const isOut =
            row.direction === 'Out' || Number(row.localAmount ?? row.amount) < 0;
          return (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                isOut ? 'text-red-600' : 'text-emerald-600'
              }`}
              dir="ltr"
            >
              {isOut ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownLeft size={14} />
              )}
              {formatCurrency(Math.abs(Number(row.localAmount ?? row.amount)))}
              <span className="text-xs font-normal text-gray-400">
                {row.currencyName}
              </span>
            </span>
          );
        },
      },
      { header: 'البيان', key: 'descriptionAr' },
      {
        header: 'المرجع',
        key: 'referenceNumber',
        type: 'custom',
        render: (row) => row.referenceNumber || '-',
      },
      {
        header: 'المصدر',
        key: 'sourceTypeName',
        type: 'custom',
        render: (row) => row.sourceTypeName || row.sourceType || '-',
      },
      {
        header: 'رقم الشيك',
        key: 'chequeNumber',
        type: 'custom',
        render: (row) => row.chequeNumber || '-',
      },
      {
        header: 'الحالة',
        key: 'statusName',
        type: 'custom',
        render: (row) => getStatusBadge(row.status, row.statusName),
      },
      {
        header: 'مطابق',
        key: 'isReconciled',
        type: 'custom',
        render: (row) => (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              row.isReconciled
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {row.isReconciled ? 'نعم' : 'لا'}
          </span>
        ),
      },
      {
        header: 'القيد اليومي',
        key: 'journalEntryNumber',
        type: 'custom',
        render: (row) => row.journalEntryNumber || '-',
      },
    ],
    []
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">حركات البنوك</h1>
            <p className="mt-1 text-sm text-gray-500">
              عرض جميع الحركات البنكية للحسابات مع الحالة والمصدر والمرجع
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleExport(queryParams)}
          disabled={isExporting || !filters.bankAccountId}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Download size={16} />
          {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
        </button>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SearchableSelect
            label="الحساب البنكي"
            value={filters.bankAccountId || ''}
            onChange={(event) => handleChange('bankAccountId', event.target.value)}
            placeholder="اختر الحساب البنكي..."
            options={bankAccountOptions}
          />

          <SearchableSelect
            label="الحالة"
            value={filters.status || ''}
            onChange={(event) => handleChange('status', event.target.value)}
            placeholder="كل الحالات"
            options={STATUS_OPTIONS}
          />

          <SearchableSelect
            label="الاتجاه"
            value={filters.direction || ''}
            onChange={(event) => handleChange('direction', event.target.value)}
            placeholder="الكل"
            options={DIRECTION_OPTIONS}
          />

          <DateInput
            label="من تاريخ"
            value={filters.fromDate || ''}
            onChange={(event) => handleChange('fromDate', event.target.value)}
          />

          <DateInput
            label="إلى تاريخ"
            value={filters.toDate || ''}
            onChange={(event) => handleChange('toDate', event.target.value)}
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            <RotateCcw size={16} />
            مسح الفلاتر
          </button>
        </div>
      </div>

      {isLoading ? (
        <PageLoader label="جاري تحميل حركات البنوك..." />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <Table
              columns={columns}
              data={transactions}
              loading={isFetching}
              emptyMessage={
                filters.bankAccountId
                  ? 'لا توجد حركات لعرضها'
                  : 'اختر حساباً بنكياً لعرض الحركات'
              }
            />
          </div>

          {filters.bankAccountId && (
            <Pagination
              currentPage={Number(filters.pageNumber) || 1}
              totalPages={totalPages}
              pageSize={Number(filters.pageSize) || 20}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default BankTransactionsReportPage;