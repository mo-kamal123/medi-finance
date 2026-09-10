import { useMemo, useState } from 'react';
import { Download, FileText, RotateCcw, Scale } from 'lucide-react';
import DateInput from '../../../../../shared/ui/date-input';
import Pagination from '../../../../../shared/ui/pagination';
import Table from '../../../../../shared/ui/table';
import PageLoader from '../../../../../shared/ui/page-loader';
import { formatCurrency } from '../../../../../shared/utils/formatters';
import { useBankBalances } from '../hooks/bank-balances.queries';
import { useBankBalancesExport } from '../hooks/use-bank-balances-export';

const DEFAULT_FILTERS = {
  fromDate: '',
  toDate: '',
  pageNumber: 1,
  pageSize: 50,
};

const BankBalancesPage = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { handleExport, isExporting } = useBankBalancesExport();

  const queryParams = useMemo(
    () => ({
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    }),
    [filters]
  );

  const { data: response, isLoading, isFetching } = useBankBalances(queryParams);

  const balances = useMemo(() => response?.data ?? [], [response?.data]);
  const totalOpening = Number(response?.totalOpening) || 0;
  const totalIncoming = Number(response?.totalIncoming) || 0;
  const totalOutgoing = Number(response?.totalOutgoing) || 0;
  const totalClosing = Number(response?.totalClosing) || 0;
  const totalCount = Number(response?.totalCount) || balances.length;
  const totalPages = Math.max(
    Math.ceil(totalCount / Math.max(Number(filters.pageSize) || 50, 1)),
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
      { header: 'البنك', key: 'bankNameAr' },
      {
        header: 'رقم الحساب',
        key: 'accountNumber',
        type: 'custom',
        render: (row) => (
          <span dir="ltr" className="font-mono text-sm">
            {row.accountNumber || '-'}
          </span>
        ),
      },
      {
        header: 'العملة',
        key: 'currencyCode',
        type: 'custom',
        render: (row) => row.currencyCode || '-',
      },
      {
        header: 'رصيد افتتاحي',
        key: 'openingBalance',
        type: 'custom',
        render: (row) => (
          <span className="font-semibold text-gray-900" dir="ltr">
            {formatCurrency(row.openingBalance)}
          </span>
        ),
      },
      {
        header: 'إجمالي وارد',
        key: 'totalIncoming',
        type: 'custom',
        render: (row) => (
          <span className="font-semibold text-emerald-700" dir="ltr">
            {formatCurrency(row.totalIncoming)}
          </span>
        ),
      },
      {
        header: 'إجمالي صادر',
        key: 'totalOutgoing',
        type: 'custom',
        render: (row) => (
          <span className="font-semibold text-red-600" dir="ltr">
            {formatCurrency(row.totalOutgoing)}
          </span>
        ),
      },
      {
        header: 'الرصيد الختامي',
        key: 'closingBalance',
        type: 'custom',
        render: (row) => (
          <span className="font-bold text-primary" dir="ltr">
            {formatCurrency(row.closingBalance)}
          </span>
        ),
      },
    ],
    []
  );

  const tableFooter = (
    <tr>
      <td className="p-3 text-base font-bold text-gray-900">الإجمالي</td>
      <td />
      <td />
      <td className="p-3 text-base font-bold text-gray-900" dir="ltr">
        {formatCurrency(totalOpening)}
      </td>
      <td className="p-3 text-base font-bold text-emerald-700" dir="ltr">
        {formatCurrency(totalIncoming)}
      </td>
      <td className="p-3 text-base font-bold text-red-600" dir="ltr">
        {formatCurrency(totalOutgoing)}
      </td>
      <td className="p-3 text-base font-bold text-primary" dir="ltr">
        {formatCurrency(totalClosing)}
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Scale size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">أرصدة البنوك</h1>
            <p className="mt-1 text-sm text-gray-500">
              عرض أرصدة البنوك الافتتاحية والختامية وإجمالي الوارد والصادر خلال الفترة
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DateInput
            label="من تاريخ"
            value={filters.fromDate || ''}
            onChange={(event) => handleChange('fromDate', event.target.value)}
          />

          <DateInput
            label="إلى تاريخ"
            value={filters.toDate || ''}
            onChange={(event) => handleChange('toDate', event.target.value)}
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">إجمالي الرصيد الافتتاحي</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(totalOpening)}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">إجمالي الوارد</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {formatCurrency(totalIncoming)}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">إجمالي الصادر</div>
          <div className="mt-2 text-2xl font-bold text-red-600">
            {formatCurrency(totalOutgoing)}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">الرصيد الختامي</div>
          <div className="mt-2 text-2xl font-bold text-primary">
            {formatCurrency(totalClosing)}
          </div>
        </div>
      </div>

      {isLoading ? (
        <PageLoader label="جاري تحميل أرصدة البنوك..." />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <Table
              columns={columns}
              data={balances}
              loading={isFetching}
              footer={balances.length > 0 ? tableFooter : null}
              emptyMessage="لا توجد أرصدة لعرضها"
            />
          </div>

          <Pagination
            currentPage={Number(filters.pageNumber) || 1}
            totalPages={totalPages}
            pageSize={Number(filters.pageSize) || 50}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
};

export default BankBalancesPage;