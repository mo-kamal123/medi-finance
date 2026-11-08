import KpiCard from '../../../../../shared/ui/kpi-card';
import { useMemo } from 'react';
import { Banknote, Download } from 'lucide-react';
import PageLoader from '../../../../../shared/ui/page-loader';
import {
  formatCurrency,
  formatNumber,
} from '../../../../../shared/utils/formatters';
import { useBankChequesSummary } from '../hooks/bank-cheques-summary.queries';
import { useBankChequesSummaryExport } from '../hooks/use-bank-cheques-summary-export';

const SummaryCard = ({ label, count, amount, countTone, amountTone, icon }) => (
  <KpiCard
    label={label}
    value={formatNumber(count)}
    tone={countTone}
    icon={icon}
    secondary={<span dir="ltr" className={amountTone}>{formatCurrency(amount)}</span>}
  />
);

const ChequesSummarySection = ({ bankId }) => {
  const { handleExport, isExporting } = useBankChequesSummaryExport();

  const queryParams = useMemo(() => ({ bankId }), [bankId]);

  const { data: summary, isLoading } = useBankChequesSummary(queryParams);

  if (!bankId) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">ملخص الشيكات</h2>
        <button
          type="button"
          onClick={() => handleExport(queryParams)}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
        >
          <Download size={16} />
          {isExporting ? 'جاري التصدير...' : 'تصدير الملخص'}
        </button>
      </div>

      {isLoading ? (
        <PageLoader label="جاري تحميل ملخص الشيكات..." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="إجمالي الشيكات"
            count={Number(summary?.totalCheques) || 0}
            amount={Number(summary?.totalAmount) || 0}
            countTone="text-primary"
            amountTone="text-gray-600"
            icon={Banknote}
          />
          <SummaryCard
            label="الشيكات المحصلة"
            count={Number(summary?.collectedCount) || 0}
            amount={Number(summary?.collectedAmount) || 0}
            countTone="text-emerald-700"
            amountTone="text-emerald-700"
            icon={Banknote}
          />
          <SummaryCard
            label="الشيكات المعلقة"
            count={Number(summary?.pendingCount) || 0}
            amount={Number(summary?.pendingAmount) || 0}
            countTone="text-amber-600"
            amountTone="text-amber-600"
            icon={Banknote}
          />
          <SummaryCard
            label="الشيكات المرتجعة"
            count={Number(summary?.returnedCount) || 0}
            amount={Number(summary?.returnedAmount) || 0}
            countTone="text-red-600"
            amountTone="text-red-600"
            icon={Banknote}
          />
        </div>
      )}
    </div>
  );
};

export default ChequesSummarySection;
