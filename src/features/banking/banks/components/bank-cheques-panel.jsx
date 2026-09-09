import { useMemo, useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../../../shared/ui/pagination';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import DateInput from '../../../../shared/ui/date-input';
import FormInput from '../../../../shared/ui/input';
import FilterBar from '../../../../shared/ui/filter-bar';
import { useDebounce } from '../../../../shared/lib/use-debounce';
import { formatCurrency, formatDate } from '../../../../shared/utils/formatters';
import { useCheques } from '../../cheques/hooks/cheques.queries';

const EMPTY_FILTERS = {
  searchTerm: '',
  type: '',
  status: '',
  receiptDate: '',
  dueDate: '',
};

const TYPE_OPTIONS = [
  { value: '0', label: 'قبض' },
  { value: '1', label: 'صرف' },
];

const STATUS_OPTIONS = [
  { value: '0', label: 'قيد الانتظار' },
  { value: '1', label: 'مستلمة' },
  { value: '2', label: 'مستحقة' },
  { value: '3', label: 'ملغاة' },
];

const BankChequesPanel = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounce(filters.searchTerm, 500);

  const { data = [], isLoading } = useCheques();

  const allCheques = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  const filteredCheques = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return allCheques.filter((chq) => {
      if (filters.type !== '') {
        const raw = String(chq.transactionType ?? chq.type);
        if (raw !== String(filters.type) && raw !== filters.type) {
          return false;
        }
      }
      if (filters.status !== '') {
        const raw =
          String(chq.chequeStatusID ?? chq.statusID ?? chq.chequeStatusType ?? '');
        if (raw !== String(filters.status)) {
          return false;
        }
      }
      if (filters.receiptDate && chq.receiptDate) {
        if (String(chq.receiptDate).slice(0, 10) !== filters.receiptDate) {
          return false;
        }
      }
      if (filters.dueDate && chq.dueDate) {
        if (String(chq.dueDate).slice(0, 10) !== filters.dueDate) {
          return false;
        }
      }
      if (term) {
        const haystack = [
          chq.chequeNumber,
          chq.partyNameAr,
          chq.customerNameAr,
          chq.supplierNameAr,
          chq.beneficiaryName,
          chq.branchName,
          String(chq.amount ?? ''),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [allCheques, filters, debouncedSearch]);

  const pagination = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return {
      items: filteredCheques.slice(start, start + pageSize),
      totalPages: Math.max(1, Math.ceil(filteredCheques.length / pageSize)),
      currentPage: pageNumber,
      pageSize,
    };
  }, [filteredCheques, pageNumber, pageSize]);

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPageNumber(1);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setPageNumber(1);
  };

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v !== '').length,
    [filters]
  );

  const extraFilterCount = useMemo(
    () =>
      Object.entries(filters)
        .filter(([key]) => key !== 'searchTerm')
        .filter(([, value]) => value !== '').length,
    [filters]
  );

  const primaryFilters = [
    <FormInput
      key="search"
      label="بحث"
      icon={Search}
      value={filters.searchTerm}
      onChange={(event) => handleChange('searchTerm', event.target.value)}
      placeholder="ابحث برقم الشيك أو الطرف"
      autoFocus
    />,
    <SearchableSelect
      key="type"
      label="نوع الشيك"
      value={filters.type || ''}
      onChange={(event) => handleChange('type', event.target.value)}
      placeholder="الكل"
      options={TYPE_OPTIONS}
    />,
    <SearchableSelect
      key="status"
      label="الحالة"
      value={filters.status || ''}
      onChange={(event) => handleChange('status', event.target.value)}
      placeholder="كل الحالات"
      options={STATUS_OPTIONS}
    />,
  ];

  const extraFilters = [
    <DateInput
      key="receiptDate"
      label="تاريخ الاستلام"
      value={filters.receiptDate || ''}
      onChange={(event) => handleChange('receiptDate', event.target.value)}
    />,
    <DateInput
      key="dueDate"
      label="تاريخ الاستحقاق"
      value={filters.dueDate || ''}
      onChange={(event) => handleChange('dueDate', event.target.value)}
    />,
  ];

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">الشيكات</h2>
        <p className="mt-1 text-sm text-gray-500">
          جميع الشيكات{filteredCheques.length ? ` (${filteredCheques.length} شيك)` : ''}
        </p>
      </div>

      <div className="mb-4">
        <FilterBar
          primaryFilters={primaryFilters}
          extraFilters={extraFilters}
          onReset={handleReset}
          activeCount={activeFilterCount}
          extraCount={extraFilterCount}
        />
      </div>

      {/* Table */}
      <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-primary/90 text-white">
            <tr>
              <th className="p-3 text-right font-semibold">رقم الشيك</th>
              <th className="p-3 text-right font-semibold">تاريخ الشيك</th>
              <th className="p-3 text-right font-semibold">القيمة</th>
              <th className="p-3 text-right font-semibold">العميل/المورد</th>
              <th className="p-3 text-right font-semibold">نوع المعاملة</th>
              <th className="p-3 text-right font-semibold">تاريخ الاستلام</th>
              <th className="p-3 text-right font-semibold">تاريخ الاستحقاق</th>
              <th className="p-3 text-right font-semibold">الحالة</th>
              <th className="p-3 text-center font-semibold">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="p-10 text-center text-gray-400">
                  جاري تحميل الشيكات...
                </td>
              </tr>
            ) : pagination.items.length > 0 ? (
              pagination.items.map((chq) => (
                <tr
                  key={chq.chequeID}
                  onClick={() => navigate(`/cheques/${chq.chequeID}`)}
                  className="cursor-pointer border-t border-gray-200 even:bg-gray-50/50 transition-colors hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap p-3 font-medium text-primary">
                    {chq.chequeNumber}
                  </td>
                  <td className="whitespace-nowrap p-3">{formatDate(chq.chequeDate)}</td>
                  <td className="whitespace-nowrap p-3 font-medium">
                    {formatCurrency(chq.amount)}
                  </td>
                  <td className="whitespace-nowrap p-3">
                    {chq.partyNameAr || chq.customerNameAr || chq.supplierNameAr || '-'}
                  </td>
                  <td className="whitespace-nowrap p-3">
                    {chq.transactionTypeNameAr ||
                      (Number(chq.transactionType ?? chq.type) === 1 ? 'صرف' : 'قبض')}
                  </td>
                  <td className="whitespace-nowrap p-3">{formatDate(chq.receiptDate)}</td>
                  <td className="whitespace-nowrap p-3">{formatDate(chq.dueDate)}</td>
                  <td className="whitespace-nowrap p-3">{chq.statusNameAr || '-'}</td>
                  <td className="p-3">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => navigate(`/cheques/${chq.chequeID}`)}
                        className="text-blue-600 hover:text-blue-800"
                        title="فتح"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-400">
                  لا توجد شيكات مطابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 ? (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
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

export default BankChequesPanel;
