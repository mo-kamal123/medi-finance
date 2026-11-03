import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Breadcrumb from '../../../../../shared/ui/breadcrumb';
import DateInput from '../../../../../shared/ui/date-input';
import FormInput from '../../../../../shared/ui/input';
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
    render: (row) => displayAmount(row.originalAmount),
  },
  {
    header: 'المبلغ المتبقي',
    key: 'remainingAmount',
    type: 'custom',
    render: (row) => displayAmount(row.remainingAmount),
  },
  {
    header: 'حالة الدفع',
    key: 'paymentStatusName',
    type: 'custom',
    render: (row) => row.paymentStatusName || row.paymentStatus || '—',
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
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'التقارير' }, { label: title }]} />
      <header className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold">{data?.reportName || title}</h1>
        {data && (
          <p className="mt-1 text-sm text-gray-600">
            عدد الدفعات: {formatNumber(data.totalCount)}
          </p>
        )}
      </header>
      <form
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (invalidDateRange) return;
          setPageNumber(1);
          setFilters(draft);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DateInput label="من تاريخ" {...filterField('FromDate')} />
          <DateInput
            label="إلى تاريخ"
            {...filterField('ToDate')}
            error={
              invalidDateRange
                ? 'تاريخ النهاية يجب أن يكون في تاريخ البداية أو بعده'
                : undefined
            }
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              المورد
            </label>
            <PartySearchSelect
              type="supplier"
              placeholder="ابحث باسم المورد"
              {...filterField('SupplierId')}
            />
          </div>
          <SearchableSelect
            label="حالة الدفع"
            placeholder="جميع الحالات"
            options={paymentStatuses}
            {...filterField('PaymentStatus')}
          />
          {textFilters.map(([key, label]) => (
            <FormInput
              key={key}
              label={label}
              aria-label={label}
              placeholder={`أدخل ${label}`}
              {...filterField(key)}
            />
          ))}
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
            onClick={() => {
              setDraft({});
              setFilters({});
              setPageNumber(1);
            }}
          >
            مسح الفلاتر
          </button>
          <button
            type="submit"
            disabled={Boolean(invalidDateRange)}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            تطبيق الفلاتر
          </button>
        </div>
      </form>
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
