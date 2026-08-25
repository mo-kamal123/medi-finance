import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ChevronDown, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import Pagination from '../../../../shared/ui/pagination';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import DateInput from '../../../../shared/ui/date-input';
import { useDebounce } from '../../../../shared/lib/use-debounce';
import { formatCurrency, formatDate } from '../../../../shared/utils/formatters';
import {
  useBankAccounts,
  useBankTransactions,
  useBankTransactionFilterOptions,
} from '../hooks/banks.queries';

const EMPTY_FILTERS = {
  bankAccountId: '',
  transactionType: '',
  direction: '',
  status: '',
  sourceType: '',
  fromDate: '',
  toDate: '',
  minAmount: '',
  maxAmount: '',
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

const ADVANCED_KEYS = ['direction', 'status', 'sourceType', 'fromDate', 'toDate', 'minAmount', 'maxAmount'];

const buildParams = (filters, searchTerm, pageNumber, pageSize) => {
  const params = { bankId: filters.bankId, pageNumber, pageSize };
  Object.entries({ ...filters, searchTerm }).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      params[key] = value;
    }
  });
  return params;
};

const toOptions = (list = []) =>
  (Array.isArray(list) ? list : []).map((item) => ({
    value: String(item.id),
    label: item.name,
  }));

const BankTransactionsPanel = ({ bankId }) => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data: accountsRes = [] } = useBankAccounts(bankId);
  const { data: types } = useBankTransactionFilterOptions('transaction-types');
  const { data: directions } = useBankTransactionFilterOptions('directions');
  const { data: statuses } = useBankTransactionFilterOptions('statuses');
  const { data: sourceTypes } = useBankTransactionFilterOptions('source-types');

  const accountOptions = useMemo(
    () =>
      (Array.isArray(accountsRes) ? accountsRes : []).map((account) => ({
        value: String(account.bankAccountID || account.id),
        label:
          account.accountNumberWithBranch ||
          account.accountNumber ||
          account.accountNameAr ||
          String(account.bankAccountID || account.id),
      })),
    [accountsRes]
  );

  const advancedFilterCount = useMemo(
    () => ADVANCED_KEYS.filter((k) => filters[k] !== '').length,
    [filters]
  );

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v !== '').length,
    [filters]
  );

  const queryParams = useMemo(
    () =>
      buildParams(
        { ...filters, bankId },
        debouncedSearch.trim(),
        pageNumber,
        pageSize
      ),
    [filters, bankId, debouncedSearch, pageNumber, pageSize]
  );

  const { data: response, isLoading, isFetching } = useBankTransactions(queryParams);

  const transactions = response?.items ?? [];
  const totalCount = response?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const updateFilter = (key) => (value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPageNumber(1);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setPageNumber(1);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">معاملات البنك</h2>
          <p className="mt-1 text-sm text-gray-500">
            سجل المعاملات المالية للبنك{totalCount ? ` (${totalCount} معاملة)` : ''}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPageNumber(1);
            }}
            placeholder="بحث في المعاملات..."
            className="w-full rounded-lg border border-gray-200 px-9 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SearchableSelect
            label="الحساب البنكي"
            value={filters.bankAccountId}
            onChange={(event) => updateFilter('bankAccountId')(event.target.value)}
            options={accountOptions}
            placeholder="كل الحسابات"
          />
          <SearchableSelect
            label="نوع المعاملة"
            value={filters.transactionType}
            onChange={(event) => updateFilter('transactionType')(event.target.value)}
            options={toOptions(types)}
            placeholder="كل الأنواع"
          />
          <SearchableSelect
            label="الاتجاه"
            value={filters.direction}
            onChange={(event) => updateFilter('direction')(event.target.value)}
            options={[
              { value: 'In', label: 'وارد' },
              { value: 'Out', label: 'صادر' },
            ]}
            placeholder="الكل"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <SlidersHorizontal size={16} />
            <span>فلاتر إضافية</span>
            {advancedFilterCount > 0 ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {advancedFilterCount}
              </span>
            ) : null}
            <ChevronDown
              size={16}
              className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            />
          </button>

          {activeFilterCount > 0 || debouncedSearch ? (
            <button
              type="button"
              onClick={() => {
                handleReset();
                setSearchTerm('');
              }}
              className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              <RotateCcw size={16} />
              مسح الفلاتر
            </button>
          ) : null}
        </div>

        {showAdvanced ? (
          <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 sm:grid-cols-2 xl:grid-cols-4">
            <SearchableSelect
              label="الحالة"
              value={filters.status}
              onChange={(event) => updateFilter('status')(event.target.value)}
              options={toOptions(statuses)}
              placeholder="كل الحالات"
            />
            <SearchableSelect
              label="المصدر"
              value={filters.sourceType}
              onChange={(event) => updateFilter('sourceType')(event.target.value)}
              options={toOptions(sourceTypes)}
              placeholder="كل المصادر"
            />
            <DateInput
              label="من تاريخ"
              value={filters.fromDate || ''}
              onChange={(event) => updateFilter('fromDate')(event.target.value)}
            />
            <DateInput
              label="إلى تاريخ"
              value={filters.toDate || ''}
              onChange={(event) => updateFilter('toDate')(event.target.value)}
            />
          </div>
        ) : null}
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto rounded-xl border border-gray-200">
        {isFetching && !isLoading ? (
          <div className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-primary/60" />
        ) : null}
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-primary/90 text-white">
            <tr>
              <th className="whitespace-nowrap p-3 text-right font-semibold">رقم المعاملة</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">التاريخ</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">الحساب البنكي</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">النوع</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">المبلغ</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">الوصف</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">المرجع</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">المصدر</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">الحالة</th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">القيد اليومي</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="p-10 text-center text-gray-400">
                  جاري تحميل المعاملات...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-10 text-center text-gray-400">
                  لا توجد معاملات مطابقة
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isOut =
                  tx.direction === 'Out' ||
                  Number(tx.localAmount ?? tx.amount) < 0;
                return (
                  <tr
                    key={tx.transactionID}
                    className={`border-t border-gray-200 even:bg-gray-50/50 ${
                      isFetching ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="whitespace-nowrap p-3 font-medium text-primary">
                      {tx.transactionNumber}
                    </td>
                    <td className="whitespace-nowrap p-3">{formatDate(tx.transactionDate)}</td>
                    <td className="whitespace-nowrap p-3">{tx.bankAccountName}</td>
                    <td className="whitespace-nowrap p-3">
                      {tx.transactionTypeName || tx.transactionType}
                    </td>
                    <td className="whitespace-nowrap p-3">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          isOut ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {isOut ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        {formatCurrency(Math.abs(Number(tx.localAmount ?? tx.amount)))}
                        <span className="text-xs font-normal text-gray-400">
                          {tx.currencyName}
                        </span>
                      </span>
                    </td>
                    <td className="max-w-60 truncate p-3" title={tx.descriptionAr}>
                      {tx.descriptionAr || '-'}
                    </td>
                    <td className="whitespace-nowrap p-3">{tx.referenceNumber || '-'}</td>
                    <td className="whitespace-nowrap p-3">
                      {tx.sourceTypeName || tx.sourceType || '-'}
                    </td>
                    <td className="whitespace-nowrap p-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          STATUS_STYLES[tx.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {STATUS_LABELS[tx.status] || tx.statusName || tx.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-3">
                      {tx.journalEntryID ? `JE-${tx.journalEntryID}` : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalCount > 10 ? (
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

export default BankTransactionsPanel;
