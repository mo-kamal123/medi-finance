import { useMemo, useState } from 'react';
import { Download, Wallet, RotateCcw } from 'lucide-react';
import DateInput from '../../../../../shared/ui/date-input';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import Table from '../../../../../shared/ui/table';
import PageLoader from '../../../../../shared/ui/page-loader';
import { formatCurrency } from '../../../../../shared/utils/formatters';
import { useBanks } from '../../../../banking/banks/hooks/banks.queries';
import { useBankCashFlow } from '../hooks/cash-flow.queries';
import { useBankCashFlowExport } from '../hooks/use-cash-flow-export';

const DEFAULT_FILTERS = {
  bankID: '',
  fromDate: '',
  toDate: '',
};

const INCOMING_FIELDS = [
  { key: 'customerReceipts', header: 'إيرادات عملاء' },
  { key: 'deposits', header: 'إيداعات' },
  { key: 'transfersIn', header: 'تحويلات داخلة' },
  { key: 'chequeCollections', header: 'تحصيل شيكات' },
  { key: 'other', header: 'إيرادات أخرى' },
  { key: 'total', header: 'إجمالي الوارد' },
];

const OUTGOING_FIELDS = [
  { key: 'supplierPayments', header: 'مدفوعات موردين' },
  { key: 'transfersOut', header: 'تحويلات خارجة' },
  { key: 'bankCharges', header: 'رسوم بنكية' },
  { key: 'chequePayments', header: 'دفع شيكات' },
  { key: 'other', header: 'صادرات أخرى' },
  { key: 'total', header: 'إجمالي الصادر' },
];

const amountCell = (value, tone, bold = false) => (
  <span
    className={bold ? 'font-bold' : 'font-medium'}
    style={{ color: tone }}
    dir="ltr"
  >
    {formatCurrency(value)}
  </span>
);

const CashFlowPage = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { handleExport, isExporting } = useBankCashFlowExport();

  const { data: banks = [] } = useBanks({ pageSize: 100 });

  const bankOptions = useMemo(
    () =>
      (Array.isArray(banks) ? banks : []).map((bank) => ({
        value: String(bank.bankID || bank.id),
        label: bank.bankNameAr || bank.bankNameEn || String(bank.bankID || bank.id),
      })),
    [banks]
  );

  const queryParams = useMemo(
    () => ({
      bankID: filters.bankID,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    }),
    [filters]
  );

  const { data: response, isLoading, isFetching } = useBankCashFlow(queryParams);

  const rows = useMemo(() => response?.data ?? [], [response?.data]);
  const totalInflows = Number(response?.totalInflows) || 0;
  const totalOutflows = Number(response?.totalOutflows) || 0;
  const netCashFlow = Number(response?.netCashFlow) || 0;

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  const columns = useMemo(() => {
    const incomingCols = INCOMING_FIELDS.map((field) => ({
      header: field.header,
      key: `incoming.${field.key}`,
      type: 'custom',
      render: (row) =>
        amountCell(
          row.incoming?.[field.key],
          '#059669',
          field.key === 'total'
        ),
    }));

    const outgoingCols = OUTGOING_FIELDS.map((field) => ({
      header: field.header,
      key: `outgoing.${field.key}`,
      type: 'custom',
      render: (row) =>
        amountCell(
          row.outgoing?.[field.key],
          '#dc2626',
          field.key === 'total'
        ),
    }));

    return [
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
      { header: 'العملة', key: 'currencyCode' },
      {
        header: 'رصيد افتتاحي',
        key: 'openingBalance',
        type: 'custom',
        render: (row) => amountCell(row.openingBalance, '#1f2937'),
      },
      ...incomingCols,
      ...outgoingCols,
      {
        header: 'صافي التدفق النقدي',
        key: 'netCashFlow',
        type: 'custom',
        render: (row) =>
          amountCell(
            row.netCashFlow,
            Number(row.netCashFlow) >= 0 ? '#059669' : '#dc2626',
            true
          ),
      },
      {
        header: 'الرصيد الختامي',
        key: 'closingBalance',
        type: 'custom',
        render: (row) => amountCell(row.closingBalance, 'var(--color-primary)', true),
      },
    ];
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">التدفقات النقدية</h1>
            <p className="mt-1 text-sm text-gray-500">
              تحليل الحركات النقدية الداخلة والخارجة للبنوك خلال فترة محددة
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleExport(queryParams)}
          disabled={isExporting || !filters.bankID}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Download size={16} />
          {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
        </button>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SearchableSelect
            label="البنك"
            value={filters.bankID || ''}
            onChange={(event) => handleChange('bankID', event.target.value)}
            placeholder="اختر البنك..."
            options={bankOptions}
          />

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

      {filters.bankID && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">إجمالي الوارد</div>
            <div className="mt-2 text-2xl font-bold text-emerald-700">
              {formatCurrency(totalInflows)}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">إجمالي الصادر</div>
            <div className="mt-2 text-2xl font-bold text-red-600">
              {formatCurrency(totalOutflows)}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">صافي التدفق النقدي</div>
            <div
              className={`mt-2 text-2xl font-bold ${
                netCashFlow >= 0 ? 'text-primary' : 'text-red-600'
              }`}
            >
              {formatCurrency(netCashFlow)}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <PageLoader label="جاري تحميل التدفقات النقدية..." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <Table
            columns={columns}
            data={rows}
            loading={isFetching}
            emptyMessage={
              filters.bankID
                ? 'لا توجد بيانات لعرضها'
                : 'اختر بنكاً لعرض التدفقات النقدية'
            }
          />
        </div>
      )}
    </div>
  );
};

export default CashFlowPage;