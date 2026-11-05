import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import PageHeading from '../../../../../shared/ui/page-heading';
import Breadcrumb from '../../../../../shared/ui/breadcrumb';
import DateInput from '../../../../../shared/ui/date-input';
import FormInput from '../../../../../shared/ui/input';
import FilterBar from '../../../../../shared/ui/filter-bar';
import Pagination from '../../../../../shared/ui/pagination';
import PartySearchSelect from '../../../../../shared/ui/party-search-select';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import Table from '../../../../../shared/ui/table';
import {
  formatCurrency,
  formatDate,
  formatNumber,
} from '../../../../../shared/utils/formatters';
import { getMediconsultPayables } from '../api/mediconsult-payables.api';

const title = 'تقرير ذمم MEDICONSULT';
const textFilters = [
  ['Governorate', 'المحافظة'],
  ['Category', 'الفئة'],
  ['ProviderType', 'نوع مقدم الخدمة'],
  ['Operation', 'العملية'],
];
const paymentStatuses = [
  { value: '', label: 'جميع الحالات' },
  { value: 'Unpaid', label: 'غير مدفوع' },
  { value: 'PartiallyPaid', label: 'مدفوع جزئياً' },
  { value: 'Paid', label: 'مدفوع' },
];
const displayAmount = (value) => (value == null ? '—' : formatCurrency(value));
const paymentStatusStyles = {
  Unpaid: 'border-red-200 bg-red-50 text-red-700',
  PartiallyPaid: 'border-amber-200 bg-amber-50 text-amber-700',
  Paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};
const columns = [
  { header: 'المورد', key: 'supplierName' },
  { header: 'المحافظة', key: 'governorate' },
  { header: 'رقم الدفعة', key: 'batchNumber' },
  {
    header: 'تاريخ الدفعة',
    key: 'batchDate',
    type: 'custom',
    render: (row) => formatDate(row.batchDate) || '—',
  },
  {
    header: 'المبلغ الأصلي',
    key: 'originalAmount',
    type: 'custom',
    render: (row) => (
      <span
        dir="ltr"
        className="inline-block font-semibold text-primary tabular-nums"
      >
        {displayAmount(row.originalAmount)}
      </span>
    ),
  },
  {
    header: 'المبلغ المتبقي',
    key: 'remainingAmount',
    type: 'custom',
    render: (row) => (
      <span
        dir="ltr"
        className={`inline-block font-semibold tabular-nums ${row.remainingAmount == null ? 'text-gray-500' : Number(row.remainingAmount) === 0 ? 'text-emerald-700' : 'text-red-700'}`}
      >
        {displayAmount(row.remainingAmount)}
      </span>
    ),
  },
  {
    header: 'حالة الدفع',
    key: 'paymentStatusName',
    type: 'custom',
    render: (row) => (
      <span
        className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${paymentStatusStyles[row.paymentStatus] ?? 'border-gray-200 bg-gray-50 text-gray-600'}`}
      >
        {paymentStatuses.find(
          ({ value }) => value && value === row.paymentStatus
        )?.label ||
          row.paymentStatusName ||
          row.paymentStatus ||
          '—'}
      </span>
    ),
  },
  { header: 'العملية', key: 'operation' },
  { header: 'الفئة', key: 'category' },
  {
    header: 'نوع مقدم الخدمة',
    key: 'providerType',
    type: 'custom',
    render: (row) => row.providerType || '—',
  },
  {
    header: 'طريقة الدفع',
    key: 'paymentMethod',
    type: 'custom',
    render: (row) => row.paymentMethod || '—',
  },
];

const MediconsultPayablesPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [draft, setDraft] = useState({});
  const [filters, setFilters] = useState({});
  const invalidDateRange =
    draft.FromDate && draft.ToDate && draft.FromDate > draft.ToDate;
  useEffect(() => {
    if (invalidDateRange) return;
    const timer = setTimeout(() => {
      setFilters(draft);
      setPageNumber(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [draft, invalidDateRange]);
  const filterField = (key) => ({
    value: draft[key] ?? '',
    onChange: (event) =>
      setDraft((previous) => ({
        ...previous,
        [key]: String(event.target.value ?? ''),
      })),
  });
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: [
      'reports',
      'mediconsult-payables',
      pageNumber,
      pageSize,
      filters,
    ],
    queryFn: ({ signal }) =>
      getMediconsultPayables(pageNumber, pageSize, filters, signal),
  });

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb items={[{ label: 'التقارير' }, { label: title }]} />
      <header className="rounded-xl border border-gray-200 bg-white p-6">
        <PageHeading icon={<FileText size={20} />}>
          <h1 className="text-2xl font-bold">{data?.reportName || title}</h1>
          {data && (
            <p className="mt-1 text-sm text-gray-600">
              عدد الدفعات: {formatNumber(data.totalCount)}
            </p>
          )}
        </PageHeading>
      </header>
      <FilterBar
        gridClassName="xl:grid-cols-5"
        activeCount={
          Object.values(draft).filter((value) => value.trim()).length
        }
        extraCount={
          textFilters.map(([key]) => key).filter((key) => draft[key]?.trim())
            .length
        }
        onReset={() => {
          setDraft({});
          setFilters({});
          setPageNumber(1);
        }}
        primaryFilters={[
          <DateInput
            key="from"
            label="من تاريخ"
            {...filterField('FromDate')}
          />,
          <DateInput
            key="to"
            label="إلى تاريخ"
            {...filterField('ToDate')}
            error={
              invalidDateRange
                ? 'تاريخ النهاية يجب أن يكون في تاريخ البداية أو بعده'
                : undefined
            }
          />,
          <div key="supplier">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              المورد
            </label>
            <PartySearchSelect
              type="supplier"
              placeholder="ابحث باسم المورد"
              {...filterField('SupplierId')}
            />
          </div>,
          <SearchableSelect
            key="status"
            label="حالة الدفع"
            placeholder="جميع الحالات"
            options={paymentStatuses}
            {...filterField('PaymentStatus')}
          />,
        ]}
        extraFilters={[
          ...textFilters.map(([key, label]) => (
            <FormInput
              key={key}
              label={label}
              aria-label={label}
              placeholder={`أدخل ${label}`}
              {...filterField(key)}
            />
          )),
        ]}
      />
      {isError ? (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
          تعذر تحميل تقرير الذمم.
          <button
            type="button"
            className="mx-3 underline"
            onClick={() => void refetch()}
          >
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <>
          <Table
            tableClassName="whitespace-nowrap"
            columns={columns}
            data={data?.data ?? []}
            loading={isPending}
            emptyMessage="لا توجد دفعات لعرضها"
          />
          {data && (
            <Pagination
              currentPage={data.pageNumber}
              totalPages={Math.max(1, data.totalPages)}
              pageSize={data.pageSize}
              onPageChange={setPageNumber}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPageNumber(1);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MediconsultPayablesPage;
