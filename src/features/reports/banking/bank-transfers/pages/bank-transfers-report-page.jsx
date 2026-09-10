import { useMemo, useState } from 'react';
import { Download, FileText, RotateCcw } from 'lucide-react';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import Pagination from '../../../../../shared/ui/pagination';
import Table from '../../../../../shared/ui/table';
import PageLoader from '../../../../../shared/ui/page-loader';
import { formatCurrency, formatDate } from '../../../../../shared/utils/formatters';
import { useBankTransfersReport } from '../hooks/bank-transfers.queries';
import { useBankTransfersReportExport } from '../hooks/use-bank-transfers-report-export';

const DEFAULT_FILTERS = {
  transferType: '',
  pageNumber: 1,
  pageSize: 20,
};

const TRANSFER_TYPE_OPTIONS = [
  { value: '', label: 'كل الأنواع' },
  { value: 'internal', label: 'تحويل داخلي' },
  { value: 'external', label: 'تحويل خارجي' },
];

const TRANSFER_TYPE_LABELS = {
  internal: 'تحويل داخلي',
  external: 'تحويل خارجي',
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

const getStatusBadge = (status, statusName) => (
  <span
    className={`rounded-full px-3 py-1 text-xs font-medium ${
      STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'
    }`}
  >
    {STATUS_LABELS[status] || statusName || status || '-'}
  </span>
);

const BankTransfersReportPage = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { handleExport, isExporting } = useBankTransfersReportExport();

  const queryParams = useMemo(
    () => ({
      transferType: filters.transferType,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    }),
    [filters]
  );

  const { data: response, isLoading, isFetching } = useBankTransfersReport(
    queryParams
  );

  const transfers = useMemo(() => response?.data ?? [], [response?.data]);
  const totalCount = Number(response?.totalCount) || transfers.length;
  const totalPages = Number(response?.totalPages) || Math.max(
    Math.ceil(totalCount / Math.max(Number(filters.pageSize) || 20, 1)),
    1
  );

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, pageNumber: 1 }));
  };

  const handleReset = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  const handlePageSizeChange = (value) => {
    setFilters((prev) => ({ ...prev, pageSize: value, pageNumber: 1 }));
  };

  const columns = useMemo(
    () => [
      { header: 'رقم التحويل', key: 'transferNumber' },
      {
        header: 'النوع',
        key: 'transferTypeName',
        type: 'custom',
        render: (row) => (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              row.transferType === 'internal'
                ? 'bg-sky-100 text-sky-700'
                : 'bg-violet-100 text-violet-700'
            }`}
          >
            {TRANSFER_TYPE_LABELS[row.transferType] ||
              row.transferTypeName ||
              '-'}
          </span>
        ),
      },
      {
        header: 'حساب المصدر',
        key: 'bankAccountName',
        type: 'custom',
        render: (row) =>
          row.fromBankNameAr || row.bankAccountName || '-',
      },
      {
        header: 'حساب الوجهة',
        key: 'toBankAccountName',
        type: 'custom',
        render: (row) =>
          row.toBankNameAr || row.toBankAccountName || '-',
      },
      {
        header: 'التاريخ',
        key: 'transferDate',
        type: 'custom',
        render: (row) => formatDate(row.transferDate),
      },
      {
        header: 'المبلغ',
        key: 'localAmount',
        type: 'custom',
        render: (row) => (
          <span
            className="inline-flex items-center gap-1 font-semibold text-gray-900"
            dir="ltr"
          >
            {formatCurrency(row.localAmount ?? row.amount)}
            <span className="text-xs font-normal text-gray-400">
              {row.currencyName}
            </span>
          </span>
        ),
      },
      { header: 'البيان', key: 'descriptionAr' },
      {
        header: 'رقم الشيك',
        key: 'chequeNumber',
        type: 'custom',
        render: (row) => row.chequeNumber || '-',
      },
      {
        header: 'القيد اليومي',
        key: 'journalEntryNumber',
        type: 'custom',
        render: (row) => row.journalEntryNumber || '-',
      },
      {
        header: 'الحالة',
        key: 'statusName',
        type: 'custom',
        render: (row) => getStatusBadge(row.status, row.statusName),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">التحويلات البنكية</h1>
            <p className="mt-1 text-sm text-gray-500">
              عرض التحويلات البنكية بين الحسابات والأطراف الخارجية
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleExport(queryParams)}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Download size={16} />
          {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
        </button>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SearchableSelect
            label="نوع التحويل"
            value={filters.transferType || ''}
            onChange={(event) => handleChange('transferType', event.target.value)}
            placeholder="كل الأنواع"
            options={TRANSFER_TYPE_OPTIONS}
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            <RotateCcw size={16} />
            مسح الفلاتر
          </button>
        </div>
      </div>

      {isLoading ? (
        <PageLoader label="جاري تحميل التحويلات البنكية..." />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <Table
              columns={columns}
              data={transfers}
              loading={isFetching}
              emptyMessage="لا توجد تحويلات لعرضها"
            />
          </div>

          <Pagination
            currentPage={Number(filters.pageNumber) || 1}
            totalPages={totalPages}
            pageSize={Number(filters.pageSize) || 20}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
};

export default BankTransfersReportPage;