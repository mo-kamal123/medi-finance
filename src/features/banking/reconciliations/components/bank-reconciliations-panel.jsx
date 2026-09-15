import { useMemo, useState } from 'react';
import { Eye, Plus, Search } from 'lucide-react';
import Pagination from '../../../../shared/ui/pagination';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import DateInput from '../../../../shared/ui/date-input';
import FormInput from '../../../../shared/ui/input';
import FilterBar from '../../../../shared/ui/filter-bar';
import { formatCurrency, formatDate } from '../../../../shared/utils/formatters';
import { getErrorMessage } from '../../../../shared/lib/toast';
import { useBankAccounts } from '../../banks/hooks/banks.queries';
import { useBankReconciliations } from '../hooks/bank-reconciliations.queries';
import ReconciliationCreateModal from './reconciliation-create-modal';
import ReconciliationDetails from './reconciliation-details';

const EMPTY_FILTERS = {
  bankAccountId: '',
  status: '',
  fromDate: '',
  toDate: '',
  searchTerm: '',
};

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'مسودة' },
  { value: 'Matched', label: 'مطابق' },
  { value: 'Reconciled', label: 'معتمد' },
  { value: 'Cancelled', label: 'ملغي' },
];

const getRecId = (row) =>
  row?.id ?? row?.reconciliationId ?? row?.reconciliationID;

const getRecStatus = (row) => row?.status ?? row?.statusCode ?? '';

const getRecStatusName = (row) => row?.statusName ?? row?.status ?? '-';

const STATUS_STYLES = {
  Matched: 'bg-emerald-100 text-emerald-700',
  Reconciled: 'bg-sky-100 text-sky-700',
  Draft: 'bg-amber-100 text-amber-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const BankReconciliationsPanel = ({ bankId }) => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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

  if (selectedId) {
    return (
      <ReconciliationDetails
        reconciliationId={selectedId}
        onBack={() => setSelectedId(null)}
      />
    );
  }

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
          onClick={() => setCreateOpen(true)}
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

      <div className="relative mb-4 overflow-x-auto rounded-xl border border-gray-200">
        {isFetching && !isLoading ? (
          <div className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-primary/60" />
        ) : null}
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-primary/90 text-white">
            <tr>
              <th className="whitespace-nowrap p-3 text-right font-semibold">رقم التسوية</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">الحساب</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">الفترة</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">تاريخ الكشف</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">رصيد الكشف النهائي</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">الفرق</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">الحالة</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">عرض</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-gray-400">
                  جاري تحميل التسويات...
                </td>
              </tr>
            ) : reconciliations.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-gray-400">
                  لا توجد تسويات مطابقة — أنشئ تسوية جديدة لبدء المطابقة
                </td>
              </tr>
            ) : (
              reconciliations.map((row, index) => {
                const recId = getRecId(row) ?? index;
                const status = getRecStatus(row);
                const diff = Number(row?.difference ?? 0);
                return (
                  <tr
                    key={recId}
                    onClick={() => setSelectedId(recId)}
                    className={`cursor-pointer border-t border-gray-200 even:bg-gray-50/50 hover:bg-primary/5 ${
                      isFetching ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="whitespace-nowrap p-3 font-medium text-primary">
                      {row?.reconciliationNumber ?? recId}
                    </td>
                    <td className="whitespace-nowrap p-3">
                      {row?.bankAccountName ?? row?.accountName ?? '-'}
                    </td>
                    <td className="whitespace-nowrap p-3">
                      {formatDate(row?.fromDate)} - {formatDate(row?.toDate)}
                    </td>
                    <td className="whitespace-nowrap p-3">
                      {formatDate(row?.statementDate)}
                    </td>
                    <td className="whitespace-nowrap p-3 font-semibold">
                      {formatCurrency(row?.bankStatementClosingBalance ?? 0)}
                    </td>
                    <td
                      className={`whitespace-nowrap p-3 font-semibold ${
                        diff !== 0 ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    >
                      {formatCurrency(diff)}
                    </td>
                    <td className="whitespace-nowrap p-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {getRecStatusName(row)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(recId);
                        }}
                        title="عرض التفاصيل"
                        className="rounded-lg p-2 text-primary hover:bg-primary/10"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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

      <ReconciliationCreateModal
        bankId={bankId}
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(createdId) => {
          if (createdId && typeof createdId !== 'object') {
            setSelectedId(createdId);
          }
        }}
      />
    </section>
  );
};

export default BankReconciliationsPanel;
