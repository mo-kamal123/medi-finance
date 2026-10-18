import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import Table from '../../../../shared/ui/table';
import Pagination from '../../../../shared/ui/pagination';
import FilterBar from '../../../../shared/ui/filter-bar';
import FormInput from '../../../../shared/ui/input';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import DateInput from '../../../../shared/ui/date-input';
import { useDebounce } from '../../../../shared/lib/use-debounce';
import { formatCurrency, formatDate, formatNumber } from '../../../../shared/utils/formatters';
import { getAllBatches, getBatchStatuses } from '../api/batches.api';


const columns = [
  {
    header: 'رقم الدفعة', key: 'batchNumber', type: 'custom',
    render: (row) => (
      <Link className="font-semibold text-primary hover:underline" to={`/batches/${encodeURIComponent(row.batchNumber)}`}>
        {row.batchNumber}
      </Link>
    ),
  },
  {
    header: 'التاريخ', key: 'batchDate', type: 'custom',
    render: (row) => {
      const date = row.batchDate;
      // Keep non-ISO backend dates readable without guessing day/month order.
      if (typeof date === 'string' && !/^\d{4}-\d{2}-\d{2}(?:$|T| )/.test(date)) return date;
      return date && Number.isNaN(new Date(date).getTime()) ? date : formatDate(date);
    },
  },
  { header: 'المورد', key: 'supplierName' },
  {
    header: 'عدد المطالبات', key: 'claimsCount', type: 'custom',
    render: (row) => formatNumber(row.claimsCount),
  },
  {
    header: 'القيمة', key: 'totalAmount', type: 'custom',
    render: (row) => formatCurrency(row.totalAmount),
  },
  {
    header: 'الحالة', key: 'status', type: 'custom',
    render: (row) => {
      const status = String(row.status ?? '').trim().toLowerCase();
      const color = status === 'closed' ? 'bg-gray-100 text-gray-700' : status === 'مستلم' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
      return <span className={`rounded-full px-3 py-1 text-xs font-medium ${color}`}>{status === 'closed' ? 'مغلقة' : status === 'open' ? 'مفتوحة' : row.status || '-'}</span>;
    },
  },
];

const BatchesPage = () => {
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState({ searchTerm: '', statusId: '', batchDate: '' });
  const searchTerm = useDebounce(filters.searchTerm.trim(), 500);
  const filterDate = filters.batchDate ? `${filters.batchDate}T00:00:00` : '';
  const requestFilters = {
    search: searchTerm,
    status: filters.statusId,
    fromDate: filterDate,
    toDate: filterDate,
    pageNumber,
    pageSize,
  };
  const { data: statuses = [], isLoading: isLoadingStatuses, isError: isStatusesError, refetch: refetchStatuses } = useQuery({
    queryKey: ['batches', 'statuses'],
    queryFn: getBatchStatuses,
  });
  const handleFilterChange = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setPageNumber(1);
  };
  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['batches', 'list', requestFilters],
    queryFn: () => getAllBatches(requestFilters),
  });
  const { items = [], totalPages = 1 } = response ?? {};

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb items={[{ label: 'الدفعات' }]} />
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold">الدفعات</h1>
        <p className="mt-1 text-sm text-gray-600">عرض جميع دفعات المطالبات. اختر دفعة لعرض بياناتها وتفاصيلها.</p>
      </div>
      <FilterBar
        primaryFilters={[
          <div key="searchTerm" className="md:col-span-2 xl:col-span-3">
            <FormInput
              label="بحث"
              placeholder="ابحث في الدفعات"
              icon={Search}
              value={filters.searchTerm}
              onChange={(event) => handleFilterChange('searchTerm', event.target.value)}
            />
          </div>,
          <SearchableSelect
            key="statusId"
            label="الحالة"
            placeholder={isLoadingStatuses ? 'جاري تحميل الحالات...' : 'كل الحالات'}
            disabled={isLoadingStatuses || isStatusesError}
            value={filters.statusId}
            options={statuses.map((status) => ({ value: String(status.id), label: status.name }))}
            onChange={(event) => handleFilterChange('statusId', event.target.value)}
          />,
          <DateInput
            key="batchDate"
            label="تاريخ الدفعة"
            value={filters.batchDate}
            onChange={(event) => handleFilterChange('batchDate', event.target.value)}
          />,
        ]}
        activeCount={Object.values(filters).filter((value) => value.trim()).length}
        onReset={() => {
          setFilters({ searchTerm: '', statusId: '', batchDate: '' });
          setPageNumber(1);
        }}
      />
      {isStatusesError ? (
        <div role="alert" className="flex items-center gap-3 text-sm text-red-600">
          <p>تعذر تحميل حالات الدفعات.</p>
          <button type="button" onClick={() => refetchStatuses()} className="underline">إعادة المحاولة</button>
        </div>
      ) : null}
      {isError ? (
        <div role="alert" className="space-y-3 rounded-xl border border-red-200 bg-white p-6 text-center">
          <p className="text-red-600">تعذر تحميل الدفعات. حاول مرة أخرى.</p>
          <button type="button" onClick={() => refetch()} className="rounded-lg bg-primary px-4 py-2 text-white">إعادة المحاولة</button>
        </div>
      ) : (
        <>
          <Table columns={columns} data={items} loading={isLoading} emptyMessage="لا توجد دفعات لعرضها" onRowClick={(row) => navigate(`/batches/${encodeURIComponent(row.batchNumber)}`)} />
          <Pagination currentPage={pageNumber} totalPages={totalPages} pageSize={pageSize} onPageChange={setPageNumber} onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }} />
        </>
      )}
    </div>
  );
};

export default BatchesPage;
