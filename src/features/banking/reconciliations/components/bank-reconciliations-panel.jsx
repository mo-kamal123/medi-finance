import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Search } from 'lucide-react';
import Pagination from '../../../../shared/ui/pagination';
import Table from '../../../../shared/ui/table';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import DateInput from '../../../../shared/ui/date-input';
import FormInput from '../../../../shared/ui/input';
import FilterBar from '../../../../shared/ui/filter-bar';
import { formatCurrency, formatDate } from '../../../../shared/utils/formatters';
import { getErrorMessage } from '../../../../shared/lib/toast';
import { useBankAccounts } from '../../banks/hooks/banks.queries';
import { useBankReconciliations } from '../hooks/bank-reconciliations.queries';

const EMPTY_FILTERS = {
  bankAccountId: '',
  status: '',
  fromDate: '',
  toDate: '',
  searchTerm: '',
};

const STATUS_OPTIONS = [
  { value: 'InProgress', label: 'جارية' },
  { value: 'Reconciled', label: 'معتمدة' },
  { value: 'Draft', label: 'مسودة' },
  { value: 'Matched', label: 'مطابق' },
  { value: 'Cancelled', label: 'ملغي' },
];

const getRecId = (row) =>
  row?.id ?? row?.reconciliationId ?? row?.reconciliationID;

const getRecStatus = (row) => row?.status ?? row?.statusCode ?? '';

const getRecStatusName = (row) => row?.statusName ?? row?.status ?? '-';

const STATUS_STYLES = {
  Matched: 'bg-emerald-100 text-emerald-700',
  Reconciled: 'bg-sky-100 text-sky-700',
  InProgress: 'bg-amber-100 text-amber-700',
  Draft: 'bg-gray-100 text-gray-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const BankReconciliationsPanel = ({ bankId }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: accountsRes = [] } = useBankAccounts(bankId);

  const accounts = useMemo(
    () => (Array.isArray(accountsRes) ? accountsRes : []),
    [accountsRes]
  );

  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        value: String(account.bankAccountID ?? account.id),
        label:
          account.accountNumberWithBranch ||
          [account.accountNumber, account.accountNameAr].filter(Boolean).join(' - ') ||
          String(account.bankAccountID ?? account.id),
      })),
    [accounts]
  );

  const accountIdsOfBank = useMemo(
    () =>
      new Set(
        accounts.map((a) => String(a.bankAccountID ?? a.id).toLowerCase())
      ),
    [accounts]
  );

  const queryParams = useMemo(() => {
    const params = { pageNumber, pageSize };
    if (bankId) params.bankId = bankId;
    if (filters.bankAccountId) params.bankAccountId = filters.bankAccountId;
    if (filters.status) params.status = filters.status;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    if (filters.searchTerm?.trim()) params.searchTerm = filters.searchTerm.trim();
    return params;
  }, [bankId, filters, pageNumber, pageSize]);

  const { data, isLoading, isFetching, isError, error } =
    useBankReconciliations(queryParams);

  const allItems = useMemo(() => data?.items ?? [], [data]);
  // Client-side guard: keep only reconciliations of this bank's accounts
  // (in case API ignores bankId filter)
  const reconciliations = useMemo(() => {
    if (!bankId || accountIdsOfBank.size === 0) return allItems;
    return allItems.filter((row) => {
      const accId = row?.bankAccountId ?? row?.bankAccountID;
      if (accId === null || accId === undefined) return true;
      return accountIdsOfBank.has(String(accId).toLowerCase());
    });
  }, [allItems, accountIdsOfBank, bankId]);

  const totalCount = data?.totalCount ?? reconciliations.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v !== '').length,
    [filters]
  );

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPageNumber(1);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setPageNumber(1);
  };

  const columns = useMemo(
    () => [
      {
        header: 'رقم التسوية',
        key: 'reconciliationNumber',
        type: 'custom',
        render: (row) => (
          <span className="font-medium text-primary">
            {row?.reconciliationNumber ?? getRecId(row)}
          </span>
        ),
      },
      {
        header: 'الحساب',
        key: 'accountNameAr',
        type: 'custom',
        render: (row) =>
          row?.bankAccountName ??
          row?.accountNameAr ??
          row?.accountName ??
          [row?.bankNameAr, row?.accountNumber].filter(Boolean).join(' - ') ??
          '-',
      },
      {
        header: 'الفترة',
        key: 'fromDate',
        type: 'custom',
        render: (row) => (
          <span className="whitespace-nowrap">
            {formatDate(row?.fromDate)} - {formatDate(row?.toDate)}
          </span>
        ),
      },
      {
        header: 'تاريخ الكشف',
        key: 'statementDate',
        type: 'custom',
        render: (row) => formatDate(row?.statementDate),
      },
      {
        header: 'رصيد الكشف النهائي',
        key: 'bankStatementClosingBalance',
        type: 'custom',
        render: (row) => (
          <span className="font-semibold" dir="ltr">
            {formatCurrency(row?.bankStatementClosingBalance ?? 0)}
          </span>
        ),
      },
      {
        header: 'الفرق',
        key: 'difference',
        type: 'custom',
        render: (row) => {
          const diff = Number(row?.difference ?? 0);
          return (
            <span
              className={`font-semibold ${
                diff !== 0 ? 'text-red-600' : 'text-emerald-600'
              }`}
              dir="ltr"
            >
              {formatCurrency(diff)}
            </span>
          );
        },
      },
      {
        header: 'الحالة',
        key: 'status',
        type: 'custom',
        render: (row) => {
          const status = getRecStatus(row);
          return (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {getRecStatusName(row)}
            </span>
          );
        },
      },
      {
        header: 'عرض',
        key: 'actions',
        type: 'custom',
        render: (row) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/reconciliations/${getRecId(row)}`);
            }}
            title="عرض التفاصيل"
            className="rounded-lg p-2 text-primary hover:bg-primary/10"
          >
            <Eye size={16} />
          </button>
        ),
      },
    ],
    [navigate]
  );

  const primaryFilters = [
    <FormInput
      key="search"
      label="بحث"
      icon={Search}
      value={filters.searchTerm}
      onChange={(event) => handleChange('searchTerm', event.target.value)}
      placeholder="ابحث برقم التسوية أو الملاحظات"
    />,
    <SearchableSelect
      key="bankAccountId"
      label="الحساب البنكي"
      value={filters.bankAccountId || ''}
      onChange={(event) => handleChange('bankAccountId', event.target.value)}
      options={accountOptions}
      placeholder="كل الحسابات"
    />,
    <SearchableSelect
      key="status"
      label="الحالة"
      value={filters.status || ''}
      onChange={(event) => handleChange('status', event.target.value)}
      options={STATUS_OPTIONS}
      placeholder="كل الحالات"
    />,
  ];

  const extraFilters = [
    <DateInput
      key="fromDate"
      label="من تاريخ"
      value={filters.fromDate || ''}
      onChange={(event) => handleChange('fromDate', event.target.value)}
    />,
    <DateInput
      key="toDate"
      label="إلى تاريخ"
      value={filters.toDate || ''}
      onChange={(event) => handleChange('toDate', event.target.value)}
    />,
  ];

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">تسويات البنك</h2>
          <p className="mt-1 text-sm text-gray-500">
            {totalCount ? `إجمالي التسويات (${totalCount})` : 'لا توجد تسويات بعد'}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            navigate(
              bankId
                ? `/reconciliations/new?bankId=${bankId}`
                : '/reconciliations/new'
            )
          }
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus size={16} />
          تسوية جديدة
        </button>
      </div>

      <div className="mb-4">
        <FilterBar
          primaryFilters={primaryFilters}
          extraFilters={extraFilters}
          onReset={handleReset}
          activeCount={activeFilterCount}
          extraCount={
            [filters.fromDate, filters.toDate].filter((v) => v !== '').length
          }
        />
      </div>

      {isError ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {getErrorMessage(error, 'تعذر تحميل التسويات')}
        </div>
      ) : null}

      <div className="mb-4 overflow-hidden rounded-xl">
        <Table
          columns={columns}
          data={reconciliations}
          loading={isLoading || isFetching}
          onRowClick={(row) => navigate(`/reconciliations/${getRecId(row)}`)}
          emptyMessage="لا توجد تسويات مطابقة — أنشئ تسوية جديدة لبدء المطابقة"
        />
      </div>

      {totalCount > pageSize ? (
        <Pagination
          currentPage={pageNumber}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={(page) => setPageNumber(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageNumber(1);
          }}
        />
      ) : null}
    </section>
  );
};

export default BankReconciliationsPanel;
