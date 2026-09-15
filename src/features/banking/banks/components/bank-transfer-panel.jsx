import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, ExternalLink, Eye, Search } from 'lucide-react';
import Pagination from '../../../../shared/ui/pagination';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import DateInput from '../../../../shared/ui/date-input';
import FormInput from '../../../../shared/ui/input';
import FilterBar from '../../../../shared/ui/filter-bar';
import { useDebounce } from '../../../../shared/lib/use-debounce';
import {
  formatCurrency,
  formatDate,
} from '../../../../shared/utils/formatters';
import { useBankAccounts, useBankTransfers } from '../hooks/banks.queries';
import TransferDetailsModal from './transfer-details-modal';

const EMPTY_FILTERS = {
  searchTerm: '',
  bankAccountId: '',
  status: '',
  transferType: '',
  fromDate: '',
  toDate: '',
};

const STATUS_STYLES = {
  Draft: 'bg-amber-100 text-amber-700',
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

const TRANSFER_TYPE_STYLES = {
  Internal: 'bg-sky-100 text-sky-700',
  External: 'bg-violet-100 text-violet-700',
};

const TRANSFER_TYPE_LABELS = {
  Internal: 'تحويل داخلي',
  External: 'تحويل خارجي',
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

const getTypeBadge = (type, typeName) => (
  <span
    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
      TRANSFER_TYPE_STYLES[type] || 'bg-gray-100 text-gray-700'
    }`}
  >
    {TRANSFER_TYPE_LABELS[type] || typeName || type || '-'}
  </span>
);

const buildParams = (bankId, filters, searchTerm, pageNumber, pageSize) => {
  const params = { bankId, pageNumber, pageSize };
  Object.entries({ ...filters, searchTerm }).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      params[key] = value;
    }
  });
  return params;
};

const BankTransferPanel = ({ bankId }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const openParam = searchParams.get('open');
  const [selectedTransferId, setSelectedTransferId] = useState(
    openParam || null
  );
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounce(filters.searchTerm, 500);

  const { data: accountsRes = [] } = useBankAccounts(bankId);

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

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v !== '').length,
    [filters]
  );

  const queryParams = useMemo(
    () =>
      buildParams(
        bankId,
        filters,
        debouncedSearch.trim(),
        pageNumber,
        pageSize
      ),
    [bankId, filters, debouncedSearch, pageNumber, pageSize]
  );

  const {
    data: response,
    isLoading,
    isFetching,
  } = useBankTransfers(queryParams);

  const transfers = response?.items ?? [];
  const totalCount = response?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPageNumber(1);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setPageNumber(1);
  };

  const primaryFilters = [
    <FormInput
      key="search"
      label="بحث"
      icon={Search}
      value={filters.searchTerm}
      onChange={(event) => handleChange('searchTerm', event.target.value)}
      placeholder="ابحث برقم التحويل أو الطرف"
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
      key="transferType"
      label="نوع التحويل"
      value={filters.transferType || ''}
      onChange={(event) => handleChange('transferType', event.target.value)}
      options={[
        { value: 'Internal', label: 'تحويل داخلي' },
        { value: 'External', label: 'تحويل خارجي' },
      ]}
      placeholder="كل الأنواع"
    />,
    <SearchableSelect
      key="status"
      label="الحالة"
      value={filters.status || ''}
      onChange={(event) => handleChange('status', event.target.value)}
      options={[
        { value: 'Draft', label: 'مسودة' },
        { value: 'Posted', label: 'معتمدة' },
        { value: 'Reconciled', label: 'مطابقة' },
        { value: 'Cancelled', label: 'ملغاة' },
      ]}
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
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">التحويلات البنكية</h2>
        <p className="mt-1 text-sm text-gray-500">
          سجل التحويلات البنكية{totalCount ? ` (${totalCount} تحويل)` : ''}
        </p>
      </div>

      <div className="mb-4">
        <FilterBar
          primaryFilters={primaryFilters}
          extraFilters={extraFilters}
          onReset={handleReset}
          activeCount={activeFilterCount}
        />
      </div>

      <div className="relative mb-4 overflow-x-auto rounded-xl border border-gray-200">
        {isFetching && !isLoading ? (
          <div className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-primary/60" />
        ) : null}
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-primary/90 text-white">
            <tr>
              <th className="whitespace-nowrap p-3 text-right font-semibold">
                رقم التحويل
              </th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">
                النوع
              </th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">
                من
              </th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">
                إلى
              </th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">
                التاريخ
              </th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">
                المبلغ
              </th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">
                الحالة
              </th>
              <th className="whitespace-nowrap p-3 text-right font-semibold">
                القيد اليومي
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="p-10 text-center text-gray-400">
                  جاري تحميل التحويلات...
                </td>
              </tr>
            ) : transfers.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-10 text-center text-gray-400">
                  لا توجد تحويلات مطابقة
                </td>
              </tr>
            ) : (
              transfers.map((tr) => (
                <tr
                  key={tr.bankTransferID}
                  onClick={() => setSelectedTransferId(String(tr.bankTransferID))}
                  className={`cursor-pointer border-t border-gray-200 even:bg-gray-50/50 transition-colors hover:bg-gray-50 ${
                    isFetching ? 'opacity-60' : ''
                  }`}
                >
                  <td className="whitespace-nowrap p-3 font-medium text-primary">
                    {tr.transferNumber}
                  </td>
                  <td className="whitespace-nowrap p-3">
                    {getTypeBadge(tr.transferType, tr.transferTypeName)}
                  </td>
                  <td className="whitespace-nowrap p-3">
                    {tr.fromBankNameAr || tr.bankAccountName || '-'}
                  </td>
                  <td className="whitespace-nowrap p-3">
                    {tr.toBankNameAr ||
                      tr.partyName ||
                      tr.toBankAccountName ||
                      '-'}
                  </td>
                  <td className="whitespace-nowrap p-3">
                    {formatDate(tr.transferDate)}
                  </td>

                  <td className="whitespace-nowrap p-3">
                    <span className="font-semibold text-primary" dir="ltr">
                      {formatCurrency(tr.localAmount ?? tr.amount)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap p-3">
                    {getStatusBadge(tr.status, tr.statusName)}
                  </td>
                  <td className="whitespace-nowrap p-3 z-100">
                    {tr.journalEntryID ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/entries/${tr.journalEntryID}`);
                        }}
                        title="عرض تفاصيل القيد"
                        className="text-main inline-flex cursor-pointer font-semibold justify-center items-center gap-2"
                      >
                        {tr.journalEntryNumber || `قيد ${tr.journalEntryID}`}
                        <ExternalLink size={15} />
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))
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

      <TransferDetailsModal
        open={Boolean(selectedTransferId)}
        transferId={selectedTransferId}
        onClose={() => setSelectedTransferId(null)}
      />
    </section>
  );
};

export default BankTransferPanel;
