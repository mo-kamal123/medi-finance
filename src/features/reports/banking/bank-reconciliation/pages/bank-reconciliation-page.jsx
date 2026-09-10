import { useMemo, useState } from 'react';
import { Download, FileCheck, RotateCcw } from 'lucide-react';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import Pagination from '../../../../../shared/ui/pagination';
import Table from '../../../../../shared/ui/table';
import PageLoader from '../../../../../shared/ui/page-loader';
import { formatCurrency, formatDate } from '../../../../../shared/utils/formatters';
import { useAllBankAccounts } from '../../../../banking/banks/hooks/banks.queries';
import { useBankReconciliation } from '../hooks/bank-reconciliation.queries';
import { useBankReconciliationExport } from '../hooks/use-bank-reconciliation-export';

const DEFAULT_FILTERS = {
  bankAccountID: '',
  pageNumber: 1,
  pageSize: 20,
};

const normalizeCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const getReconciledBadge = (isReconciled) => (
  <span
    className={`rounded-full px-3 py-1 text-xs font-medium ${
      isReconciled
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-red-100 text-red-700'
    }`}
  >
    {isReconciled ? 'مطابق' : 'غير مطابق'}
  </span>
);

const BankReconciliationPage = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { handleExport, isExporting } = useBankReconciliationExport();

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
      bankAccountID: filters.bankAccountID,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    }),
    [filters]
  );

  const { data: response, isLoading, isFetching } = useBankReconciliation(
    queryParams
  );

  const records = useMemo(() => response?.data ?? [], [response?.data]);
  const totalCount = Number(response?.totalCount) || records.length;
  const totalPages = Math.max(
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
      { header: 'الحساب', key: 'accountNameAr' },
      {
        header: 'رقم الحساب',
        key: 'accountNumber',
        type: 'custom',
        render: (row) => (
          <span dir="ltr" className="font-mono text-sm">
            {row.accountNumber || '-'}
          </span>
        ),
      },
      { header: 'البنك', key: 'bankNameAr' },
      {
        header: 'تاريخ الكشف',
        key: 'statementDate',
        type: 'custom',
        render: (row) => formatDate(row.statementDate),
      },
      {
        header: 'رصيد كشف البنك',
        key: 'statementBalance',
        type: 'custom',
        render: (row) => (
          <span className="font-semibold text-gray-900" dir="ltr">
            {formatCurrency(row.statementBalance)}
          </span>
        ),
      },
      {
        header: 'رصيد الدفاتر',
        key: 'bookBalance',
        type: 'custom',
        render: (row) => (
          <span className="font-semibold text-gray-900" dir="ltr">
            {formatCurrency(row.bookBalance)}
          </span>
        ),
      },
      {
        header: 'الفرق',
        key: 'difference',
        type: 'custom',
        render: (row) => (
          <span
            className={`font-bold ${
              Number(row.difference)
                ? 'text-red-600'
                : 'text-emerald-700'
            }`}
            dir="ltr"
          >
            {formatCurrency(row.difference)}
          </span>
        ),
      },
      {
        header: 'شيكات غير مدفوعة',
        key: 'outstandingCheques',
        type: 'custom',
        render: (row) => formatCurrency(row.outstandingCheques),
      },
      {
        header: 'إيداعات معلقة',
        key: 'outstandingDeposits',
        type: 'custom',
        render: (row) => formatCurrency(row.outstandingDeposits),
      },
      {
        header: 'تحويلات معلقة',
        key: 'pendingTransfers',
        type: 'custom',
        render: (row) => (
          <span dir="ltr">
            {Number(row.pendingTransfers)
              ? formatCurrency(row.pendingTransfers)
              : '-'}
          </span>
        ),
      },
      {
        header: 'الرسوم',
        key: 'chargesTotal',
        type: 'custom',
        render: (row) => (
          <span dir="ltr">
            {Number(row.chargesTotal) ? formatCurrency(row.chargesTotal) : '-'}
          </span>
        ),
      },
      {
        header: 'الرصيد المطابق',
        key: 'reconciledBalance',
        type: 'custom',
        render: (row) => (
          <span className="font-bold text-primary" dir="ltr">
            {formatCurrency(row.reconciledBalance)}
          </span>
        ),
      },
      {
        header: 'الحالة',
        key: 'isReconciled',
        type: 'custom',
        render: (row) => getReconciledBadge(row.isReconciled),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مطابقة البنوك</h1>
            <p className="mt-1 text-sm text-gray-500">
              عرض كشوف مطابقة البنوك ومقارنة رصيد كشف البنك مع رصيد الدفاتر
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleExport(queryParams)}
          disabled={isExporting || !filters.bankAccountID}
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
            value={filters.bankAccountID || ''}
            onChange={(event) => handleChange('bankAccountID', event.target.value)}
            placeholder="اختر الحساب البنكي..."
            options={bankAccountOptions}
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
        <PageLoader label="جاري تحميل كشوف المطابقة..." />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <Table
              columns={columns}
              data={records}
              loading={isFetching}
              emptyMessage={
                filters.bankAccountID
                  ? 'لا توجد كشوف مطابقة لعرضها'
                  : 'اختر حساباً بنكياً لعرض كشف المطابقة'
              }
            />
          </div>

          {filters.bankAccountID && (
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

export default BankReconciliationPage;