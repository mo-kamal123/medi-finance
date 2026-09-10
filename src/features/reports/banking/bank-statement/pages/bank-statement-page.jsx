import { useMemo, useState } from 'react';
import { Download, FileText, RotateCcw } from 'lucide-react';
import DateInput from '../../../../../shared/ui/date-input';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import Pagination from '../../../../../shared/ui/pagination';
import Table from '../../../../../shared/ui/table';
import PageLoader from '../../../../../shared/ui/page-loader';
import { formatCurrency, formatDate } from '../../../../../shared/utils/formatters';
import { useAllBankAccounts } from '../../../../banking/banks/hooks/banks.queries';
import { useBankStatement } from '../hooks/bank-statement.queries';
import { useBankStatementExport } from '../hooks/use-bank-statement-export';

const DEFAULT_FILTERS = {
  bankAccountId: '',
  fromDate: '',
  toDate: '',
  pageNumber: 1,
  pageSize: 50,
};

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

const BankStatementPage = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { handleExport, isExporting } = useBankStatementExport();

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
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    }),
    [filters]
  );

  const { data: response, isLoading, isFetching } = useBankStatement(queryParams);

  const transactions = useMemo(() => response?.data ?? [], [response?.data]);
  const summary = useMemo(() => response?.summary ?? null, [response?.summary]);
  const totalCount = Number(response?.totalCount) || transactions.length;
  const totalPages = Math.max(
    Math.ceil(totalCount / Math.max(Number(filters.pageSize) || 50, 1)),
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
      { header: 'رقم العملية', key: 'transactionID' },
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
        render: (row) =>
          getDirectionBadge(row.direction, row.directionName),
      },
      {
        header: 'المرجع',
        key: 'referenceNumber',
        type: 'custom',
        render: (row) => row.referenceNumber || '-',
      },
      { header: 'البيان', key: 'descriptionAr' },
      {
        header: 'مدين',
        key: 'debit',
        type: 'custom',
        render: (row) =>
          Number(row.debit) ? (
            <span className="font-semibold text-emerald-700" dir="ltr">
              {formatCurrency(row.debit)}
            </span>
          ) : (
            '-'
          ),
      },
      {
        header: 'دائن',
        key: 'credit',
        type: 'custom',
        render: (row) =>
          Number(row.credit) ? (
            <span className="font-semibold text-red-600" dir="ltr">
              {formatCurrency(row.credit)}
            </span>
          ) : (
            '-'
          ),
      },
      {
        header: 'الرصيد الجاري',
        key: 'runningBalance',
        type: 'custom',
        render: (row) => (
          <span className="font-semibold text-gray-900" dir="ltr">
            {formatCurrency(row.runningBalance)}
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
            <h1 className="text-2xl font-bold text-gray-900">كشف حساب بنك</h1>
            <p className="mt-1 text-sm text-gray-500">
              عرض حركات الحساب البنكي والرصيد الجاري خلال فترة محددة
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SearchableSelect
            label="الحساب البنكي"
            value={filters.bankAccountId || ''}
            onChange={(event) => handleChange('bankAccountId', event.target.value)}
            placeholder="اختر الحساب البنكي..."
            options={bankAccountOptions}
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

      {summary && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="text-sm text-gray-500">رصيد افتتاحي</div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {formatCurrency(Number(summary.openingBalance) || 0)}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="text-sm text-gray-500">إجمالي الوارد</div>
              <div className="mt-2 text-2xl font-bold text-emerald-700">
                {formatCurrency(Number(summary.totalIncoming) || 0)}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="text-sm text-gray-500">إجمالي الصادر</div>
              <div className="mt-2 text-2xl font-bold text-red-600">
                {formatCurrency(Number(summary.totalOutgoing) || 0)}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="text-sm text-gray-500">الرصيد الختامي</div>
              <div className="mt-2 text-2xl font-bold text-primary">
                {formatCurrency(Number(summary.closingBalance) || 0)}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="font-semibold text-gray-900">
                {summary.bankNameAr || '-'}
              </span>
              <span className="text-gray-500">
                رقم الحساب: <span dir="ltr">{summary.accountNumber || '-'}</span>
              </span>
              <span className="text-gray-500">
                العملة: <span dir="ltr">{summary.currencyCode || '-'}</span>
              </span>
            </div>
          </div>
        </>
      )}

      {isLoading ? (
        <PageLoader label="جاري تحميل كشف الحساب..." />
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
                  : 'اختر حساباً بنكياً لعرض الكشف'
              }
            />
          </div>

          {filters.bankAccountId && (
            <Pagination
              currentPage={Number(filters.pageNumber) || 1}
              totalPages={totalPages}
              pageSize={Number(filters.pageSize) || 50}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default BankStatementPage;