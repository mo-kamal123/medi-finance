import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react';
import Pagination from '../../../../shared/ui/pagination';
import SearchableSelect from '../../../../shared/ui/searchable-select';
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

const FilterSelect = ({ label, value, onChange, options }) => (
  <label className="flex min-w-44 flex-1 flex-col gap-1 sm:max-w-56">
    <span className="text-xs font-medium text-gray-500">{label}</span>
    <SearchableSelect
      value={value}
      onChange={(event) => onChange(event.target.value)}
      options={options}
      placeholder="الكل"
      searchPlaceholder="ابحث..."
    />
  </label>
);

const FilterInput = ({ label, type = 'text', value, onChange, placeholder }) => (
  <label className="flex min-w-36 flex-col gap-1">
    <span className="text-xs font-medium text-gray-500">{label}</span>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
    />
  </label>
);

const BankTransactionsPanel = ({ bankId }) => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
        <FilterSelect
          label="الحساب البنكي"
          value={filters.bankAccountId}
          onChange={updateFilter('bankAccountId')}
          options={accountOptions}
        />
        <FilterSelect
          label="نوع المعاملة"
          value={filters.transactionType}
          onChange={updateFilter('transactionType')}
          options={toOptions(types)}
        />
        <FilterSelect
          label="الاتجاه"
          value={filters.direction}
          onChange={updateFilter('direction')}
          options={toOptions(directions)}
        />
        <FilterSelect
          label="الحالة"
          value={filters.status}
          onChange={updateFilter('status')}
          options={toOptions(statuses)}
        />
        <FilterSelect
          label="المصدر"
          value={filters.sourceType}
          onChange={updateFilter('sourceType')}
          options={toOptions(sourceTypes)}
        />
        <FilterInput
          label="من تاريخ"
          type="date"
          value={filters.fromDate}
          onChange={updateFilter('fromDate')}
        />
        <FilterInput
          label="إلى تاريخ"
          type="date"
          value={filters.toDate}
          onChange={updateFilter('toDate')}
        />
        <FilterInput
          label="أقل مبلغ"
          type="number"
          value={filters.minAmount}
          onChange={updateFilter('minAmount')}
        />
        <FilterInput
          label="أعلى مبلغ"
          type="number"
          value={filters.maxAmount}
          onChange={updateFilter('maxAmount')}
        />
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
