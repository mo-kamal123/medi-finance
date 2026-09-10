import { useMemo, useState } from 'react';
import { Download, FileClock, RotateCcw } from 'lucide-react';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import Pagination from '../../../../../shared/ui/pagination';
import Table from '../../../../../shared/ui/table';
import PageLoader from '../../../../../shared/ui/page-loader';
import { formatCurrency, formatDate, formatNumber } from '../../../../../shared/utils/formatters';
import { useAllBankAccounts } from '../../../../banking/banks/hooks/banks.queries';
import { useOutstandingCheques } from '../hooks/outstanding-cheques.queries';
import { useOutstandingChequesExport } from '../hooks/use-outstanding-cheques-export';

const DEFAULT_FILTERS = {
  bankAccountID: '',
  transactionType: '',
  pageNumber: 1,
  pageSize: 50,
};

const TRANSACTION_TYPE_OPTIONS = [
  { value: '', label: 'كل المعاملات' },
  { value: 'RECEIPT', label: 'قبض' },
  { value: 'PAYMENT', label: 'صرف' },
];

const normalizeCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const OutstandingChequesPage = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { handleExport, isExporting } = useOutstandingChequesExport();

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
      transactionType: filters.transactionType,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    }),
    [filters]
  );

  const { data: response, isLoading, isFetching } = useOutstandingCheques(
    queryParams
  );

  const cheques = useMemo(() => response?.data ?? [], [response?.data]);
  const incomingCount = Number(response?.incomingCount) || 0;
  const incomingAmount = Number(response?.incomingAmount) || 0;
  const outgoingCount = Number(response?.outgoingCount) || 0;
  const outgoingAmount = Number(response?.outgoingAmount) || 0;
  const totalCount = Number(response?.totalCount) || cheques.length;
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
      { header: 'رقم الشيك', key: 'chequeNumber' },
      {
        header: 'نوع المعاملة',
        key: 'transactionTypeNameAr',
        type: 'custom',
        render: (row) => row.transactionTypeNameAr || row.transactionType || '-',
      },
      { header: 'العميل/المورد', key: 'partyName' },
      { header: 'البنك', key: 'bankNameAr' },
      {
        header: 'المبلغ',
        key: 'amount',
        type: 'custom',
        render: (row) => (
          <span className="inline-flex items-center gap-1 font-semibold text-gray-900" dir="ltr">
            {formatCurrency(row.amount)}
            <span className="text-xs font-normal text-gray-400">
              {row.currencyCode}
            </span>
          </span>
        ),
      },
      {
        header: 'تاريخ الاستحقاق',
        key: 'dueDate',
        type: 'custom',
        render: (row) => formatDate(row.dueDate),
      },
      {
        header: 'أيام معلق',
        key: 'daysOutstanding',
        type: 'custom',
        render: (row) => (
          <span
            className={`font-semibold ${
              Number(row.daysOutstanding) > 0
                ? 'text-amber-600'
                : 'text-gray-600'
            }`}
          >
            {Number(row.daysOutstanding) > 0 ? row.daysOutstanding : '-'}
          </span>
        ),
      },
      {
        header: 'الحالة',
        key: 'statusNameAr',
        type: 'custom',
        render: (row) => (
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
            {row.statusNameAr || '-'}
          </span>
        ),
      },
      {
        header: 'سند',
        key: 'voucherID',
        type: 'custom',
        render: (row) => row.voucherID || '-',
      },
      {
        header: 'القيد اليومي',
        key: 'journalEntryID',
        type: 'custom',
        render: (row) => row.journalEntryID || '-',
      },
    ],
    []
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileClock size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الشيكات المعلقة</h1>
            <p className="mt-1 text-sm text-gray-500">
              عرض الشيكات غير المسددة بالحسابات البنكية وعدد أيام التعليق
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

          <SearchableSelect
            label="نوع المعاملة"
            value={filters.transactionType || ''}
            onChange={(event) => handleChange('transactionType', event.target.value)}
            placeholder="كل المعاملات"
            options={TRANSACTION_TYPE_OPTIONS}
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

      {filters.bankAccountID && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">شيكات قبض معلقة</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {formatNumber(incomingCount)}
            </div>
            <div className="mt-1 text-sm font-semibold text-emerald-700">
              {formatCurrency(incomingAmount)}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">شيكات صرف معلقة</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {formatNumber(outgoingCount)}
            </div>
            <div className="mt-1 text-sm font-semibold text-red-600">
              {formatCurrency(outgoingAmount)}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <PageLoader label="جاري تحميل الشيكات المعلقة..." />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <Table
              columns={columns}
              data={cheques}
              loading={isFetching}
              emptyMessage={
                filters.bankAccountID
                  ? 'لا توجد شيكات معلقة'
                  : 'اختر حساباً بنكياً لعرض الشيكات المعلقة'
              }
            />
          </div>

          {filters.bankAccountID && (
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

export default OutstandingChequesPage;