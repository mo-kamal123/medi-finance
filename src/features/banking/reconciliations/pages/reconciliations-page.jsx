import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Search } from 'lucide-react';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import Pagination from '../../../../shared/ui/pagination';
import Table from '../../../../shared/ui/table';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import DateInput from '../../../../shared/ui/date-input';
import FormInput from '../../../../shared/ui/input';
import FilterBar from '../../../../shared/ui/filter-bar';
import { formatCurrency, formatDate } from '../../../../shared/utils/formatters';
import { getErrorMessage } from '../../../../shared/lib/toast';
import { useBanks, useAllBankAccounts } from '../../banks/hooks/banks.queries';
import { useBankReconciliations } from '../hooks/bank-reconciliations.queries';

const EMPTY_FILTERS = {
  bankId: '',
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

const STATUS_STYLES = {
  Matched: 'bg-emerald-100 text-emerald-700',
  Reconciled: 'bg-sky-100 text-sky-700',
  InProgress: 'bg-amber-100 text-amber-700',
  Draft: 'bg-amber-100 text-amber-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const STATUS_AR = {
  Reconciled: 'معتمدة',
  InProgress: 'جارية',
  Draft: 'مسودة',
  Matched: 'مطابق',
  Cancelled: 'ملغي',
};

const getRecId = (row) =>
  row?.reconciliationID ?? row?.reconciliationId ?? row?.id;

const getRecStatus = (row) => row?.status ?? row?.statusCode ?? '';

const getRecStatusName = (row) =>
  STATUS_AR[row?.status] || row?.statusName || row?.status || '-';

const getAccountLabel = (row) =>
  row?.accountNameAr ||
  row?.bankAccountName ||
  row?.accountName ||
  [row?.bankNameAr, row?.accountNumber].filter(Boolean).join(' - ') ||
  '-';

const extractAccounts = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.items)) return res.items;
  return [];
};

const ReconciliationsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: banksRes = [] } = useBanks({});
  const { data: accountsRes } = useAllBankAccounts();

  const banks = useMemo(
    () => (Array.isArray(banksRes) ? banksRes : []),
    [banksRes]
  );
  const accounts = useMemo(
    () => extractAccounts(accountsRes),
    [accountsRes]
  );

  const bankOptions = useMemo(
    () =>
      banks.map((b) => ({
        value: String(b.bankID ?? b.id),
        label: b.bankNameAr || b.bankNameEn || String(b.bankID ?? b.id),
      })),
    [banks]
  );

  const filteredAccounts = useMemo(() => {
    if (!filters.bankId) return accounts;
    return accounts.filter(
      (a) => String(a.bankID ?? a.bankId ?? '') === String(filters.bankId)
    );
  }, [accounts, filters.bankId]);

  const accountOptions = useMemo(
    () =>
      filteredAccounts.map((a) => ({
        value: String(a.bankAccountID ?? a.id),
        label:
          a.accountNumberWithBranch ||
          [a.accountNumber, a.accountNameAr].filter(Boolean).join(' - ') ||
          String(a.bankAccountID ?? a.id),
      })),
    [filteredAccounts]
  );

  const queryParams = useMemo(() => {
    const params = { pageNumber, pageSize };
    if (filters.bankId) params.bankId = filters.bankId;
    if (filters.bankAccountId) params.bankAccountId = filters.bankAccountId;
    if (filters.status) params.status = filters.status;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    if (filters.searchTerm?.trim())
      params.searchTerm = filters.searchTerm.trim();
    return params;
  }, [filters, pageNumber, pageSize]);

  const { data, isLoading, isFetching, isError, error } =
    useBankReconciliations(queryParams);

  const reconciliations = useMemo(() => data?.items ?? [], [data]);
  const totalCount = data?.totalCount ?? reconciliations.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v !== '').length,
    [filters]
  );

  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'bankId' ? { bankAccountId: '' } : {}),
    }));
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
        header: 'البنك',
        key: 'bankNameAr',
        type: 'custom',
        render: (row) => row?.bankNameAr || row?.bankName || '-',
      },
      {
        header: 'الحساب',
        key: 'accountNameAr',
        type: 'custom',
        render: (row) => (
          <div className="flex flex-col">
            <span>{getAccountLabel(row)}</span>
            {row?.accountNumber ? (
              <span dir="ltr" className="font-mono text-xs text-gray-500">
                {row.accountNumber}
              </span>
            ) : null}
          </div>
        ),
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
        header: 'رصيد الكشف',
        key: 'bankStatementClosingBalance',
        type: 'custom',
        render: (row) => (
          <span className="font-semibold" dir="ltr">
            {formatCurrency(
              row?.bankStatementClosingBalance ?? row?.statementBalance ?? 0
            )}
          </span>
        ),
      },
      {
        header: 'رصيد الدفاتر',
        key: 'bookBalance',
        type: 'custom',
        render: (row) => (
          <span dir="ltr">{formatCurrency(row?.bookBalance ?? 0)}</span>
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
        header: 'البنود',
        key: 'totalItems',
        type: 'custom',
        render: (row) => row?.totalItems ?? row?.items?.length ?? '-',
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
      onChange={(e) => handleChange('searchTerm', e.target.value)}
      placeholder="ابحث برقم الحساب أو البنك"
    />,
    <SearchableSelect
      key="bankId"
      label="البنك"
      value={filters.bankId || ''}
      onChange={(e) => handleChange('bankId', e.target.value)}
      options={bankOptions}
      placeholder="كل البنوك"
    />,
    <SearchableSelect
      key="bankAccountId"
      label="الحساب البنكي"
      value={filters.bankAccountId || ''}
      onChange={(e) => handleChange('bankAccountId', e.target.value)}
      options={accountOptions}
      placeholder="كل الحسابات"
    />,
    <SearchableSelect
      key="status"
      label="الحالة"
      value={filters.status || ''}
      onChange={(e) => handleChange('status', e.target.value)}
      options={STATUS_OPTIONS}
      placeholder="كل الحالات"
    />,
  ];

  const extraFilters = [
    <DateInput
      key="fromDate"
      label="من تاريخ"
      value={filters.fromDate || ''}
      onChange={(e) => handleChange('fromDate', e.target.value)}
    />,
    <DateInput
      key="toDate"
      label="إلى تاريخ"
      value={filters.toDate || ''}
      onChange={(e) => handleChange('toDate', e.target.value)}
    />,
  ];

  return (
    <div className="space-y-4 p-6">
      <Breadcrumb items={[{ label: 'البنوك' }, { label: 'تسويات البنك' }]} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تسويات البنك</h1>
          <p className="mt-1 text-sm text-gray-500">
            {totalCount
              ? `إجمالي التسويات (${totalCount})`
              : 'عرض كل التسويات البنكية ومطابقتها'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/reconciliations/new')}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus size={16} />
          تسوية جديدة
        </button>
      </div>

      <FilterBar
        primaryFilters={primaryFilters}
        extraFilters={extraFilters}
        onReset={handleReset}
        activeCount={activeFilterCount}
        extraCount={
          [filters.fromDate, filters.toDate].filter((v) => v !== '').length
        }
      />

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {getErrorMessage(error, 'تعذر تحميل التسويات')}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl">
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
    </div>
  );
};

export default ReconciliationsPage;
