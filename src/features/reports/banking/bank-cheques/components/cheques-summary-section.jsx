import { useMemo } from 'react';
import { Banknote, Download } from 'lucide-react';
import PageLoader from '../../../../../shared/ui/page-loader';
import {
  formatCurrency,
  formatNumber,
} from '../../../../../shared/utils/formatters';
import { useBankChequesSummary } from '../hooks/bank-cheques-summary.queries';
import { useBankChequesSummaryExport } from '../hooks/use-bank-cheques-summary-export';

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
    <div className="rounded-xl border border-gray-200 bg-white p-5">
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
            iconClass="bg-primary/10 text-primary"
            icon={Banknote}
          />
          <SummaryCard
            label="الشيكات المحصلة"
            count={Number(summary?.collectedCount) || 0}
            amount={Number(summary?.collectedAmount) || 0}
            countTone="text-emerald-700"
            amountTone="text-emerald-700"
            iconClass="bg-emerald-100 text-emerald-700"
            icon={Banknote}
          />
          <SummaryCard
            label="الشيكات المعلقة"
            count={Number(summary?.pendingCount) || 0}
            amount={Number(summary?.pendingAmount) || 0}
            countTone="text-amber-600"
            amountTone="text-amber-600"
            iconClass="bg-amber-100 text-amber-600"
            icon={Banknote}
          />
          <SummaryCard
            label="الشيكات المرتجعة"
            count={Number(summary?.returnedCount) || 0}
            amount={Number(summary?.returnedAmount) || 0}
            countTone="text-red-600"
            amountTone="text-red-600"
            iconClass="bg-red-100 text-red-600"
            icon={Banknote}
          />
        </div>
      )}
    </div>
  );
};

export default ChequesSummarySection;
