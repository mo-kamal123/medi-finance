import { useMemo, useState } from 'react';
import { Download, CreditCard, RotateCcw } from 'lucide-react';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import Pagination from '../../../../../shared/ui/pagination';
import Table from '../../../../../shared/ui/table';
import PageLoader from '../../../../../shared/ui/page-loader';
import { formatCurrency, formatDate } from '../../../../../shared/utils/formatters';
import { useAllBankAccounts } from '../../../../banking/banks/hooks/banks.queries';
import { useChequeStatuses } from '../../../../banking/cheques/hooks/cheques.queries';
import { useBankChequesReport } from '../hooks/bank-cheques.queries';
import { useBankChequesReportExport } from '../hooks/use-bank-cheques-report-export';

const DEFAULT_FILTERS = {
  bankAccountId: '',
  status: '',
  transactionType: '',
  pageNumber: 1,
  pageSize: 10,
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

const statusClass = (statusName) => {
  const normalized = String(statusName || '').trim().toLowerCase();
  if (
    normalized.includes('مرتجع') ||
    normalized.includes('return') ||
    normalized.includes('bounce') ||
    normalized.includes('refus')
  ) {
    return 'bg-red-100 text-red-700';
  }
  if (
    normalized.includes('محصل') ||
    normalized.includes('collect') ||
    normalized === 'collected'
  ) {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (
    normalized.includes('متردد') ||
    normalized.includes('نقد') ||
    normalized.includes('reten')
  ) {
    return 'bg-amber-100 text-amber-700';
  }
  if (
    normalized.includes('استلام') ||
    normalized.includes('receiv') ||
    normalized.includes('تحصيل')
  ) {
    return 'bg-sky-100 text-sky-700';
  }
  return 'bg-gray-100 text-gray-700';
};

const BankChequesReportPage = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { handleExport, isExporting } = useBankChequesReportExport();

  const { data: accountsResponse = [] } = useAllBankAccounts();
  const { data: receiptStatuses = [] } = useChequeStatuses(0);
  const { data: paymentStatuses = [] } = useChequeStatuses(1);

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

  const statusOptions = useMemo(() => {
    const opts = [{ value: '', label: 'كل الحالات' }];
    const seen = new Set();
    [...receiptStatuses, ...paymentStatuses].forEach((s) => {
      const value = s.Name || s.name || String(s.id ?? s.Id ?? s);
      if (seen.has(value)) return;
      seen.add(value);
      const label = s.NameAr || s.nameAr || s.Name || s.name || s;
      opts.push({ value, label });
    });
    return opts;
  }, [receiptStatuses, paymentStatuses]);

  const queryParams = useMemo(
    () => ({
      bankAccountId: filters.bankAccountId,
      status: filters.status,
      transactionType: filters.transactionType,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    }),
    [filters]
  );

  const { data: response, isLoading, isFetching } = useBankChequesReport(
    queryParams
  );

  const cheques = useMemo(() => response?.items ?? [], [response?.items]);
  const totalCount = Number(response?.totalCount) || cheques.length;
  const totalPages = Number(response?.totalPages) || Math.max(
    Math.ceil(totalCount / Math.max(Number(filters.pageSize) || 10, 1)),
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
        header: 'تاريخ الشيك',
        key: 'chequeDate',
        type: 'custom',
        render: (row) => formatDate(row.chequeDate),
      },
      {
        header: 'تاريخ الاستحقاق',
        key: 'dueDate',
        type: 'custom',
        render: (row) => formatDate(row.dueDate),
      },
      {
        header: 'نوع المعاملة',
        key: 'transactionTypeNameAr',
        type: 'custom',
        render: (row) => row.transactionTypeNameAr || row.transactionType || '-',
      },
      {
        header: 'العميل/المورد',
        key: 'partyName',
        type: 'custom',
        render: (row) =>
          row.partyName || row.customerName || row.supplierName || '-',
      },
      {
        header: 'المبلغ',
        key: 'localAmount',
        type: 'custom',
        render: (row) => (
          <span className="inline-flex items-center gap-1 font-semibold text-gray-900" dir="ltr">
            {formatCurrency(row.localAmount ?? row.amount)}
            <span className="text-xs font-normal text-gray-400">
              {row.currencyCode}
            </span>
          </span>
        ),
      },
      { header: 'البنك', key: 'bankName' },
      {
        header: 'سند',
        key: 'cashVoucherID',
        type: 'custom',
        render: (row) => row.cashVoucherID || '-',
      },
      {
        header: 'أيام معلق',
        key: 'daysPending',
        type: 'custom',
        render: (row) => (
          <span
            className={`font-semibold ${
              Number(row.daysPending) > 0 ? 'text-amber-600' : 'text-gray-600'
            }`}
          >
            {Number(row.daysPending) > 0 ? row.daysPending : '-'}
          </span>
        ),
      },
      {
        header: 'الحالة',
        key: 'statusNameAr',
        type: 'custom',
        render: (row) => {
          const label = row.statusNameAr || row.status || '-';
          return (
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusClass(label)}`}
            >
              {label}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقرير الشيكات</h1>
            <p className="mt-1 text-sm text-gray-500">
              عرض شيكات الحسابات البنكية وحالتها وتواريخ استحقاقها
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
            options={statusOptions}
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

      {isLoading ? (
        <PageLoader label="جاري تحميل الشيكات..." />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <Table
              columns={columns}
              data={cheques}
              loading={isFetching}
              emptyMessage={
                filters.bankAccountId
                  ? 'لا توجد شيكات لعرضها'
                  : 'اختر حساباً بنكياً لعرض الشيكات'
              }
            />
          </div>

          {filters.bankAccountId && (
            <Pagination
              currentPage={Number(filters.pageNumber) || 1}
              totalPages={totalPages}
              pageSize={Number(filters.pageSize) || 10}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default BankChequesReportPage;