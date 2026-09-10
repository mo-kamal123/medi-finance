import { useMemo, useState } from 'react';
import { Banknote, Download, RotateCcw } from 'lucide-react';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import PageLoader from '../../../../../shared/ui/page-loader';
import { formatCurrency, formatNumber } from '../../../../../shared/utils/formatters';
import { useBanks } from '../../../../banking/banks/hooks/banks.queries';
import { useBankChequesSummary } from '../hooks/bank-cheques-summary.queries';
import { useBankChequesSummaryExport } from '../hooks/use-bank-cheques-summary-export';

const DEFAULT_FILTERS = {
  bankId: '',
};

const SummaryCard = ({
  label,
  count,
  amount,
  countTone,
  amountTone,
  iconClass,
  icon,
}) => {
  const CardIcon = icon;
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className={`mt-2 text-3xl font-bold ${countTone}`}>
            {formatNumber(count)}
          </div>
          <div className={`mt-1 text-sm font-semibold ${amountTone}`}>
            {formatCurrency(amount)}
          </div>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <CardIcon size={20} />
        </div>
      </div>
    </div>
  );
};

const BankChequesSummaryPage = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { handleExport, isExporting } = useBankChequesSummaryExport();

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
      bankId: filters.bankId,
    }),
    [filters]
  );

  const { data: summary, isLoading } = useBankChequesSummary(queryParams);

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Banknote size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ملخص الشيكات</h1>
            <p className="mt-1 text-sm text-gray-500">
              ملخص إجماليات الشيكات حسب البنك (محصلة، معلقة، مرتجعة)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleExport(queryParams)}
          disabled={isExporting || !filters.bankId}
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
            value={filters.bankId || ''}
            onChange={(event) => handleChange('bankId', event.target.value)}
            placeholder="اختر البنك..."
            options={bankOptions}
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setFilters({ ...DEFAULT_FILTERS })}
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            <RotateCcw size={16} />
            مسح الفلاتر
          </button>
        </div>
      </div>

      {isLoading ? (
        <PageLoader label="جاري تحميل ملخص الشيكات..." />
      ) : summary && filters.bankId ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="إجمالي الشيكات"
            count={Number(summary.totalCheques) || 0}
            amount={Number(summary.totalAmount) || 0}
            countTone="text-primary"
            amountTone="text-gray-600"
            iconClass="bg-primary/10 text-primary"
            icon={Banknote}
          />
          <SummaryCard
            label="الشيكات المحصلة"
            count={Number(summary.collectedCount) || 0}
            amount={Number(summary.collectedAmount) || 0}
            countTone="text-emerald-700"
            amountTone="text-emerald-700"
            iconClass="bg-emerald-100 text-emerald-700"
            icon={Banknote}
          />
          <SummaryCard
            label="الشيكات المعلقة"
            count={Number(summary.pendingCount) || 0}
            amount={Number(summary.pendingAmount) || 0}
            countTone="text-amber-600"
            amountTone="text-amber-600"
            iconClass="bg-amber-100 text-amber-600"
            icon={Banknote}
          />
          <SummaryCard
            label="الشيكات المرتجعة"
            count={Number(summary.returnedCount) || 0}
            amount={Number(summary.returnedAmount) || 0}
            countTone="text-red-600"
            amountTone="text-red-600"
            iconClass="bg-red-100 text-red-600"
            icon={Banknote}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white p-16 text-center text-gray-400 shadow-sm">
          اختر بنكاً لعرض ملخص الشيكات
        </div>
      )}
    </div>
  );
};

export default BankChequesSummaryPage;