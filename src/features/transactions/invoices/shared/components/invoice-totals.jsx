import KpiCard from '../../../../../shared/ui/kpi-card';
// Totals cards + submit button.

import { formatCurrency } from '../utils/format-currency';

const InvoiceTotals = ({
  totalAmount,
  totalDiscounts,
  netAmount,
  isLoading,
  disabled,
  showSummary = true,
}) => (
  <div className="space-y-4">
    {showSummary && (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard label="إجمالي الفاتورة" value={formatCurrency(totalAmount)} tone="text-gray-900" />

        <KpiCard label="إجمالي الخصومات" value={formatCurrency(totalDiscounts)} tone="text-red-500" />

        <KpiCard label="صافي الفاتورة" value={formatCurrency(netAmount)} tone="text-primary" />
      </div>
    )}

    <div className="flex justify-end">
      <button
        type="submit"
        disabled={isLoading || disabled}
        className="px-8 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50"
      >
        حفظ الفاتورة
      </button>
    </div>
  </div>
);

export default InvoiceTotals;
